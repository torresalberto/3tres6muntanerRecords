/**
 * DJ Library — "Cabina 3TRES6" (Variant B) page logic.
 * Set-centric ranked console: rail filters, compact set list,
 * inline console detail (player + seekable timeline) and a pinned
 * now-playing bar. Data layer shared via js/dj-library-core.js.
 */
(function () {
  'use strict';

  const Core = window.DJCore;
  if (!Core) {
    console.error('DJ Library core missing');
    return;
  }

  const state = { query: '', genre: '', sort: 'recent', openId: null };
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  async function init() {
    try {
      await Core.init();
    } catch (e) {
      console.error('DJ data load error:', e);
      $('#setList').innerHTML = '<p class="cabina-lede">No se pudo cargar la cabina.</p>';
      return;
    }
    renderCounters();
    renderGenres();
    renderList();
    wireTools();
    wireBar();
    renderGraph();
  }

  function renderCounters() {
    const ag = Core.stats.aggregates || {};
    const data = [
      ['Sets', ag.sets || 0],
      ['Tracks', ag.tracks || 0],
      ['Horas', ag.hours || 0],
      ['Completados', (ag.completion_rate || 0) + '%'],
    ];
    $('#cabinaCounters').innerHTML = data
      .map(([label, value]) => `<span class="stat-pill"><strong>${value}</strong> ${label}</span>`)
      .join('');
  }

  function renderGenres() {
    const genres = Core.stats.genres || [];
    const box = $('#railGenres');
    const chip = (g, n) =>
      `<button class="genre-chip" data-genre="${Core.esc(g)}" aria-pressed="false">${Core.esc(g)} <em>${n}</em></button>`;
    box.innerHTML = [
      chip('Todas', Core.stats.sets.length),
      ...genres.slice(0, 12).map((g) => chip(g.genre, g.count)),
    ].join('');
    box.querySelectorAll('.genre-chip').forEach((btn) =>
      btn.addEventListener('click', () => {
        state.genre = btn.dataset.genre === 'Todas' ? '' : btn.dataset.genre;
        box.querySelectorAll('.genre-chip').forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', on);
        });
        renderList();
      })
    );
    box.querySelector('.genre-chip').classList.add('is-on');
  }

  function wireTools() {
    $('#cabinaSearch').addEventListener('input', (e) => {
      state.query = e.target.value.trim().toLowerCase();
      renderList();
    });
    $('#cabinaSort').addEventListener('change', (e) => {
      state.sort = e.target.value;
      renderList();
    });
  }

  function sortedSets() {
    let list = (Core.stats.sets || []).slice();
    if (state.query) {
      list = list.filter((s) => {
        const hay = [s.dj_name, s.title, s.venue, s.genres.join(' '), s.id].join(' ').toLowerCase();
        return hay.includes(state.query);
      });
    }
    if (state.genre) list = list.filter((s) => (s.genres || []).includes(state.genre));
    switch (state.sort) {
      case 'name':
        list.sort((a, b) => a.dj_name.localeCompare(b.dj_name) || a.date.localeCompare(b.date));
        break;
      case 'plays':
        list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'duration':
        list.sort((a, b) => (b.duration_minutes || 0) - (a.duration_minutes || 0));
        break;
      case 'completion':
        list.sort((a, b) => (b.completion_rate || 0) - (a.completion_rate || 0));
        break;
      default:
        list.sort(
          (a, b) =>
            String(b.date || '').localeCompare(String(a.date || '')) ||
            a.dj_name.localeCompare(b.dj_name)
        );
    }
    return list;
  }

  function renderList() {
    const box = $('#setList');
    const list = sortedSets();
    if (!list.length) {
      box.innerHTML = '<p class="cabina-lede">Sin resultados para ese filtro.</p>';
      return;
    }
    box.innerHTML = list
      .map((s) => {
        const badges = [];
        badges.push(
          `<span class="cb-badge ${s.completion_rate === 100 ? 'is-ok' : ''}">${s.completion_rate}%</span>`
        );
        if (s.labels) badges.push(`<span class="cb-badge">${s.labels} labels</span>`);
        if (s.requested_ids)
          badges.push(`<span class="cb-badge is-hot">🔥 ${s.requested_ids}</span>`);
        const meta = [
          s.venue,
          s.date,
          s.duration_formatted,
          s.view_count ? Core.fmtViews(s.view_count) + ' plays' : '',
        ]
          .filter(Boolean)
          .join(' · ');
        return `
        <div class="cabina-row ${state.openId === s.id ? 'is-open' : ''}" data-set="${Core.esc(s.id)}" tabindex="0" role="button" aria-expanded="${state.openId === s.id}">
          <span class="cb-num">${Core.esc(s.catalog)}</span>
          <span class="cb-main">
            <span class="cb-dj">${Core.esc(s.dj_name)}</span>
            <span class="cb-title">${Core.esc(s.title)}</span>
            <span class="cb-meta">${Core.esc(meta)}</span>
          </span>
          <span class="cb-right">${badges.join('')}<span class="cb-play">▶</span></span>
        </div>`;
      })
      .join('');
  }

  // ---------------------------------------------------------------- console

  async function openSet(setId) {
    const row = document.querySelector(`.cabina-row[data-set="${CSS.escape(setId)}"]`);
    if (!row) return;
    const set = await Core.fetchSet(setId).catch(() => null);
    if (!set) return;

    const isSame = state.openId === setId;
    closeDetail();
    state.openId = isSame ? null : setId;
    row.classList.toggle('is-open', state.openId === setId);
    row.setAttribute('aria-expanded', Boolean(state.openId));
    if (!state.openId) {
      clearNow();
      return;
    }

    const detail = document.createElement('div');
    detail.className = 'cabina-detail';
    row.after(detail);
    detail.innerHTML = renderDetail(set);
    wireDetail(detail, set);

    setNow(set);
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderDetail(set) {
    const total = (set.tracklist || []).length;
    return `
      <div class="cd-player" id="cdPlayer"><iframe src="${Core.seekSrc(set, (set.tracklist && set.tracklist[0] && (set.tracklist[0].timestamp || set.tracklist[0].time)) || '')}" title="Reproductor YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
      <div class="cd-chips">${Core.buildMetaChips(set)}<span class="set-chip">${Core.esc((set.tracklist || []).length)} tracks</span></div>
      <ol class="tl">${Core.buildTracklist(set)}</ol>
      <div class="cd-extras">${Core.buildRequested(set)}${Core.buildFacts(set)}</div>`;
  }

  function wireDetail(detail, set) {
    detail.addEventListener('click', (e) => {
      const row = e.target.closest('[data-seek]');
      if (!row) return;
      e.preventDefault();
      const frame = detail.querySelector('#cdPlayer iframe');
      if (frame) frame.src = Core.seekSrc(set, row.dataset.seek);
    });
  }

  function setNow(set) {
    const bar = $('#nowBar');
    bar.classList.add('is-on');
    const dj = Core.djById(set.dj_id);
    $('#nowDj').textContent = (dj && dj.name) || set.dj_id || '';
    $('#nowTitle').textContent = set.title || '';
    const reqs = {};
    (set.most_requested_ids || []).forEach((r) => (reqs[r.timestamp] = true));
    const chips = (set.tracklist || [])
      .map((t) => {
        const ts = t.timestamp || t.time || '';
        if (!ts) return '';
        return `<button class="now-chip ${reqs[ts] ? 'is-req' : ''}" data-seek="${Core.esc(ts)}">${Core.esc(ts)}</button>`;
      })
      .filter(Boolean);
    $('#nowScrub').innerHTML = chips.join('') || '<span class="now-chip">—</span>';
  }

  function clearNow() {
    $('#nowBar').classList.remove('is-on');
    $('#nowScrub').innerHTML = '';
  }

  function wireBar() {
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('.cabina-row[data-set]');
      if (opener) {
        openSet(opener.dataset.set);
        return;
      }
      const seeker = e.target.closest('#nowScrub .now-chip[data-seek]');
      if (seeker && state.openId) {
        const set = Core.setCache[state.openId];
        const frame = document.querySelector('#cdPlayer iframe');
        if (set && frame) frame.src = Core.seekSrc(set, seeker.dataset.seek);
      }
      if (e.target.closest('.now-close')) {
        if (state.openId) {
          closeDetail();
          state.openId = null;
        }
        clearNow();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (
        e.target.classList &&
        e.target.classList.contains('cabina-row') &&
        (e.key === 'Enter' || e.key === ' ')
      ) {
        e.preventDefault();
        openSet(e.target.dataset.set);
      }
    });
  }

  function closeDetail() {
    document.querySelector('.cabina-detail')?.remove();
    $$('.cabina-row.is-open').forEach((r) => {
      r.classList.remove('is-open');
      r.setAttribute('aria-expanded', 'false');
    });
    state.openId = null;
  }

  // ---------------------------------------------------------------- graph

  function renderGraph() {
    const box = $('#hiloGraph');
    const result = Core.initGraph(box);
    if (!result) return;
    const genres = (Core.stats.genres || []).map((g) => g.genre).slice(0, 8);
    const filterBox = $('#hiloFilters');
    filterBox.innerHTML = genres
      .map(
        (g, i) =>
          `<button class="genre-chip ${i === 0 ? 'is-on' : ''}" data-hilo-genre="${Core.esc(g)}">${Core.esc(g)}</button>`
      )
      .join('');
    filterBox.querySelectorAll('[data-hilo-genre]').forEach((btn) =>
      btn.addEventListener('click', () => {
        const g = btn.dataset.hiloGenre;
        filterBox.querySelectorAll('[data-hilo-genre]').forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', on);
        });
        result.nodes.forEach((n) => {
          const inGenre = (n.genres || []).includes(g);
          const node = document.querySelector(`.hilo-node[data-dj="${CSS.escape(n.id)}"]`);
          if (node) node.classList.toggle('is-dim', !inGenre);
        });
      })
    );
  }

  document.addEventListener('DOMContentLoaded', init);
})();
