/**
 * DJ Library Core — shared data layer + renderers for BOTH DJ Library designs
 * (Discoteca 3TRES6 and Cabina). Each variant page wires its own layout onto
 * the building blocks exposed here. No build step: reads data/djs/*.json.
 */
(function () {
  'use strict';

  const BASE = '';

  const STATUS_CONFIRMED = 'confirmed';
  const STATUS_UNIDENTIFIED = 'unidentified';
  const STATUS_ID = 'id';

  const S = {};

  S.stats = null; // data/djs/stats.json
  S.index = null; // data/djs/index.json
  S.crossRefs = null; // data/djs/cross-references.json
  S.setCache = {};
  S.setsByDj = {};

  // ---------------------------------------------------------------- helpers

  S.esc = function (str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  S.fmtViews = function (n) {
    if (!n) return '0';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
  };

  // "12:10" | "1:05:30" | "1:02" → seconds
  S.tsToSec = function (ts) {
    if (!ts) return 0;
    const parts = String(ts)
      .split(':')
      .map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parts[0] * 60 + (parts[1] || 0);
  };

  S.hhmm = function (sec) {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m >= 60)
      return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  S.genresOf = function (set) {
    const g = set.genres || set.genre || [];
    return Array.isArray(g) ? g : [];
  };

  S.djById = function (id) {
    return (S.index && S.index.djs.find((d) => d.id === id)) || null;
  };

  S.catalog = function (djId) {
    return (S.stats && S.stats.catalog_numbers && S.stats.catalog_numbers[djId]?.num) || '';
  };

  S.completionRing = function (rate) {
    const r = Math.max(0, Math.min(100, Math.round(rate || 0)));
    return `style="background: conic-gradient(var(--color-success) ${r}%, rgba(255,255,255,0.08) ${r}%)"`;
  };

  // ---------------------------------------------------------------- loading

  S.init = async function () {
    const [stats, index, crossRefs] = await Promise.all([
      S.fetchJSON(BASE + 'data/djs/stats.json'),
      S.fetchJSON(BASE + 'data/djs/index.json'),
      S.fetchJSON(BASE + 'data/djs/cross-references.json'),
    ]);
    S.stats = stats || { aggregates: {}, dj_rows: [], genres: [], catalog_numbers: {} };
    S.index = index || { djs: [] };
    S.crossRefs = crossRefs || {};
    return S;
  };

  S.fetchJSON = async function (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  };

  S.fetchSet = async function (setId) {
    if (S.setCache[setId]) return S.setCache[setId];
    const set = await S.fetchJSON(BASE + 'data/djs/sets/' + setId + '.json');
    S.setCache[setId] = set;
    return set;
  };

  S.setsOf = async function (dj) {
    if (S.setsByDj[dj.id]) return S.setsByDj[dj.id];
    const ids = (dj.sets && dj.sets.length ? dj.sets : [dj.id]) || [];
    const sets = (await Promise.all(ids.map((id) => S.fetchSet(id).catch(() => null)))).filter(
      Boolean
    );
    S.setsByDj[dj.id] = sets;
    return sets;
  };

  // ---------------------------------------------------------- tracklist rows

  S.statusDot = function (status) {
    const st = status === STATUS_ID ? STATUS_UNIDENTIFIED : status || STATUS_UNIDENTIFIED;
    return `<span class="tl-dot tl-dot--${st}" title="${st === STATUS_CONFIRMED ? 'ID confirmado' : 'Sin identificar'}"></span>`;
  };

  S.buildTracklist = function (set) {
    const tl = set.tracklist || [];
    if (!tl.length) return '<p class="tl-empty">Tracklist en proceso…</p>';
    return tl
      .map((t, i) => {
        const st = t.status || STATUS_UNIDENTIFIED;
        const ts = t.timestamp || t.time || '';
        const label = t.label ? `<span class="tl-label">${S.esc(t.label)}</span>` : '';
        const statusClass = st === STATUS_CONFIRMED ? 'is-confirmed' : 'is-unknown';
        return `<li class="tl-row ${statusClass}" data-seek="${S.esc(ts)}" tabindex="0" role="button" aria-label="Salta al minuto ${S.esc(ts)}: ${S.esc(t.artist)} - ${S.esc(t.title)}">
          <span class="tl-pos">${S.esc(t.position || i + 1)}</span>
          ${S.statusDot(st)}
          <span class="tl-artist">${S.esc(t.artist)}</span>
          <span class="tl-title">${S.esc(t.title)}</span>
          ${label}
          <span class="tl-time">${S.esc(ts) || '--:--'}</span>
        </li>`;
      })
      .join('');
  };

  S.buildRequested = function (set) {
    const reqs = set.most_requested_ids || [];
    if (!reqs.length) return '';
    return `<section class="set-req">
      <h4 class="set-req-title">🔥 IDs más solicitados</h4>
      ${reqs
        .map(
          (r) => `
        <div class="set-req-card" data-seek="${S.esc(r.timestamp)}" tabindex="0" role="button">
          <div class="set-req-top">
            <span class="set-req-time">${S.esc(r.timestamp)}</span>
            <span class="set-req-count">${r.request_count}× pedido</span>
          </div>
          <p class="set-req-quote">${S.esc(r.sample_comments && r.sample_comments[0] ? r.sample_comments[0] : '¿qué track es este?')}</p>
        </div>`
        )
        .join('')}
    </section>`;
  };

  S.buildFacts = function (set) {
    const f = set.curious_facts || {};
    const keys = Object.keys(f);
    if (!keys.length) return '';
    return `<section class="set-facts">
      ${keys.map((k) => `<div class="set-fact"><span class="set-fact-num">${S.esc(f[k])}</span><span class="set-fact-label">${S.esc(k.replace(/_/g, ' '))}</span></div>`).join('')}
    </section>`;
  };

  S.buildMetaChips = function (set) {
    const chips = [];
    if (set.venue) chips.push({ icon: '◎', text: set.venue });
    if (set.date) chips.push({ icon: '◷', text: set.date });
    chips.push({
      icon: '◫',
      text: set.duration_formatted || (set.duration_minutes ? set.duration_minutes + ' min' : ''),
    });
    if (set.view_count) chips.push({ icon: '▶', text: S.fmtViews(set.view_count) + ' plays' });
    return chips
      .filter((c) => c.text)
      .map((c) => `<span class="set-chip">${c.icon} ${S.esc(c.text)}</span>`)
      .join('');
  };

  S.seekSrc = function (set, ts) {
    const sec = S.tsToSec(ts);
    const base = `https://www.youtube-nocookie.com/embed/${set.youtube_embed_id}`;
    return sec ? `${base}?start=${sec}&autoplay=1&rel=0` : base;
  };

  // ---------------------------------------------------------------- toolbar

  // Returns { djIds, setMatches, tracks } for a free-text query.
  S.search = function (q) {
    const query = String(q || '')
      .toLowerCase()
      .trim();
    const result = { djIds: [], setIds: [], tracks: [] };
    if (!query) return result;
    const djs = S.index.djs || [];
    const djById = {};
    djs.forEach((d) => (djById[d.id] = d));

    // match DJs by name/origin/genres
    const matchedDj = new Set();
    djs.forEach((d) => {
      const hay = [d.name, d.origin, (d.genres || []).join(' ')].join(' ').toLowerCase();
      if (hay.includes(query)) {
        matchedDj.add(d.id);
        result.djIds.push(d.id);
      }
    });

    // match sets by id / title / venue / dj name (cheap, from flat stats.sets)
    (S.stats.sets || []).forEach((s) => {
      const hay = [s.id, s.title, s.venue, s.dj_name, (s.genres || []).join(' ')]
        .join(' ')
        .toLowerCase();
      if (hay.includes(query)) {
        matchedDj.add(s.dj_id);
        result.setIds.push({ djId: s.dj_id, setId: s.id });
      }
    });

    result.djIds = [...matchedDj];
    return result;
  };

  // ---------------------------------------------------------------- graph

  /**
   * "El Hilo" — D3 force graph of DJ connections.
   * Nodes sized by super-connector count, links weighted by shared tracks/artists.
   */
  S.initGraph = function (container, opts) {
    opts = opts || {};
    if (!window.d3) return;
    const d3 = window.d3;
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el || el.dataset.ready) return;
    el.dataset.ready = '1';

    const crossRefs = S.crossRefs || {};
    const djs = S.index.djs || [];
    const connByDj = {};
    (crossRefs.super_connectors || []).forEach((c) => (connByDj[c.dj_id] = c.connection_count));

    const nodes = djs.map((d) => ({
      id: d.id,
      name: d.name,
      r: 4 + Math.min(18, (connByDj[d.id] || 1) * 0.7),
      conn: connByDj[d.id] || 0,
      genres: d.genres || [],
      sets: (d.sets || []).length,
    }));

    const nodeById = {};
    nodes.forEach((n) => (nodeById[n.id] = n));

    const edgeW = {};
    const bump = (a, b, w) => {
      const key = a < b ? a + '::' + b : b + '::' + a;
      edgeW[key] = (edgeW[key] || 0) + w;
    };
    (crossRefs.shared_tracks || []).forEach((t) => {
      const ids = (t.djs || []).filter((id) => nodeById[id]);
      for (let i = 0; i < ids.length; i++)
        for (let j = i + 1; j < ids.length; j++) bump(ids[i], ids[j], 1);
    });
    (crossRefs.shared_artists || []).forEach((a) => {
      const ids = (a.djs || []).filter((id) => nodeById[id]);
      for (let i = 0; i < ids.length; i++)
        for (let j = i + 1; j < ids.length; j++) bump(ids[i], ids[j], 1);
    });

    const links = Object.keys(edgeW).map((k) => {
      const [a, b] = k.split('::');
      return { source: nodeById[a], target: nodeById[b], w: edgeW[k] };
    });

    const width = el.clientWidth || 900;
    const height = opts.height || 560;

    const svg = d3
      .select(el)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);
    const g = svg.append('g');

    const sim = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-220))
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(70)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    const zoom = d3
      .zoom()
      .scaleExtent([0.4, 5])
      .on('zoom', (evt) => g.attr('transform', evt.transform));
    svg.call(zoom);

    const tooltip = d3
      .select(el.parentElement)
      .append('div')
      .attr('class', 'hilo-tooltip')
      .style('opacity', 0);

    const edge = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'hilo-edge')
      .attr('stroke-opacity', (d) => 0.08 + Math.min(0.5, d.w * 0.08));

    const node = g
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', 'hilo-node')
      .attr('r', (d) => d.r)
      .on('mouseenter', function (evt, d) {
        d3.select(this).attr('class', 'hilo-node is-hot');
        tooltip
          .html(
            `<strong>${S.esc(d.name)}</strong><span>${d.sets} sets · ${d.conn} conexiones</span>`
          )
          .style('opacity', 1);
      })
      .on('mousemove', (evt) =>
        tooltip.style('left', evt.pageX + 12 + 'px').style('top', evt.pageY - 10 + 'px')
      )
      .on('mouseleave', function () {
        d3.select(this).attr('class', 'hilo-node');
        tooltip.style('opacity', 0);
      });

    const labels = g
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('class', 'hilo-label')
      .attr('dx', (d) => d.r + 5)
      .attr('dy', 4)
      .text((d) => (d.conn >= 10 ? d.name : ''));

    sim.on('tick', () => {
      edge
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      labels.attr('x', (d) => d.x).attr('y', (d) => d.y);
    });

    el.dataset.sim = 1;
    return { sim, nodes, links };
  };

  // ---------------------------------------------------------------- exports

  window.DJCore = S;
})();
