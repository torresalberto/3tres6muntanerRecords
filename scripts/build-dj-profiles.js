#!/usr/bin/env node
/**
 * build-dj-profiles.js — Pre-renders each DJ profile as a static HTML file
 *
 * Why: The library page used to fetch 67 JSON files + build the DOM + load 67
 * YouTube iframes on every visit. Now we pre-render the HTML once at build
 * time. The library page just fetches one HTML file per DJ (cacheable by the
 * browser) and clicks lazy-mount the YouTube iframe.
 *
 * Output: data/djs/profiles/<dj-id>.html   (one file per DJ)
 *
 * Usage:
 *   node scripts/build-dj-profiles.js              # build all
 *   node scripts/build-dj-profiles.js --watch      # rebuild on set/index changes
 */

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data', 'djs');
const SETS = path.join(DATA, 'sets');
const OUT = path.join(DATA, 'profiles');
const INDEX = path.join(DATA, 'index.json');

const YT_THUMB = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSetBlock(set) {
  const tracks = set.tracklist || [];
  const ytId = set.youtube_embed_id || '';
  const videoBlock = ytId
    ? `<div class="set-video" data-yt-id="${esc(ytId)}" data-yt-title="${esc(set.title)}">
         <img src="${YT_THUMB(ytId)}" alt="${esc(set.title)}" loading="lazy" />
         <button type="button" class="yt-play-btn" aria-label="Play ${esc(set.title)}">
           <svg viewBox="0 0 68 48" width="68" height="48"><path d="M66.52 7.74a8 8 0 0 0-5.64-5.66C55.85.7 34 .7 34 .7S12.15.7 7.12 2.08A8 8 0 0 0 1.48 7.74 80 80 0 0 0 0 24a80 80 0 0 0 1.48 16.26 8 8 0 0 0 5.64 5.66C12.15 47.3 34 47.3 34 47.3s21.85 0 26.88-1.38a8 8 0 0 0 5.64-5.66A80 80 0 0 0 68 24a80 80 0 0 0-1.48-16.26z" fill="#f00"/><path d="M27 34V14l18 10z" fill="#fff"/></svg>
         </button>
       </div>`
    : '';
  const tracklistBlock = tracks.length
    ? `<table class="tracklist-table">
         <thead><tr><th>#</th><th>Time</th><th>Artist</th><th>Title</th><th>Status</th></tr></thead>
         <tbody>${tracks.map((t, i) => `
           <tr>
             <td>${t.position || i + 1}</td>
             <td><span class="track-time">${esc(t.timestamp || '--:--')}</span></td>
             <td>${esc(t.artist)}</td>
             <td>${esc(t.title)}</td>
             <td><span class="track-status status-${t.status === 'confirmed' ? 'confirmed' : 'unidentified'}">${t.status === 'confirmed' ? '✓' : '?'}</span></td>
           </tr>`).join('')}</tbody>
       </table>`
    : '<p class="no-tracks">Tracklist being sourced...</p>';
  return `
    <div class="set-block">
      ${videoBlock}
      <div class="set-header">
        <span class="set-label">▶ ${esc(set.title)}</span>
        ${set.venue ? `<span class="set-venue">📍 ${esc(set.venue)}</span>` : ''}
        ${set.date ? `<span class="set-date">📅 ${esc(set.date)}</span>` : ''}
        ${set.duration_formatted ? `<span class="set-duration">⏱️ ${esc(set.duration_formatted)}</span>` : ''}
      </div>
      ${tracklistBlock}
    </div>
  `;
}

