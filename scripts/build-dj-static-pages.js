#!/usr/bin/env node
/**
 * build-dj-static-pages.js — Generates a full standalone /dj/<id>.html page
 * for every DJ in data/djs/index.json. Each page is pre-rendered so the grid
 * in /dj-library.html can link directly to it (faster first paint, SEO,
 * sharable URLs, and the music player keeps playing thanks to Swup).
 *
 * Why two profile file trees?
 *   - data/djs/profiles/<id>.html  : HTML FRAGMENT for inline expand (lazy)
 *   - dj/<id>.html                  : FULL STANDALONE PAGE (this script)
 *   Both share the same source data (data/djs/sets/*.json + data/djs/index.json)
 *   so the fragment is the source of truth for content; this script just wraps
 *   it in a complete <html> document with header, hero, footer, and a
 *   "related DJs" loader.
 *
 * Usage:
 *   node scripts/build-dj-static-pages.js                # build all
 *   node scripts/build-dj-static-pages.js --watch        # rebuild on changes
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'djs');
const SETS = path.join(DATA, 'sets');
const OUT = path.join(ROOT, 'dj');
const INDEX = path.join(DATA, 'index.json');
const CROSS = path.join(DATA, 'cross-references.json');

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23111' width='100' height='100'/%3E%3Ctext fill='%23ff4d00' x='50' y='55' text-anchor='middle' font-size='40'%3E%F0%9F%8E%A7%3C/text%3E%3C/svg%3E";

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtTime(ts) {
  if (!ts) return '--:--';
  // Accept "HH:MM:SS" or "MM:SS" or numeric seconds
  if (/^\d+$/.test(ts)) {
    const total = parseInt(ts, 10);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }
  return ts;
}

function statusBadge(status) {
  if (status === 'confirmed') return '<span class="track-status confirmed">✓</span>';
  if (status === 'id' || status === 'unidentified') return '<span class="track-status id">ID</span>';
  return `<span class="track-status">${esc(status || '?')}</span>`;
}

function renderSetCard(set) {
  const yt = set.youtube_embed_id || '';
  const tracks = set.tracklist || [];
  const videoBlock = yt
    ? `<div class="video-wrapper">
        <iframe src="https://www.youtube.com/embed/${esc(yt)}" title="${esc(set.title)}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen loading="lazy"></iframe>
      </div>`
    : '';
  const tracklistBlock = tracks.length
    ? `<table class="tracklist-table">
        <thead><tr><th>Time</th><th>Artist</th><th>Title</th><th>Status</th></tr></thead>
        <tbody>${tracks
          .map(
            (t) => `<tr>
              <td><span class="track-time">${esc(fmtTime(t.timestamp))}</span></td>
              <td>${esc(t.artist || '')}</td>
              <td>${esc(t.title || '')}</td>
              <td>${statusBadge(t.status)}</td>
            </tr>`
          )
          .join('')}</tbody>
      </table>`
    : '<p class="no-tracks">Tracklist being sourced...</p>';

  return `<div class="set-card">
    <div class="set-header">
      <h3>${esc(set.title)}</h3>
      <div class="set-meta">
        ${set.venue ? `<span>📍 ${esc(set.venue)}</span>` : ''}
        ${set.date ? `<span>📅 ${esc(set.date)}</span>` : ''}
        ${set.duration_formatted ? `<span>⏱️ ${esc(set.duration_formatted)}</span>` : ''}
        <span>🎵 ${tracks.length} tracks</span>
      </div>
    </div>
    ${videoBlock}
    <div class="tracklist-section">
      <div class="section-label">Tracklist</div>
      ${tracklistBlock}
    </div>
  </div>`;
}

function renderPage(dj, sets) {
  const setCount = sets.length;
  const trackCount = sets.reduce((s, x) => s + (x.tracklist || []).length, 0);
  const knownCount = sets.reduce(
    (s, x) => s + (x.tracklist || []).filter((t) => t.status === 'confirmed').length,
    0
  );
  const completion = trackCount ? Math.round((knownCount / trackCount) * 100) : 0;

  const heroImg = dj.image || PLACEHOLDER_IMG;
  const genres = (dj.genres || [])
    .map((g) => `<span class="genre-tag">${esc(g)}</span>`)
    .join('');

  const pageUrl = `https://3tres6records.albto.me/dj/${dj.id}.html`;
  const title = `${dj.name} | DJ Library — 3TRES6 Records`;
  const description = `Sets completos de ${dj.name} con tracklists, IDs y datos curiosos. ${setCount} sets, ${trackCount} tracks.`;

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(pageUrl)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(pageUrl)}" />
  <meta property="og:type" content="profile" />
  ${heroImg && heroImg.startsWith('http') ? `<meta property="og:image" content="${esc(heroImg)}" />` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../styles.css" />
  <link rel="stylesheet" href="../css/dj-library.css" />
  <style>
    .dj-page-hero {
      position: relative;
      padding: 6rem 2rem 3rem;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
      overflow: hidden;
    }
    .dj-page-hero::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, transparent, #ff4d00, transparent);
    }
    .dj-page-header {
      display: flex; align-items: flex-start; gap: 2rem;
      max-width: 1200px; margin: 0 auto;
      position: relative; z-index: 1;
    }
    .dj-page-avatar {
      width: 160px; height: 160px; border-radius: 50%;
      border: 3px solid #ff4d00; object-fit: cover;
      box-shadow: 0 0 60px rgba(255,77,0,0.3); flex-shrink: 0;
      background: #111;
    }
    .dj-page-info h1 { font-size: 3rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; line-height: 1.1; }
    .dj-page-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1rem; color: rgba(255,255,255,0.5); font-size: 0.9rem; }
    .dj-page-meta strong { color: #ff9100; font-weight: 600; }
    .dj-page-genres { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .genre-tag {
      display: inline-block; padding: 0.3rem 0.75rem; border-radius: 999px;
      background: rgba(255,77,0,0.1); border: 1px solid rgba(255,77,0,0.3);
      color: #ff9100; font-size: 0.8rem; font-weight: 500;
    }
    .dj-page-bio { color: rgba(255,255,255,0.6); line-height: 1.7; max-width: 600px; }
    .sets-section { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .sets-section h2 {
      font-size: 1.5rem; color: #fff; margin-bottom: 2rem;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .set-card {
      background: linear-gradient(145deg, #1a1a1a 0%, #111 100%);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
      overflow: hidden; margin-bottom: 2rem;
    }
    .set-header { padding: 2rem 2rem 1rem; }
    .set-header h3 { font-size: 1.35rem; color: #fff; margin-bottom: 0.5rem; }
    .set-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; color: rgba(255,255,255,0.4); font-size: 0.85rem; }
    .video-wrapper { position: relative; padding-bottom: 56.25%; background: #000; }
    .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
    .tracklist-section { padding: 1.5rem 2rem; }
    .tracklist-section .section-label {
      font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;
      color: rgba(255,255,255,0.35); margin-bottom: 1rem;
    }
    .tracklist-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .tracklist-table th {
      text-align: left; padding: 0.75rem; color: rgba(255,255,255,0.4);
      font-weight: 500; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .tracklist-table td {
      padding: 0.6rem 0.75rem; color: rgba(255,255,255,0.7);
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .tracklist-table tr:hover td { background: rgba(255,255,255,0.02); }
    .track-time { color: rgba(255,255,255,0.3); font-family: monospace; font-size: 0.8rem; }
    .track-status { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 500; }
    .track-status.confirmed { background: rgba(0, 200, 100, 0.1); color: #00c864; }
    .track-status.id { background: rgba(255, 77, 0, 0.1); color: #ff4d00; }
    .no-tracks { color: rgba(255,255,255,0.3); font-size: 0.9rem; padding: 1rem 0; }
    .related-djs { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .related-djs h2 { font-size: 1.5rem; color: #fff; margin-bottom: 1.5rem; }
    .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .related-grid .dj-card {
      display: block; text-decoration: none; color: #fff;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; overflow: hidden; transition: transform 0.2s, border-color 0.2s;
    }
    .related-grid .dj-card:hover { transform: translateY(-3px); border-color: rgba(255,77,0,0.4); }
    .related-grid .dj-card-image { aspect-ratio: 1/1; background: #111; overflow: hidden; }
    .related-grid .dj-card-image img { width: 100%; height: 100%; object-fit: cover; }
    .related-grid .dj-card-body { padding: 0.75rem 1rem; }
    .related-grid .dj-card-body h3 { font-size: 1rem; margin: 0 0 0.35rem; }
    .related-grid .dj-card-meta { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
    .related-grid .dj-card-placeholder {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 100%; font-size: 3rem; background: #111; color: #ff4d00;
    }
    @media (max-width: 768px) {
      .dj-page-header { flex-direction: column; align-items: center; text-align: center; }
      .dj-page-avatar { width: 120px; height: 120px; }
      .dj-page-info h1 { font-size: 2rem; }
      .dj-page-meta { justify-content: center; }
      .dj-page-genres { justify-content: center; }
    }
  </style>
</head>
<body>
  <header class="header" id="mainHeader" role="banner">
    <div class="header-container">
      <a href="/3tres6muntanerRecords/" class="logo" aria-label="3TRES6 Records Home">
        <span class="logo-text">3TRES6</span>
        <span class="logo-subtitle">RECORDS</span>
      </a>
      <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menú" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="main-nav" id="mainNav" role="navigation" aria-label="Navegación principal">
        <div class="nav-group nav-group-store">
          <a href="/3tres6muntanerRecords/#catalogo" class="nav-item">Catálogo</a>
          <a href="/3tres6muntanerRecords/#calendario" class="nav-item">Calendario</a>
          <a href="/3tres6muntanerRecords/#nosotros" class="nav-item">Nosotros</a>
        </div>
        <div class="nav-separator"></div>
        <div class="nav-group nav-group-content">
          <a href="/3tres6muntanerRecords/3d-brain.html" class="nav-item">DJ Hub</a>
        </div>
      </nav>
      <div class="header-actions">
        <a href="https://www.discogs.com/seller/3tres6records" target="_blank" rel="noopener" class="discogs-link">Discogs</a>
        <a href="/3tres6muntanerRecords/" class="cart-icon" aria-label="Carrito">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span class="cart-count" id="cartCount">0</span>
        </a>
      </div>
    </div>
    <nav class="mobile-nav" id="mobileNav" aria-label="Navegación móvil">
      <div class="mobile-nav-group-label">Tienda</div>
      <a href="/3tres6muntanerRecords/#catalogo">Catálogo</a>
      <a href="/3tres6muntanerRecords/#calendario">Calendario</a>
      <a href="/3tres6muntanerRecords/#nosotros">Nosotros</a>
      <div class="mobile-nav-group-label">Contenido</div>
      <a href="/3tres6muntanerRecords/3d-brain.html">DJ Hub</a>
      <div class="mobile-nav-group-label">Redes</div>
      <a href="/3tres6muntanerRecords/#instagram">Instagram</a>
      <a href="https://www.discogs.com/seller/3tres6records" target="_blank" rel="noopener">Discogs</a>
    </nav>
  </header>

  <nav class="dj-hub-subnav" aria-label="Navegación DJ Hub">
    <div class="subnav-container">
      <a href="/3tres6muntanerRecords/" class="subnav-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Tienda
      </a>
      <div class="subnav-divider"></div>
      <div class="subnav-tabs">
        <a href="../blog.html" class="subnav-tab">Blog</a>
        <a href="../dj-library.html" class="subnav-tab active" aria-current="page">DJ Library</a>
        <a href="../3d-brain.html" class="subnav-tab">Neural</a>
        <a href="../toolhub/" class="subnav-tab">Herramientas</a>
        <a href="../toolhub/#hardware" class="subnav-tab">Equipo DJ</a>
      </div>
    </div>
  </nav>

  <main data-swup>
    <section class="dj-page-hero">
      <div class="dj-page-header">
        <img src="${esc(heroImg)}" alt="${esc(dj.name)}" class="dj-page-avatar"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'" />
        <div class="dj-page-info">
          <h1>${esc(dj.name)}</h1>
          <div class="dj-page-meta">
            ${dj.origin ? `<span>📍 ${esc(dj.origin)}</span>` : ''}
            ${dj.active_since ? `<span>•</span><span>Activo desde ${esc(dj.active_since)}</span>` : ''}
            <span>•</span><span><strong>${setCount}</strong> set${setCount !== 1 ? 's' : ''}</span>
            <span><strong>${trackCount}</strong> tracks</span>
            <span><strong>${knownCount}</strong> identificados (${completion}%)</span>
          </div>
          ${genres ? `<div class="dj-page-genres">${genres}</div>` : ''}
          ${dj.bio ? `<p class="dj-page-bio">${esc(dj.bio)}</p>` : ''}
        </div>
      </div>
    </section>

    <section class="sets-section">
      <h2>▶ Sets</h2>
      ${sets.length ? sets.map(renderSetCard).join('\n') : '<p class="no-tracks">No sets indexed yet.</p>'}
    </section>

    <section class="related-djs">
      <h2>DJs Relacionados</h2>
      <div class="related-grid" id="relatedGrid">
        <p style="color:rgba(255,255,255,0.3)">Cargando conexiones...</p>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="footer-content">
      <p>3TRES6 Records — Barcelona → México</p>
      <nav class="footer-nav">
        <a href="/">Catálogo</a>
        <a href="../blog.html">Blog</a>
        <a href="../3d-brain.html">Neural</a>
        <a href="../dj-library.html">DJ Library</a>
      </nav>
    </div>
  </footer>

  <script>
    // Related DJs loader — fetches cross-references and renders up to 4
    function initRelated_${esc(dj.id)}() {
      const grid = document.getElementById('relatedGrid');
      if (!grid) return;
      fetch('../data/djs/cross-references.json')
        .then(r => r.ok ? r.json() : null)
        .then(cr => {
          if (!cr) { grid.innerHTML = '<p style="color:rgba(255,255,255,0.2)">No hay conexiones documentadas aún.</p>'; return; }
          const arts = (cr.shared_artists || []).filter(a => (a.djs || []).includes('${esc(dj.id)}'));
          const trks = (cr.shared_tracks || []).filter(t => (t.djs || []).includes('${esc(dj.id)}'));
          const relatedIds = new Set();
          arts.forEach(a => (a.djs || []).forEach(id => { if (id !== '${esc(dj.id)}') relatedIds.add(id); }));
          trks.forEach(t => (t.djs || []).forEach(id => { if (id !== '${esc(dj.id)}') relatedIds.add(id); }));
          const ids = Array.from(relatedIds).slice(0, 6);
          if (!ids.length) { grid.innerHTML = '<p style="color:rgba(255,255,255,0.2)">No hay conexiones documentadas aún.</p>'; return; }
          return fetch('../data/djs/index.json').then(r => r.json()).then(idx => {
            const cards = ids.map(id => {
              const d = (idx.djs || []).find(x => x.id === id);
              if (!d) return '';
              const img = d.image || '';
              return '<a href="' + id + '.html" class="dj-card">'
                + '<div class="dj-card-image">' + (img
                    ? '<img src="' + img + '" alt="' + d.name + '" loading="lazy" onerror="this.parentElement.innerHTML=\\'<div class=&#92;&#92;\\&#39;dj-card-placeholder&#92;&#92;\\&#39;>🎧</div>\\'"/>'
                    : '<div class="dj-card-placeholder">🎧</div>')
                + '</div>'
                + '<div class="dj-card-body"><h3>' + d.name + '</h3>'
                + '<div class="dj-card-meta"><span>' + (d.stats?.sets || 0) + ' sets</span> <span>' + (d.stats?.completion_rate || 0) + '% ID</span></div>'
                + '</div></a>';
            }).join('');
            grid.innerHTML = cards || '<p style="color:rgba(255,255,255,0.2)">No hay conexiones documentadas aún.</p>';
          });
        })
        .catch(() => { grid.innerHTML = '<p style="color:rgba(255,255,255,0.2)">No hay conexiones documentadas aún.</p>'; });
    }
    initRelated_${esc(dj.id)}();
    if (window.Muntaner336 && typeof window.Muntaner336.onPageView === 'function') {
      window.Muntaner336.onPageView(function () { initRelated_${esc(dj.id)}(); });
    }
  </script>
  <!-- Swup: seamless page transitions so the audio player never cuts off -->
  <script src="../js/vendor/swup.umd.js" defer></script>
  <script src="../js/swup-init.js" defer></script>
  <script src="../player-init.js" defer></script>
</body>
</html>
`;
}

function build() {
  if (!fs.existsSync(INDEX)) {
    console.error(`Missing ${INDEX}. Run scripts/build-dj-data.js first.`);
    process.exit(1);
  }
  const idx = JSON.parse(fs.readFileSync(INDEX, 'utf-8'));
  const djs = idx.djs || [];
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  let built = 0;
  let skipped = 0;
  for (const dj of djs) {
    const sets = [];
    for (const setId of dj.sets || []) {
      const p = path.join(SETS, `${setId}.json`);
      if (fs.existsSync(p)) {
        try { sets.push(JSON.parse(fs.readFileSync(p, 'utf-8'))); }
        catch (e) { console.warn(`  ! ${setId}.json: ${e.message}`); }
      }
    }
    const html = renderPage(dj, sets);
    const outPath = path.join(OUT, `${dj.id}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');
    built++;
  }
  console.log(`Built ${built} static page(s) in ${path.relative(ROOT, OUT)}/ (${skipped} skipped)`);
}

function watch() {
  build();
  let debounce = null;
  const trigger = () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      console.log('Change detected, rebuilding...');
      try { build(); } catch (e) { console.error('Build failed:', e.message); }
    }, 300);
  };
  fs.watch(DATA, { recursive: true }, (event, filename) => {
    if (filename && !filename.includes('profiles/')) {
      console.log(`  ${event} ${filename}`);
      trigger();
    }
  });
}

const args = process.argv.slice(2);
if (args.includes('--watch')) watch();
else build();
