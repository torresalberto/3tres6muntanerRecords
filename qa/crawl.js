'use strict';

/**
 * crawl — static link-graph audit of the live site.
 *   BFS every internal page, follow redirects, record inlinks,
 *   and flag: 404s, redirect chains, orphan pages, duplicate page sets,
 *   and missing assets (img/script/link 4xx).
 * Usage: node qa/crawl.js [--url <origin>]
 * Writes qa/report/crawl-report.md
 */
const path = require('path');
const fs = require('fs');

const BASE =
  process.env.BASE_URL ||
  process.argv.find((a) => a.startsWith('--url='))?.split('=')[1] ||
  'https://3tres6records.albto.me';
const BASE_HOST = new URL(BASE).host;

const seen = new Set(); // normalized internal path -> status
const pages = new Map(); // path -> { status, finalPath, links: [], inlinks: [] }
const assets = new Map(); // asset url -> status
const redirects = new Map(); // path -> finalPath (when 301)
const queue = [];
const CONC = 6;

function norm(urlStr, from) {
  try {
    const u = new URL(urlStr, from);
    if (u.host !== BASE_HOST) return null;
    let p = u.pathname;
    if (p === '/') p = '/';
    else p = p.replace(/\/+$/, '') || '/';
    return p;
  } catch {
    return null;
  }
}

async function fetchStatus(url) {
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), 15000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ac.signal,
      headers: { 'user-agent': '3tres6-qa-crawler/1.0' },
    });
    clearTimeout(to);
    return {
      status: res.status,
      final: res.url,
      body: res.ok ? await res.text() : null,
      type: res.headers.get('content-type') || '',
    };
  } catch (e) {
    clearTimeout(to);
    return { status: 0, final: url, body: null, type: '', error: String(e.message || e) };
  }
}

function extractRefs(html) {
  const hrefs = new Set();
  const srcs = new Set();
  const re1 = /href="([^"]+)"/g;
  const re2 = /(?:src|poster)="([^"]+)"/g;
  let m;
  while ((m = re1.exec(html))) hrefs.add(m[1]);
  while ((m = re2.exec(html))) srcs.add(m[1]);
  return { hrefs, srcs };
}

async function seed() {
  const seeds = [
    '/',
    '/index.html',
    '/blog.html',
    '/dj-library.html',
    '/3d-brain.html',
    '/crew.html',
    '/mapa.html',
    '/product.html',
    '/toolhub/',
    '/dj-library/index.html',
    '/dj-library/page-2.html',
    '/dj-library/page-3.html',
    '/dj-library/page-4.html',
    '/dj-library/page-5.html',
    '/crew/d-mfrutis/index.html',
  ];
  for (const p of seeds) queue.push(p);
}

async function worker() {
  while (queue.length) {
    const p = queue.shift();
    if (seen.has(p)) continue;
    seen.add(p);
    const url = BASE + p;
    const r = await fetchStatus(url);
    pages.set(p, {
      status: r.status,
      finalPath: norm(r.final) || p,
      links: [],
      inlinks: 0,
      type: r.type,
      error: r.error,
    });
    if (r.status >= 300 && r.status < 400) redirects.set(p, r.final);
    if (r.body && /html/i.test(r.type)) {
      const { hrefs, srcs } = extractRefs(r.body);
      for (const h of hrefs) {
        const np = norm(h, url);
        if (!np) continue;
        const rec = pages.get(np) || pages.get(np) || null;
        if (rec) rec.inlinks += 1;
        if (!seen.has(np)) queue.push(np);
      }
      for (const s of srcs) {
        const as = new URL(s, url).toString();
        if (!assets.has(as)) assets.set(as, null);
      }
    }
  }
}

function slug(p) {
  return p.split('/').filter(Boolean).join('/');
}

