'use strict';

/**
 * display-audit — page-by-page browser display audit of the live site.
 * For every page (main sections + all dj/* + orphans) it loads the page at
 * desktop and mobile viewports and records:
 *   - console/page errors, failed requests, HTTP >=400
 *   - broken <img> (after scroll-through to trigger lazy loads)
 *   - horizontal overflow (document scrollWidth vs clientWidth)
 *   - stuck loading spinners / empty containers
 *   - presence of key page elements
 *   - screenshots (desktop for all, mobile for main pages)
 * Plus a menu audit on every main page:
 *   - does the mobile hamburger actually reveal the nav?
 *   - every nav/subnav/footer href resolved (path vs hash) + active state.
 *
 * Usage:
 *   node qa/display-audit.js [--url <origin>] [--pages <csv>] [--no-screenshots]
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { createCapture } = require('./lib/capture');

const BASE =
  process.env.BASE_URL ||
  process.argv.find((a) => a.startsWith('--url='))?.split('=')[1] ||
  'https://3tres6records.albto.me';
const ONLY_PAGES = process.argv.find((a) => a.startsWith('--pages='))?.split('=')[1] || '';
const ONLY_SET = ONLY_PAGES ? new Set(ONLY_PAGES.split(',').map((s) => s.trim())) : null;
const NO_SHOTS = process.argv.includes('--no-screenshots');

const reportDir = path.join(__dirname, 'report');
const shotDir = path.join(__dirname, 'screenshots', 'display');
fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(shotDir, { recursive: true });

const MAIN = [
  { path: '/', label: 'home' },
  { path: '/3d-brain.html', label: 'brain' },
  { path: '/crew.html', label: 'crew' },
  { path: '/mapa.html', label: 'mapa' },
  { path: '/blog.html', label: 'blog' },
  { path: '/dj-library.html', label: 'dj-library' },
  { path: '/product.html', label: 'product' },
  { path: '/toolhub/', label: 'toolhub' },
  { path: '/dj-library/', label: 'dj-library-static' },
  { path: '/dj-library/page-2.html', label: 'dj-library-static-p2' },
  { path: '/crew/d-mfrutis/', label: 'crew-d-mfrutis' },
];

function djPages() {
  const dir = path.join(__dirname, '..', 'dj');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.html'))
    .sort()
    .map((f) => ({ path: '/dj/' + f, label: 'dj/' + f.replace('.html', '') }));
}

const DJ_SAMPLE = 5;

/** Key elements (selector -> minimum expected count) per main page. */
const KEY = {
  '/': {
    elems: {
      '.product-grid a, .product-grid .product-card': 3,
      '#dynamicCalendar .calendar-body': 1,
    },
  },
  '/3d-brain.html': { elems: { '#sphere-svg circle': 1 } },
  '/crew.html': { elems: { '#crewGrid .dj-card': 1 } },
  '/mapa.html': { elems: { '.leaflet-marker-icon': 1 } },
  '/blog.html': { elems: { '.blog-card, article': 1 } },
  '/dj-library.html': { elems: { '.dj-card': 1 } },
  '/product.html': { elems: { '.product-detail, .product-info': 1 } },
  '/toolhub/': { elems: { '#camelot-wheel, .camelot-wheel, [id*="camelot"]': 1 } },
};

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