function renderProfilePage(dj, sets) {
  // Renders a PURE FRAGMENT — just the set blocks, no html/head/body wrapper.
  //
  // Why a fragment (not a full standalone page)?
  //   This file is consumed by dj-library.html via fetch() + innerHTML when the
  //   user clicks a gallery card to expand it inline. The browser DOES NOT
  //   strip <meta>, <style>, <title>, <link> tags from innerHTML assignments
  //   — it moves them to the document's <head>. A <meta http-equiv="refresh">
  //   in the fragment would IMMEDIATELY fire and navigate the page (the bug we
  //   fixed on 2026-06-11). <style> would leak into the host page. <title>
  //   would override the page title.
  //
  //   By producing a clean fragment we avoid all of those side effects. The
  //   fragment is self-contained: <div class="set-block">...</div> elements
  //   with their own classes/tables/styles. If anyone visits the URL
  //   /data/djs/profiles/<id>.html directly, the browser renders the set
  //   blocks as raw HTML (no chrome), which is acceptable because:
  //     - The canonical standalone pages live at /dj/<id>.html
  //     - The fragment is the source of truth for innerHTML expansion
  //     - These URLs are not linked from any other page on the site
  //       (search engines have no way to discover them)
  const inner = (sets || []).map(renderSetBlock).join('');
  // Leading HTML comment so anyone reading the raw file knows it's a
  // fragment meant for innerHTML injection, not a standalone page.
  return `<!-- profile fragment: innerHTML-only, do not navigate to directly. Canonical: /dj/${esc(dj.id)}.html -->\n${inner}`;
}

function renderProfileInner(dj, sets) {
  // Backwards-compatible alias for the inner fragment used by dj-library.html.
  return renderProfilePage(dj, sets);
}

function renderDjCard(dj, sets) {
  // Renders the full card (chrome + inner detail with the pre-rendered HTML
  // already injected). This is what gets shown when "Cargar más" renders a card
  // directly without lazy-loading.
  const completion = dj.stats?.completion_rate ?? 0;
  const completionClass = completion >= 90 ? 'high' : completion >= 70 ? 'med' : 'low';
  const img = dj.image
    || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23111' width='100' height='100'/%3E%3Ctext fill='%23ff4d00' x='50' y='55' text-anchor='middle' font-size='40'%3E🎧%3C/text%3E%3C/svg%3E";
  const setsHtml = (sets || []).map(renderSetBlock).join('');
  return `<div class="dj-gallery-card" data-dj-id="${esc(dj.id)}">
  <div class="dj-gallery-thumb">
    <img src="${esc(img)}" alt="${esc(dj.name)}" loading="lazy" />
    <div class="dj-gallery-overlay">
      <span class="gallery-sets">${dj.stats?.sets || 0} set${dj.stats?.sets !== 1 ? 's' : ''}</span>
      <span class="gallery-expand">Ver tracklist ▸</span>
    </div>
  </div>
  <div class="dj-gallery-info">
    <h3>${esc(dj.name)}</h3>
    <div class="gallery-meta">
      <span class="completion completion-${completionClass}">${completion}%</span>
      <div class="gallery-genres">${(dj.genres || []).slice(0, 2).map(g => `<span>${esc(g)}</span>`).join('')}</div>
    </div>
  </div>
  <div class="dj-gallery-expand">
    <div class="dj-gallery-detail">${setsHtml}</div>
    <div class="dj-gallery-collapse">▾ Cerrar</div>
  </div>
</div>`;
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
  for (const dj of djs) {
    const sets = [];
    for (const setId of dj.sets || []) {
      const setPath = path.join(SETS, `${setId}.json`);
      if (fs.existsSync(setPath)) {
        try { sets.push(JSON.parse(fs.readFileSync(setPath, 'utf-8'))); }
        catch (e) { console.warn(`  ! ${setId}.json: ${e.message}`); }
      }
    }
    const html = renderProfileInner(dj, sets);
    fs.writeFileSync(path.join(OUT, `${dj.id}.html`), html, 'utf-8');
    built++;
  }
  console.log(`Built ${built} profile(s) in ${path.relative(process.cwd(), OUT)}/`);
}

function watch() {
  console.log('Watching for changes (Ctrl+C to stop)...');
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
if (args.includes('--watch')) watch(); else build();