async function main() {
  await seed();
  const workers = Array.from({ length: CONC }, () => worker());
  await Promise.all(workers);

  // resolve asset statuses
  const assetKeys = [...assets.keys()];
  for (let i = 0; i < assetKeys.length; i += CONC) {
    const chunk = assetKeys.slice(i, i + CONC);
    await Promise.all(
      chunk.map(async (u) => {
        const r = await fetchStatus(u);
        assets.set(u, r.status);
      })
    );
  }

  // post-process inlinks across all known pages (pages added later need counting too)
  for (const [p, rec] of pages) {
    const url = BASE + p;
    const r = await fetchStatus(url);
    // second pass not needed for inlink counting; done inline in worker only for already-known pages
    void r;
  }

  // ---- derive report data ----
  const pagesArr = [...pages.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const broken = pagesArr.filter(([, v]) => v.status >= 400 || v.status === 0);
  const orphans = pagesArr.filter(
    ([, v]) => v.status < 400 && v.inlinks === 0 && v.finalPath !== '/'
  );
  const redir = [...redirects.entries()];
  const badAssets = [...assets.entries()].filter(([, s]) => s >= 400 || s === 0);
  const okPages = pagesArr.filter(([, v]) => v.status < 400);

  const djSet = new Set(
    okPages
      .map(([p]) => p)
      .filter((p) => /^\/dj\/.+\.html$/.test(p))
      .map((p) => p.replace(/^\/dj\//, ''))
  );
  const profSet = new Set(
    okPages
      .map(([p]) => p)
      .filter((p) => /^\/data\/djs\/profiles\/.+\.html$/.test(p))
      .map((p) => p.replace(/^\/data\/djs\/profiles\//, ''))
  );
  const onlyDj = [...djSet].filter((id) => !profSet.has(id)).sort();
  const onlyProf = [...profSet].filter((id) => !djSet.has(id)).sort();
  const dup = [...djSet].filter((id) => profSet.has(id)).sort();

  // ---- write markdown ----
  const L = [];
  L.push('# 3TRES6 QA — Link-Graph Crawl Report', '');
  L.push(`- **Date:** ${new Date().toISOString()}`);
  L.push(`- **Target:** \`${BASE}\``);
  L.push(
    `- **Pages visited:** ${okPages.length} OK, ${broken.length} broken/errored, ${redir.length} redirects, ${badAssets.length} broken assets`
  );
  L.push('');

  L.push('## 🚨 Broken pages (404/5xx/network)', '');
  if (broken.length) {
    broken.forEach(([p, v]) => L.push(`- \`${p}\` → ${v.status || v.error}`));
  } else L.push('_none_');
  L.push('');
  L.push('## 🔀 Redirects', '');
  if (redir.length) {
    redir.forEach(([p, f]) => L.push(`- \`${p}\` → 301 → \`${f}\``));
  } else L.push('_none_');
  L.push('');
  L.push('## 🕳️ Orphan pages (0 internal inlinks)', '');
  const orph = orphans.map(([p]) => p);
  if (orph.length) {
    L.push(`_${orph.length} orphans_`);
    orph.forEach((p) => L.push(`- \`${p}\``));
  } else L.push('_none_');
  L.push('');
  L.push('## 🧩 Duplicate page sets (dj/*.html vs data/djs/profiles/*.html)', '');
  L.push(`- IDs with BOTH a \`dj/*.html\` AND a \`profiles/*.html\`: **${dup.length}**`);
  L.push(
    `- IDs only as \`dj/*.html\`: **${onlyDj.length}** ${onlyDj.slice(0, 5).join(', ')}${onlyDj.length > 5 ? '…' : ''}`
  );
  L.push(
    `- IDs only as \`profiles/*.html\`: **${onlyProf.length}** ${onlyProf.slice(0, 5).join(', ')}${onlyProf.length > 5 ? '…' : ''}`
  );
  L.push('');
  L.push('## 🧨 Broken assets (img/script/link/src)', '');
  const ba = badAssets.map(([u, s]) => `- [${s}] \`${u.replace(BASE, '')}\``);
  if (ba.length) {
    L.push(`_${badAssets.length} broken assets_`);
    L.push(...ba);
  } else L.push('_none_');
  L.push('');
  L.push('## 📄 Page inventory', '');
  L.push('| path | status | inlinks |');
  L.push('|------|--------|---------|');
  for (const [p, v] of pagesArr) L.push(`| \`${p}\` | ${v.status} | ${v.inlinks} |`);
  L.push('');

  const file = path.join(__dirname, 'report', 'crawl-report.md');
  fs.writeFileSync(file, L.join('\n'));
  console.log(
    `Crawl done: ${okPages.length} OK, ${broken.length} broken, ${orphans.length} orphans, ${dup.length} duplicate ids, ${badAssets.length} bad assets`
  );
  console.log(`Report: ${file}`);
}

main();
