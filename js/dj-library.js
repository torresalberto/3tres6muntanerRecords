/**
 * DJ Library — "Discoteca 3TRES6" (Variant A) page logic.
 * Renders hero counters, featured set, crate toolbar, sleeve grid,
 * set sheet (player + seekable timeline), editorial rows and El Hilo graph.
 * Data layer shared via js/dj-library-core.js (window.DJCore).
 */
(function () {
  'use strict';

  const Core = window.DJCore;
  if (!Core) {
    console.error('DJ Library core missing');
    return;
  }

  const state = { query: '', sort: 'recent' };
  let openDjId = null;
  let openSetId = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ---------------------------------------------------------------- init

  async function init() {
    try {
      await Core.init();
    } catch (e) {
      console.error('DJ data load error:', e);
      $('#sleeveGrid').innerHTML =
        '<div class="empty-state">No se pudo cargar el archivo sonoro.</div>';
      return;
    }
    renderCounters();
    renderFeatured();
    renderSleeves();
    renderEditorial();
    renderGraph();
    wireSheet();
    wireToolbar();
    handleDeepLink();
  }

  // Deep-link support: dj-library.html#set:<setId> opens a specific set sheet
  // (used by the Taller / Sets tool and Mapa popups). #dj:<id> opens that
  // DJ's first set sheet. Falls back silently if the set/dj is unknown.
  async function handleDeepLink() {
    const m = window.location.hash.match(/^#(set|dj):(.+)$/);
    if (!m) return;
    const [kind, raw] = [m[1], decodeURIComponent(m[2])];
    if (kind === 'dj') {
      const dj = Core.djById(raw);
      if (!dj) return;
      const sets = await Core.setsOf(dj);
      if (!sets.length) return;
      const sleeve = document.querySelector(`.sleeve[data-dj="${CSS.escape(dj.id)}"]`);
      if (sleeve) sleeve.scrollIntoView({ behavior: 'smooth', block: 'center' });
      openSheet(dj.id, sets[0].id);
      return;
    }
    const setId = raw;
    try {
      const set = await Core.fetchSet(setId);
      if (!set || !set.dj_id) return;
      const dj =
        Core.djById(set.dj_id) ||
        (Core.index && Core.index.djs.find((d) => (d.sets || []).includes(setId))) ||
        (Core.index && Core.index.djs.find((d) => d.id === setId));
      if (!dj) return;
      const sleeve = document.querySelector(`.sleeve[data-dj="${CSS.escape(dj.id)}"]`);
      if (sleeve) sleeve.scrollIntoView({ behavior: 'smooth', block: 'center' });
      openSheet(dj.id, setId);
    } catch (e) {
      console.warn('Deep-link set not found:', setId);
    }
  }

  function countUp(el, to) {
    const dur = 700;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function renderCounters() {
    const ag = Core.stats.aggregates || {};
    const data = [
      ['DJs', ag.djs || 0],
      ['Sets', ag.sets || 0],
      ['Tracks', ag.tracks || 0],
      ['Horas', ag.hours || 0],
      ['Conexiones', ag.connections || 0],
    ];
    $('#discCounters').innerHTML = data
      .map(
        ([label, value]) =>
          `<span class="stat-pill"><strong data-count="${value}">0</strong> ${label}</span>`
      )
      .join('');
    $$('#discCounters [data-count]').forEach((el) => countUp(el, parseFloat(el.dataset.count)));
  }

  function renderFeatured() {
    const f = Core.stats.featured;
    const box = $('#discFeatured');
    if (!f) {
      box.hidden = true;
      return;
    }
    const total = f.tracks_total || f.tracks_identified || 0;
    const known = f.tracks_identified || 0;
    const meta = [f.venue, f.date, f.duration_formatted, Core.fmtViews(f.view_count) + ' plays']
      .filter(Boolean)
      .join('  ·  ');
    const stats = [];
    if (total)
      stats.push(`<span class="feat-stat"><strong>${known}/${total} ✓</strong> confirmados</span>`);
    if (f.label_count)
      stats.push(`<span class="feat-stat"><strong>${f.label_count}</strong> labels</span>`);
    if (f.requested_ids)
      stats.push(
        `<span class="feat-stat is-hot"><strong>🔥 ${f.requested_ids}</strong> IDs pedidos</span>`
      );

    box.innerHTML = `
      <div class="disc-feat-head">
        <h2>Nueva llegada</h2>
        <span>${Core.esc(f.catalog || '')}</span>
      </div>
      <button class="feat-card" data-dj="${Core.esc(f.dj_id)}" aria-haspopup="dialog">
        <span class="feat-sleeve"><span class="feat-num">${Core.esc(f.catalog || '')}</span><img src="${Core.esc(f.image || '')}" alt="${Core.esc(f.dj_name)}" loading="eager"></span>
        <span class="feat-info">
          <span class="feat-name">${Core.esc(f.dj_name)}</span>
          <span class="feat-title">${Core.esc(f.title)}</span>
          <span class="feat-meta">${Core.esc(meta)}</span>
          <span class="feat-stats">${stats.join('')}</span>
          <span class="feat-play">▶ Abrir set</span>
        </span>
      </button>`;
  }

  // ---------------------------------------------------------------- toolbar

  function wireToolbar() {
    $('#crateSearch').addEventListener('input', (e) => {
      state.query = e.target.value.trim();
      renderSleeves();
    });
    $('#crateSort').addEventListener('change', (e) => {
      state.sort = e.target.value;
      renderSleeves();
    });
  }

  // ---------------------------------------------------------------- sleeves

  function filterRows() {
    const rows = (Core.stats.dj_rows || []).slice();
    const connByDj = {};
    (Core.stats.super_connectors || []).forEach((c) => (connByDj[c.dj_id] = c.connection_count));

    const search = state.query ? Core.search(state.query) : null;
    let list = rows.filter((dj) => {
      if (search) {
        const setMatch =
          (dj.sets || 0) > 0 &&
          (search.setIds || []).some((s) => {
            const djOfSet = Core.djById && Core.djById(s.djId);
            return djOfSet && djOfSet.id === dj.id;
          });
        if (!search.djIds.includes(dj.id) && !setMatch) return false;
      }
      return true;
    });

    if (state.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (state.sort === 'connections')
      list.sort((a, b) => (connByDj[b.id] || 0) - (connByDj[a.id] || 0));
    else
      list.sort(
        (a, b) =>
          String(b.latest_date || '').localeCompare(String(a.latest_date || '')) ||
          a.name.localeCompare(b.name)
      );

    return list;
  }

  function renderSleeves() {
    const grid = $('#sleeveGrid');
    const list = filterRows();
    if (!list.length) {
      grid.innerHTML =
        '<div class="empty-state">Sin resultados — cambia la búsqueda o el orden.</div>';
      return;
    }
    grid.innerHTML = list
      .map((dj) => {
        const img = dj.image
          ? `<img src="${Core.esc(dj.image)}" alt="${Core.esc(dj.name)}" loading="lazy" onerror="this.closest('.sleeve-art').classList.add('no-img');this.remove()">`
          : '';
        const rate = dj.completion_rate;
        return `
        <button class="sleeve" data-dj="${Core.esc(dj.id)}" aria-haspopup="dialog">
          <span class="sleeve-num">${Core.esc(Core.catalog(dj.id) || '')}</span>
          <span class="sleeve-art">${img}<span class="sleeve-disc" aria-hidden="true"></span></span>
          <span class="sleeve-body">
            <span class="sleeve-name">${Core.esc(dj.name)}</span>
            <span class="sleeve-stats">
              <span>${dj.sets} sets · ${dj.tracks} tracks · ${dj.hours || 0}h</span>
              <span class="sleeve-rate ${rate < 100 ? 'is-low' : ''}"><span class="rate-ring" ${Core.completionRing(rate)}>${rate}%</span></span>
            </span>
          </span>
        </button>`;
      })
      .join('');
  }

  // ---------------------------------------------------------------- sheet

  function wireSheet() {
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-dj]');
      if (opener) {
        openDjId = opener.dataset.dj;
        openSheet(openDjId, null);
        return;
      }
      if (e.target.closest('.set-sheet-close') || e.target.classList.contains('set-sheet-scrim'))
        closeSheet();
    });

    const tracklist = $('#setTracklist');
    if (tracklist) {
      tracklist.addEventListener('click', seekHandler);
      tracklist.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') seekHandler(e);
      });
    }
    $('#setExtras').addEventListener('click', seekHandler);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSheet();
    });
  }

  function seekHandler(e) {
    const row = e.target.closest('[data-seek]');
    if (!row || !openSetId) return;
    e.preventDefault();
    const set = Core.setCache[openSetId];
    if (!set) return;
    $('#setPlayer').innerHTML =
      `<iframe src="${Core.seekSrc(set, row.dataset.seek)}" title="Reproductor YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }

  async function openSheet(djId, preferredSetId) {
    const dj = Core.djById(djId);
    if (!dj) return;
    const sets = await Core.setsOf(dj);
    if (!sets.length) return;

    const activeId = preferredSetId || (sets.length ? sets[0].id : null);
    openSetId = activeId;

    const sheet = $('#setSheet');
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';

    const tabs =
      sets.length > 1
        ? `<div class="set-tabs">${sets
            .map(
              (s) =>
                `<button class="set-tab ${s.id === activeId ? 'is-on' : ''}" data-set="${Core.esc(s.id)}">${Core.esc(s.title.split(':')[0] || s.id)}</button>`
            )
            .join('')}</div>`
        : '';

    $('#setDj').textContent = `${dj.name} — ${Core.catalog(djId) || ''}`;
    $('#setTabs').innerHTML = tabs;
    $('#setTabs')
      .querySelectorAll('.set-tab')
      .forEach((btn) => btn.addEventListener('click', () => openSheet(djId, btn.dataset.set)));

    renderSetBody(activeId);
  }

  function renderSetBody(setId) {
    const set = Core.setCache[setId];
    if (!set) return;
    const total = (set.tracklist || []).length;
    const known = set.tracks_identified != null ? set.tracks_identified : total;

    $('#setTitle').textContent = set.title || setId;
    $('#setMeta').innerHTML =
      Core.buildMetaChips(set) +
      (total ? `<span class="set-chip"><strong>${known}/${total}</strong> confirmados</span>` : '');
    $('#setPlayer').innerHTML =
      `<iframe src="${Core.seekSrc(set, (set.tracklist && set.tracklist[0] && (set.tracklist[0].timestamp || set.tracklist[0].time)) || '')}" title="Reproductor YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    $('#setTracklistTitle').innerHTML = `Tracklist <span>${total} tracks</span>`;
    $('#setTracklist').innerHTML = Core.buildTracklist(set);
    $('#setExtras').innerHTML = Core.buildRequested(set) + Core.buildFacts(set);
  }

  function closeSheet() {
    $('#setSheet').hidden = true;
    document.body.style.overflow = '';
    openDjId = null;
    openSetId = null;
  }

  // ---------------------------------------------------------------- editorial

  function renderEditorial() {
    const topTracks = Core.stats.top_shared_tracks || [];
    const scroller = $('#edTopTracks');
    if (topTracks.length) {
      scroller.innerHTML = topTracks
        .map((t, i) => {
          const [artist, title] = String(t.track || '').split(' - ');
          return `
          <div class="ed-track">
            <span class="ed-rank">#${i + 1} · ${t.djs.length} DJs</span>
            <h4>${Core.esc(title || t.track)}</h4>
            <div class="ed-artist">${Core.esc(artist || '')}</div>
            <div class="ed-djs">${t.djs
              .slice(0, 6)
              .map((d) => `<span>${Core.esc(d)}</span>`)
              .join('')}</div>
          </div>`;
        })
        .join('');
    }

    const labels = Core.stats.label_clout || [];
    $('#edLabels').innerHTML = labels.length
      ? `<ol>${labels.map((l) => `<li><span>${Core.esc(l.label)}</span><em>${l.tracks} tracks · ${l.djs.length} DJs</em></li>`).join('')}</ol>`
      : '<p class="ed-sub">Aún con pocos datos de labels.</p>';

    const venues = Core.stats.venues || [];
    $('#edVenues').innerHTML = venues.length
      ? `<ol>${venues.map((v) => `<li><span>${Core.esc(v.venue)}</span><em>${v.djs.length} DJs · ${v.sets} sets</em></li>`).join('')}</ol>`
      : '<p class="ed-sub">Redes de venues en construcción.</p>';
  }

  // ---------------------------------------------------------------- graph

  function renderGraph() {
    const box = $('#hiloGraph');
    const result = Core.initGraph(box);
    if (!result) return;

    document
      .querySelectorAll('.hilo-node')
      .forEach((n, i) => n.setAttribute('data-dj', result.nodes[i].id));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
