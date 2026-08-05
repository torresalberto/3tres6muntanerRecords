# 3TRES6 QA — Findings (triaged)

**Date:** 2026-08-04 · **Target:** https://3tres6records.albto.me
**Evidence sources:** `journey-report.md` (14 behavioural scenarios, desktop + mobile, headless Chromium), `crawl-report.md` (link-graph audit), direct curl probes, and static repo inspection.

Severity: **Blocker** = real user-facing breakage · **Complication** = inconsistent / partial · **Note** = minor.

> **Status update (this run):** ✅ **B2** and **B4** fixed & verified locally (and on live after deploy). B1/B3/Complications/Notes remain open.

---

## 🔴 Blockers

### B1. Discogs catalog can never load live inventory — CORS-blocked
The homepage fetches `api.discogs.com/users/3tres6records/inventory` and per-release `api.discogs.com/releases/{id}` directly from the browser. Discogs does **not** send `Access-Control-Allow-Origin`, so every request is blocked:
```
Access to fetch at 'https://api.discogs.com/...' from origin
'https://3tres6records.albto.me' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```
`getInventory` throws, and the page silently falls back to 22 hardcoded fallback products (`script.js:476`). **Visitors always see fallback products, never the real shop.** Related: the Discogs API token is embedded client-side in `script.js` (readable by anyone).

**Fix direction:** proxy inventory through a tiny backend (e.g. a serverless/Node route that adds the token server-side), or pre-build the catalog to static JSON.

### B2. DJ Library data is broken at every level ✅ FIXED
- **Sets:** `dj-library.html` fetches `data/djs/sets/{dj.id}.json` for all 56 DJs → **0 of 56 exist** (real files carry a suffix, e.g. `ame-br-innervisions-ade-2012.json`). Every card shows "0 sets" and the expand shows an empty tracklist. ~56× 404 on each page load.
- **Thumbnails:** cards request `/data/djs/profiles/{dj.id}.jpg` → **0 exist**; the `onerror` fallback `/images/dj-placeholder.svg` is **also missing** → broken-image icons.
- **5 dead card links:** `donato-dozzy`, `marcel-dettmann`, `quest`, `recondite`, `stephan-bodzin` are in `data/djs/index.json` but have no `dj/*.html` → clicking their cards → 404.
- **Expand is dead:** cards are `<a href="dj/{id}.html">` with no `preventDefault`, so clicking *navigates* to the DJ page instead of expanding the tracklist (the "Ver tracklist ▸" button does nothing).
- **`updateStats` was undefined:** the hero stats (`#heroStats`) never rendered and `loadGraph()` never ran.

**Fix applied (this run):**
- Loader now reads `dj.sets[]` slugs → tracklists/set counts load for **all 56 DJs** (verified: 56 DJs · 75 sets · 893 tracks, 0 "0 sets" cards).
- Thumbnails use `dj.image` (YouTube) with an inline SVG fallback (previous fallback was a 404 and the SVG had an invalid fill color).
- Cards rebuilt as `<div>` with a working "Ver tracklist ▸" expand (clicks no longer navigate away) + a real "Ver perfil →" anchor (the old nested-anchor layout didn't navigate).
- `updateStats()` defined — hero stats now fill.
- Regenerated `dj/*.html` for all 56 DJs via `scripts/build-dj-static-pages.js` (5 new pages + 1 data refresh: `chaos-in-the-cbd.html` 2→4 sets).

### B3. toolhub references 5 scripts that don't exist → tools don't render
`toolhub/index.html` loads `gsap-animations.js`, `hardware-db.js`, `hardware-guide.js`, `music-db.js`, `music-directory.js` — **all missing** from the repo and live (404). Result: only 4 tabs render (USB / Camelot / Free Music / Software) and the **Camelot wheel never draws** (no canvas). Hardware-guide and Music-directory are dead features.

### B4. Homepage horizontal overflow on mobile ✅ FIXED
At 390px viewport the homepage scroll width is **820px** → the page scrolls sideways. Verified in `s11` (sw=820, cw=390). Cause: the JS-built calendar (`#dynamicCalendar`/`.calendar-mesh`) injects 800px-wide `.calendar-header-row`/`.calendar-body` inside a wrapper with no scroll container (the existing `overflow-x: auto` only targeted `.weekly-calendar`).

**Fix applied:** added `.calendar-mesh { overflow-x: auto }` to the ≤992px media block — the calendar now scrolls internally. Verified: page scrollWidth == viewport at 390/768/1024/1440; `s11` passes.

---

## 🟠 Complications

### C1. Buy path is split and inconsistent
- Catalog cards and QuickView both open the **Discogs seller page** in a new tab (buy-via-Discogs refactor). The **local Cart/Checkout is now dead code**: no `.add-to-cart-btn` control exists in the DOM (`script.js` still binds them), `Cart.addItem` is never called, and checkout payment is a **stub** (`CONFIG.stripePublicKey` empty → pay buttons print "Stripe no está disponible" / "Configura tu clave").
- QuickView's buy link is a **fixed** `/seller/3tres6records` URL — it ignores the per-product Discogs `listing.uri` that the catalog card's `buy-btn` does use.

### C2. Navigation model is mixed / swup inconsistent
- `3d-brain.html`, `crew.html`, `mapa.html`, `dj-library.html` have **no swup** → full page reloads (audio is re-booted from `localStorage`, not kept alive).
- Even on swup-enabled pages it's inconsistent: **home → toolhub = full reload** (`swup:navigation:end` never fires, main-frame navigation observed), while **blog → DJ Library = SPA** (`reload=false`). The homepage nav appears to bypass swup.

### C3. Newsletter submit goes to a placeholder webhook
`js/newsletter-popup.js:14`: `MAKECOM_WEBHOOK_URL: 'https://hook.make.com/your-webhook-url-here'`. Submissions POST to a placeholder URL; the fallback only sets a local "subscribed" flag. Emails are not captured anywhere.

### C4. Orphaned / parallel pages
- `product.html` (detail page with `releaseId` param + preview iframe) is **linked from nowhere**; contains **13 hardcoded `/3tres6muntanerRecords/` asset paths** (stale prefix).
- `data/djs/profiles/*.html` (**46 pages**) are orphaned (0 inlinks) and have **no `<title>` tag** (empty browser tab). They duplicate the linked `dj/*.html` set.

---

## 🟡 Notes

- **YouTube hero thumbnails 404:** `i.ytimg.com/vi/5r9kD5d0VhI/hqdefault.jpg`, `Pl5d5U5r0dI`, `5h5h5h5h5h5` — placeholder/bad video IDs in the hero playlist data (`s04`).
- GA4 + YouTube telemetry errors (`ERR_ABORTED`) are expected in headless and not site bugs.
- Blog "read more" links point to the separate `3tres6records.com/blog`; articles are inline on `blog.html` (8 articles, fine).
- `data/crew/index.js` renders 5 crew members correctly (verified live; not a bug).

---

## ✅ Verified healthy
- Map (`mapa.html`): 12 markers, 12 venue cards, stats 12/2, city tabs, popups — all pass.
- 3d-brain sphere: 57 SVG nodes — renders with 0 errors.
- Blog: 8 articles, read-more anchors resolve.
- All primary/subnav/footer nav links return 200 (25/25).
- Clean URLs `/crew/` `/mapa/` redirect correctly; DJ/profile/product pages are 200.
- Audio restore across full reloads works within the 5s window (muted + video id preserved).
- Mobile: menu, quickview, map, and DJ library all work — only the homepage overflow (B4) is broken.