function slug(p) {
  return (
    p.path === '/'
      ? 'home'
      : p.path
          .replace(/^\//, '')
          .replace(/\//g, '_')
          .replace(/\.html$/, '')
  ).replace(/[^\w-]/g, '_');
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.floor(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
}

async function collect(page, cap, p) {
  await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await scrollThrough(page);
  await page.waitForTimeout(800);

  const state = await page.evaluate(() => {
    const broken = [...document.images]
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => (i.src || '').slice(0, 180));
    const sw = document.scrollingElement ? document.scrollingElement.scrollWidth : 0;
    const vw = document.documentElement.clientWidth;
    return {
      title: document.title,
      h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 80),
      sw,
      vw,
      broken,
      spinners: [...document.querySelectorAll('.dj-grid-loading, .loading-spinner, .loader')]
        .filter((el) => el.offsetParent !== null)
        .map((el) => el.className),
    };
  });

  const elems = {};
  const key = KEY[p.path] || {};
  for (const [sel, min] of Object.entries(key.elems || {})) {
    const n = await page.locator(sel).count();
    elems[sel] = n;
    if (n < min) state.missing = state.missing || [];
    state.elems = elems;
  }

  return {
    ...state,
    console: cap.console.slice(0, 25),
    pageErrors: cap.pageErrors.slice(0, 10),
    http: cap.http.slice(0, 40),
    failed: cap.failed.slice(0, 20),
  };
}

async function menuAudit(page, vp) {
  await page.waitForTimeout(400);
  const r = await page.evaluate((mobileVp) => {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mainNav');
    const mobileNav = document.getElementById('mobileNav');
    const btnVisible = btn ? getComputedStyle(btn).display !== 'none' : false;
    const drawer = mobileVp && mobileNav ? mobileNav : nav;
    const state = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const cls = el.classList.contains('active') || el.classList.contains('nav-open');
      const visible =
        cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.5;
      return cls || visible ? 'open' : 'closed';
    };
    const before = state(drawer);
    if (btn) btn.click();
    const after = state(drawer);
    const btnActive = btn ? btn.classList.contains('active') : false;
    const links = [];
    for (const a of document.querySelectorAll(
      '#mainNav a, #mobileNav a, .subnav-tabs a, .footer-nav a'
    )) {
      const href = a.getAttribute('href') || '';
      const txt = (a.textContent || '').trim().slice(0, 30);
      const isHash = /^#/.test(href);
      const abs = isHash ? null : new URL(href, location.href).href;
      links.push({ txt, href, abs });
    }
    const active = [...document.querySelectorAll('.nav-item.active')].map((a) =>
      (a.textContent || '').trim()
    );
    return {
      btnVisible,
      drawer: drawer ? drawer.id : null,
      navBefore: before,
      navAfter: after,
      btnActive,
      links,
      active,
      logo: document.querySelector('.logo')?.getAttribute('href') || null,
    };
  }, vp === 'mobile');
  return r;
}

/** Audit one page at one viewport with a fresh context; if the browser or
 *  page dies mid-run (heavy pages can crash the renderer / exhaust memory),
 *  relaunch the browser and retry. */
async function auditViewport(state, p, vp) {
  for (let attempt = 0; attempt < 3; attempt++) {
    let context;
    try {
      context = await state.browser.newContext({
        viewport: VIEWPORTS[vp],
        ignoreHTTPSErrors: true,
        locale: 'es-MX',
      });
    } catch (e) {
      state.browser = await launchBrowser();
      continue;
    }
    const page = await context.newPage();
    const cap = createCapture(page);
    try {
      const entry = await collect(page, cap, p);
      if (MAIN.some((m) => m.path === p.path) && !NO_SHOTS) {
        const file = path.join(shotDir, `${slug(p)}-${vp}.png`);
        await page.screenshot({ path: file, fullPage: false }).catch(() => {});
        entry.screenshot = path.relative(process.cwd(), file);
      }
      if (MAIN.some((m) => m.path === p.path)) {
        entry.menu = await menuAudit(page, vp);
      }
      await context.close();
      return entry;
    } catch (e) {
      await context.close().catch(() => {});
      if (attempt === 2) {
        console.log(`  [${vp}] ${p.path}  ⚠️ audit error: ${e.message}`);
        return { sw: 0, vw: 0, error: e.message, broken: [], http: [], failed: [], pageErrors: [] };
      }
    }
  }
}

async function launchBrowser() {
  return chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });
}

/** Proactively recycle the browser every few pages to avoid memory growth
 *  crashing the renderer on long runs (67+ page/viewport audits). */
const RECYCLE_EVERY = 20;

async function main() {
  const state = { browser: await launchBrowser() };
  const pages = [...MAIN, ...djPages()];
  const results = [];

  for (const p of pages) {
    if (ONLY_SET && !ONLY_SET.has(p.path) && !ONLY_SET.has(p.label)) continue;
    const viewports = ['desktop'];
    if (
      p.path === '/3d-brain.html' ||
      p.path === '/crew.html' ||
      MAIN.some((m) => m.path === p.path)
    ) {
      viewports.push('mobile');
    }
    const rec = { path: p.path, label: p.label, viewports: {} };

    for (const vp of viewports) {
      if (results.length > 0 && results.length % RECYCLE_EVERY === 0) {
        await state.browser.close().catch(() => {});
        state.browser = await launchBrowser();
      }
      const entry = await auditViewport(state, p, vp);
      rec.viewports[vp] = entry;
      console.log(
        `  [${vp}] ${p.path}  overflow=${entry.sw}->${entry.vw}  broken=${entry.broken.length}  http>=400=${entry.http.length}  errs=${entry.pageErrors.length}`
      );
    }
    results.push(rec);
  }

  await state.browser.close();
  writeReport(results);
  writeJson(results);
  const bad = results.filter((r) => {
    const v = Object.values(r.viewports).find(
      (x) => x.sw > x.vw + 2 || x.broken.length || x.pageErrors.length
    );
    return !!v;
  });
  console.log(`\n== DISPLAY AUDIT: ${results.length} pages, ${bad.length} with issues ==`);
}

