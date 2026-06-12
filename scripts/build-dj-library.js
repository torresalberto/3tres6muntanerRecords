#!/usr/bin/env node
/**
 * build-dj-library.js — Pre-renders the DJ Library as static HTML pages.
 *
 * Output:
 *   dj-library/index.html         — page 1 (first 12 DJs)
 *   dj-library/page-2.html        — page 2
 *   dj-library/page-3.html        — page 3
 *   ...
 *
 * Each page:
 *   - Has all HTML inlined (no client-side JSON fetching)
 *   - Uses lazy YouTube thumbnails (click-to-play, no iframe until clicked)
 *   - Links to individual static DJ profile pages in /dj/<slug>.html
 *
 * Usage:
 *   node scripts/build-dj-library.js           # build with default 12 per page
 *   node scripts/build-dj-library.js --per=8   # 8 DJs per page
 *
 * Run this whenever you add a new DJ set:
 *   1. Add JSON to data/djs/sets/<set-id>.json
 *   2. Update data/djs/index.json
 *   3. Run: node scripts/build-dj-library.js
 *   4. Commit and push — GitHub Actions deploys the static site
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data', 'djs');
const OUT_DIR = path.join(ROOT, 'dj-library');
const PER_PAGE = (process.argv.find(a => a.startsWith('--per=')) || '--per=12').split('=')[1] | 0 || 12;

// HTML escape
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

// YouTube lazy thumbnail (click-to-play)
function youtubeEmbed(videoId, title) {
  if (!videoId) return '';
  const safe = esc(title);
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  // Use srcdoc trick: thumbnail with play button overlay
  return `<div class="yt-lazy" data-vid="${esc(videoId)}" role="button" tabindex="0" aria-label="Play ${safe}">
    <img src="${thumb}" alt="${safe}" loading="lazy" decoding="async" />
    <div class="yt-play-btn">▶</div>
  </div>`;
}

function tracklistRows(tracks) {
  if (!tracks || !tracks.length) return '<tr><td colspan="5" style="text-align:center;opacity:0.4;padding:1rem">Tracklist being sourced…</td></tr>';
  return tracks.map((t, i) => `<tr>
    <td>${t.position || i + 1}</td>
    <td><span class="track-time">${esc(t.timestamp || '--:--')}</span></td>
    <td>${esc(t.artist)}</td>
    <td>${esc(t.title)}</td>
    <td><span class="track-status status-${t.status || 'unidentified'}">${t.status === 'confirmed' ? '✓ confirmed' : '? unidentified'}</span></td>
  </tr>`).join('');
}

function factsGrid(facts) {
  if (!facts || !Object.keys(facts).length) return '';
  return `<div class="facts-grid">${Object.entries(facts)
    .map(([k, v]) => `<div class="fact-card"><div class="fact-number">${esc(v)}</div><div class="fact-label">${esc(k.replace(/_/g, ' '))}</div></div>`)
    .join('')}</div>`;
}

function renderDJSection(dj, sets) {
  const setCount = sets.length;
  const totalTracks = sets.reduce((sum, s) => sum + (s.tracklist || []).length, 0);
  const setsHTML = sets.map(set => `
    <div class="set-player-section">
      <div class="set-info-header">
        <div>
          <div class="section-label">▶ Set</div>
          <h3 class="set-title">${esc(set.title)}</h3>
          <div class="set-meta">
            ${set.venue ? `<span>📍 ${esc(set.venue)}</span>` : ''}
            ${set.date ? `<span>📅 ${esc(set.date)}</span>` : ''}
            <span>⏱️ ${esc(set.duration_formatted || (set.duration_minutes + ' min'))}</span>
            ${set.view_count ? `<span>👁️ ${(set.view_count / 1000).toFixed(1)}K views</span>` : ''}
          </div>
        </div>
        <a href="dj/${esc(dj.id)}.html" class="set-permalink">View profile →</a>
      </div>
      ${youtubeEmbed(set.youtube_embed_id, set.title)}
    </div>
    <div class="tracklist-section">
      <div class="section-label">🎵 Tracklist (${(set.tracklist || []).length} tracks)</div>
      ${(set.tracklist || []).length ? `<table class="tracklist-table"><thead><tr><th>#</th><th>Time</th><th>Artist</th><th>Title</th><th>Status</th></tr></thead><tbody>${tracklistRows(set.tracklist)}</tbody></table>` : ''}
    </div>
    ${set.curious_facts && Object.keys(set.curious_facts).length ? `<div class="facts-section"><div class="section-label">📊 Datos</div>${factsGrid(set.curious_facts)}</div>` : ''}
  `).join('');

  return `
    <section class="dj-profile-section" id="dj-${esc(dj.id)}">
      <div class="dj-profile-card">
        <div class="dj-profile-header">
          <img src="${esc(dj.image || '')}" alt="${esc(dj.name)}" class="dj-avatar" loading="lazy" decoding="async" onerror="this.style.opacity=0.3" />
          <div class="dj-info">
            <h2>${esc(dj.name)}</h2>
            <div class="dj-meta">
              ${dj.origin ? `<span>${esc(dj.origin)}</span>` : ''}
              ${dj.active_since ? `<span>•</span><span>Since ${esc(dj.active_since)}</span>` : ''}
              <span>•</span><span>${setCount} set${setCount !== 1 ? 's' : ''}</span>
              <span>•</span><span>${totalTracks} tracks</span>
            </div>
            <p class="dj-bio">${esc(dj.bio || '')}</p>
          </div>
        </div>
        ${setsHTML}
      </div>
    </section>`;
}

function pageHTML(djs, sets, pageNum, totalPages) {
  const start = (pageNum - 1) * PER_PAGE;
  const pageDJs = djs.slice(start, start + PER_PAGE);
  const sections = pageDJs.map(dj => {
    const djSets = (dj.sets || []).map(id => sets[id]).filter(Boolean);
    return renderDJSection(dj, djSets);
  }).join('');

  const pagination = totalPages > 1 ? `
    <nav class="library-pagination" aria-label="Paginación DJ Library">
      ${pageNum > 1 ? `<a href="${pageNum === 2 ? 'index.html' : `page-${pageNum - 1}.html`}" class="page-link">← Anterior</a>` : '<span class="page-link disabled">← Anterior</span>'}
      ${Array.from({ length: totalPages }, (_, i) => i + 1).map(n => {
        const href = n === 1 ? 'index.html' : `page-${n}.html`;
        return n === pageNum
          ? `<span class="page-link active" aria-current="page">${n}</span>`
          : `<a href="${href}" class="page-link">${n}</a>`;
      }).join('')}
      ${pageNum < totalPages ? `<a href="page-${pageNum + 1}.html" class="page-link">Siguiente →</a>` : '<span class="page-link disabled">Siguiente →</span>'}
    </nav>` : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DJ Library${pageNum > 1 ? ` — Página ${pageNum}` : ''} — 3TRES6 Records</title>
  <meta name="description" content="Sets completos con tracklists, IDs más solicitados y datos curiosos extraídos de YouTube.">
  <link rel="canonical" href="https://3tres6records.albto.me/dj-library/${pageNum > 1 ? `page-${pageNum}.html` : ''}" />
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="../css/dj-library.css">
  <link rel="preconnect" href="https://i.ytimg.com">
  <link rel="preconnect" href="https://www.youtube-nocookie.com">
</head>
<body class="dj-library-page">
  <header class="site-header">
    <a href="../" class="logo">3TRES6</a>
    <nav class="main-nav">
      <a href="../">Tienda</a>
      <a href="index.html"${pageNum === 1 ? ' class="active"' : ''}>DJ Library</a>
      <a href="../blog.html">Blog</a>
    </nav>
  </header>

  <main data-swup>
    <div class="dj-library-intro">
      <h1>DJ Library</h1>
      <p>Sets completos con tracklists, IDs más solicitados y datos curiosos extraídos de YouTube.</p>
      <div class="library-stats">
        <span><strong>${djs.length}</strong> DJs</span>
        <span><strong>${Object.keys(sets).length}</strong> Sets</span>
        <span><strong>${Object.values(sets).reduce((s, x) => s + (x.tracklist || []).length, 0)}</strong> Tracks</span>
        ${totalPages > 1 ? `<span>Página ${pageNum} de ${totalPages}</span>` : ''}
      </div>
    </div>

    <div id="djLibraryContainer">${sections}</div>
    ${pagination}
  </main>

  <footer class="site-footer">
    <p>3TRES6 Records · Barcelona · CDMX</p>
  </footer>

  <script src="../js/vendor/swup.umd.js" defer></script>
  <script src="../js/swup-init.js" defer></script>
  <script src="../js/yt-lazy.js" defer></script>
  <script src="../player-init.js" defer></script>
  <script src="../audio.js" defer></script>
</body>
</html>`;
}

// Main
function main() {
  console.log('🚀 Building static DJ Library…');
  console.log(`📁 Output: ${path.relative(ROOT, OUT_DIR)}/`);
  console.log(`📄 ${PER_PAGE} DJs per page`);

  const idx = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'index.json'), 'utf-8'));
  const djs = idx.djs || [];
  console.log(`👥 Loaded ${djs.length} DJs from index`);

  const sets = {};
  for (const dj of djs) {
    for (const setId of dj.sets || []) {
      const setPath = path.join(DATA_DIR, 'sets', `${setId}.json`);
      if (fs.existsSync(setPath)) {
        sets[setId] = JSON.parse(fs.readFileSync(setPath, 'utf-8'));
      }
    }
  }
  console.log(`🎵 Loaded ${Object.keys(sets).length} sets`);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const totalPages = Math.ceil(djs.length / PER_PAGE);
  console.log(`📖 Generating ${totalPages} page(s)…`);

  for (let p = 1; p <= totalPages; p++) {
    const filename = p === 1 ? 'index.html' : `page-${p}.html`;
    const html = pageHTML(djs, sets, p, totalPages);
    fs.writeFileSync(path.join(OUT_DIR, filename), html);
    console.log(`  ✓ ${filename} (${(html.length / 1024).toFixed(1)}KB)`);
  }

  console.log(`\n✨ Done! ${djs.length} DJs across ${totalPages} static page(s).`);
  console.log(`\n📝 Next: commit & push to deploy via GitHub Actions.`);
}

main();