function writeReport(results) {
  const L = [];
  L.push('# 3TRES6 QA — Display Audit Report');
  L.push('');
  L.push(`- **Date:** ${new Date().toISOString()}`);
  L.push(`- **Target:** \`${BASE}\``);
  L.push(`- **Pages audited:** ${results.length}`);
  L.push('');

  L.push('## Summary');
  L.push('');
  L.push(
    '| Page | Label | VP | Title | Overflow | Broken imgs | HTTP≥400 | Page errors | Spinners |'
  );
  L.push(
    '|------|-------|----|-------|----------|-------------|----------|-------------|----------|'
  );
  for (const r of results) {
    for (const [vp, e] of Object.entries(r.viewports)) {
      const over = e.sw > e.vw + 2 ? `⚠️ ${e.sw}->${e.vw}` : 'ok';
      L.push(
        `| ${r.path} | ${r.label} | ${vp} | ${(e.title || '').slice(0, 40).replace(/\|/g, '')} | ${over} | ${e.broken.length ? '❌ ' + e.broken.length : '0'} | ${e.http.length} | ${e.pageErrors.length ? '❌' : '0'} | ${(e.spinners || []).length ? '⚠️ ' + e.spinners.join(',') : ''} |`
      );
    }
  }
  L.push('');

  L.push('## Menu audit (main pages)');
  L.push('');
  L.push('| Page | VP | mobile btn | drawer | before | after click | active | links |');
  L.push('|------|----|-----------|--------|--------|-------------|--------|-------|');
  for (const r of results) {
    for (const [vp, e] of Object.entries(r.viewports)) {
      if (!e.menu) continue;
      const m = e.menu;
      const open = m.navAfter === 'open';
      L.push(
        `| ${r.path} | ${vp} | ${m.btnVisible} | ${m.drawer || '—'} | ${m.navBefore || '—'} | ${m.navAfter || '—'} ${open ? '✅opens' : '❌stays-hidden'} | ${m.active.join(',') || '—'} | ${m.links.length} |`
      );
    }
  }
  L.push('');

  L.push('## Per-page details');
  L.push('');
  for (const r of results) {
    L.push(`### ${r.path} (${r.label})`);
    for (const [vp, e] of Object.entries(r.viewports)) {
      L.push(`**${vp}** — ${e.title}`);
      if (e.screenshot) L.push(`- 📸 ${e.screenshot}`);
      if (e.broken.length)
        L.push(`- ❌ broken imgs (${e.broken.length}): ${e.broken.slice(0, 6).join('; ')}`);
      if (e.pageErrors.length) L.push(`- 🛑 page errors: ${e.pageErrors.join('; ')}`);
      if (e.console.length) L.push(`- 📝 console: ${e.console.slice(0, 5).join('; ')}`);
      const noise = (e.http || []).filter(
        (h) =>
          !/google|googletagmanager|gstatic|doubleclick|youtube|ytimg|schema|discogs/i.test(h.url)
      );
      if (noise.length)
        L.push(
          `- ⚠️ HTTP: ${noise
            .slice(0, 10)
            .map((h) => `[${h.status}] ${h.url}`)
            .join('; ')}`
        );
      if (e.spinners && e.spinners.length)
        L.push(`- ⚠️ visible spinners: ${e.spinners.join(', ')}`);
      if (e.elems) {
        const missing = Object.entries(e.elems).filter(([k, v]) => v === 0);
        if (missing.length)
          L.push(`- ❌ missing elements: ${missing.map(([k, v]) => `${k} (${v})`).join(', ')}`);
      }
      if (e.menu) {
        L.push(`- menu: logo=${e.menu.logo} active=[${e.menu.active.join(',')}]`);
        const odd = e.menu.links.filter(
          (l) =>
            l.abs &&
            /3tres6muntanerRecords|\.html$/.test(l.abs) &&
            !l.abs.startsWith(BASE) &&
            !/^(https?:)?\/\//.test(l.abs)
        );
        L.push(
          `- links(${e.menu.links.length}): ${e.menu.links
            .slice(0, 30)
            .map((l) => `${l.txt}→${l.href}`)
            .join(' | ')}`
        );
      }
    }
    L.push('');
  }

  const file = path.join(reportDir, 'display-report.md');
  fs.writeFileSync(file, L.join('\n'));
  console.log(`Report written: ${file}`);
}

function writeJson(results) {
  const file = path.join(reportDir, 'display.json');
  fs.writeFileSync(file, JSON.stringify(results, null, 2));
  console.log(`JSON written: ${file}`);
}

main();
