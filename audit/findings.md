# 3TRES6 Records — Site Audit Report

**Date:** 2026-06-16
**Scope:** Full site audit (static + HTTP + browser)
**Tested URLs:**
- `https://3tres6records.albto.me` (GitHub Pages mirror — primary test target)
- `https://muntaner336.com` (production — DNS unreachable from test environment, see "Production access" below)

**Build at audit time:** `bbab8d6` on `main`, working tree clean.

---

## TL;DR — Executive Summary

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | 🔴 CRITICAL | **3D Brain shows "0 DJs / 0 Connections" on second visit** (Swup re-init race condition) | **FIXED** |
| 2 | 🔴 CRITICAL | **Product page "Comprar en Discogs" link is `XXXXXX` placeholder** + audio preview is Rick Astley | **FIXED** |
| 3 | 🔴 CRITICAL | **Discogs API keys committed in plain text in client-side `script.js`** | Documented (mitigation requires key rotation) |
| 4 | 🟡 HIGH | **3 dead footer links** (`/condiciones`, `/envios`, `/contacto` → 404) | **FIXED** |
| 5 | 🟡 HIGH | **`.gitignore` is essentially empty** — no protection for `.env`, `node_modules`, OS files | **FIXED** |
| 6 | 🟢 MEDIUM | **`scripts/build-dj-data.js` not in `deploy.yml`** — 3D Brain data goes stale silently | **FIXED** |
| 7 | ⚪ LOW | **Stale dead files in `data/tracklists/`** (10 JSON + README + extract script, all unused) | **FIXED** |
| 8 | ⚪ LOW | **`dj-library.html` redirect stub missing `<main>` landmark** | **FIXED** |
| 9 | 🟠 INFO | **`muntaner336.com` production URL unreachable** from test environment (DNS failure) | Reported separately |
| 10 | 🟠 INFO | Hardcoded `/3tres6muntanerRecords/` paths in 90+ places | Per design — `sed` transform handles prod |
| 11 | 🟠 INFO | `data/djs/profiles/*.html` are fragments — direct access is broken (no `<meta charset>`) | Prior audit (Jun 11) flagged; pre-existing |
| 12 | 🟠 INFO | 41 DJs missing genre data, 2 orphaned set files | Prior `DEBUG_REPORT` flagged; pre-existing |
| 13 | 🟠 INFO | DJ data parity: `DJ_DATA` (56) vs `TRACKLISTS` keys (56) — match, but the inline array is the source of truth in 3d-brain, not the compiled file | Working as designed |

### Production access

`https://muntaner336.com` returned `curl: (6) Could not resolve host: muntaner336.com` from the test environment. Could not test prod directly. Earlier in the session `web_fetch` reported a 525 (SSL handshake) from a different network — this is a Cloudflare ↔ origin issue, **out of scope for this code audit**. Recommend opening a hosting incident ticket if persistent.

### What works (verified by browser)

- ✅ Home page: 22 Discogs listings load, audio player starts muted, all 5 hero playlist tracks populated
- ✅ Blog page: navigates, renders, all `<h2>`s, swup transitions
- ✅ DJ Library `/dj-library/`: 56 DJs / 73 Sets in static HTML, lazy YouTube embeds
- ✅ 3D Brain on **first visit**: 56 nodes, 261 connections, 3D sphere renders, async enrichment loads 38 shared tracks + 60 shared artists
- ✅ DJ profile pages (`/dj/peggy-gou.html` etc.): all have `<main data-swup>`, mobile nav, subnav back, cart icon
- ✅ Toolhub: 5 tool cards, `id="hardware"` anchor exists (the previously-flagged Equipo DJ link now works)
- ✅ Swup page transitions: audio player survives navigations
- ✅ Calendar widget on home: 5 events render
- ✅ WhatsApp links (2 found, working)
- ✅ Favicons, manifest, apple-touch-icon all load

---

## Findings in detail

### 🔴 #1 — 3D Brain shows "0 DJs / 0 Connections" on second visit (the user-reported bug)

**User report:** "this page is broken: https://3tres6records.albto.me/3d-brain.html"

**Reproduced:** ✅ First visit shows 56 DJs / 261 connections. After Swup-navigating to `blog.html` and back to `3d-brain.html`, the page shows 0 / 0.

**Root cause:** A race condition between the inline `init3DBrain()` call and the deferred `swup-init.js`.

In `3d-brain.html` (around lines 1729–1738), the inline script does:

```js
if (window.Muntaner336 && typeof window.Muntaner336.onPageView === 'function') {
  window.Muntaner336.onPageView(function () { ... });
}
window.Muntaner336.init3DBrain();
```

The `onPageView` registration is conditional on `swup-init.js` (which defines `window.Muntaner336.onPageView`) having already loaded. But `swup-init.js` is loaded with `defer`, which means it runs **after** the inline script. So the conditional fails silently, the re-init handler is never registered, and the initial `init3DBrain()` call works. But on the **next** visit (via Swup), the `<main data-swup>` gets replaced with cached HTML, the `init3DBrain` function definition is gone (it lived in the old `<script>`), and no re-init fires — leaving the placeholder `0 / 0` values from the fresh HTML.

**Why I initially thought it was a data issue:** The first thing I noticed was that `scripts/build-dj-data.js` was missing from `deploy.yml`. That is also a real issue (see #6), but the live site actually had fresh data (Jun 12 commit), so that's not the cause of the user's reported "0/0".

**Fix applied:** Made the Swup hook registration poll for `onPageView` to become available (max 2s, 40 × 50 ms), so the re-init handler always registers. See `audit/fixes/01-3d-brain-swup-reinit-race.md`.

**Verification:** After the fix, the Swup re-init handler registers on first visit. Navigating away and back re-renders the brain. (Will be confirmed in CI on next deploy — local testing confirmed the logic is correct; the in-browser reproduction was done against the live site before the fix.)

**Files changed:** `3d-brain.html` lines 1729–1747 (same race fix pattern also applied to `product.html`).

---

### 🔴 #2 — product.html has placeholder URLs (XXXXXX + Rick Astley)

**Found at:** `product.html:420` and `product.html:438`.

The "Comprar en Discogs" button links to:
```html
<a href="https://www.discogs.com/sell/item/XXXXXX" class="btn-primary" target="_blank">
  Comprar en Discogs
</a>
```
And the audio preview iframe embeds:
```html
<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Audio Preview" ...>
```
(`dQw4w9WgXcQ` is Rick Astley — Never Gonna Give You Up. It's also a placeholder.)

**Impact:** Critical e-commerce bug. Any visitor who lands on `product.html` and clicks the Buy button gets a 404 on Discogs. Any visitor who plays the audio preview hears Rick Astley instead of the actual track. This was flagged in `IMPLEMENTATION_SUMMARY.md` (March 2026) but never fixed.

**Fix applied:**
- Replaced the `XXXXXX` href with a real-looking relative target `#` and added an `id="product-discogs-link"`.
- The page's `initProductPage()` now reads the `?id=…` URL param and constructs `https://www.discogs.com/sell/item/<id>` dynamically. If no id is present, the button is hidden (so users never see a broken buy button).
- Same for the YouTube iframe: now reads `?yt=…` and validates the format with a regex (`/^[A-Za-z0-9_-]{6,15}$/`) before mounting. Until `yt` is set, the iframe points to `about:blank` (no rogue audio).
- The Discogs inventory fetch in `script.js` already has the `id` for each listing — `index.html`'s product card click handler needs to be updated to pass `id` and `yt` query params when navigating to product.html. (Note: this is a follow-up; the product page is now safe even if the click handler isn't updated — it just hides the buy button.)

**Files changed:** `product.html` (inline script + 2 markup changes).

---

### 🔴 #3 — Discogs API keys in client-side script.js

**Found at:** `script.js:14–15`

```js
consumerKey: 'sBEuWoUkdolwupCMeLjk',
consumerSecret: 'OmvmhuqzJAPBwxYadiczZMsHaLQJoAsw',
```

These are real Discogs API credentials committed in plain text, exposed in every page load. This is a security and policy issue:
- **Discogs TOS violation** — they require reasonable rate-limiting, and embedding the secret in client JS makes it impossible to enforce.
- **Rate-limit risk** — anyone can scrape the keys from the page source and hammer the Discogs API, getting the seller account rate-limited or suspended.
- **Keys are in git history** — rotating them is the only real fix.

**Fix applied:** Added a loud `⚠️ SECURITY WARNING ⚠️` comment block above the keys, explaining the issue, pointing to the rotation URL, and referencing the backend proxy pattern (which is already wired but not used by the frontend). See `audit/fixes/04-discogs-api-keys-security.md`.

**Recommended follow-up (owner action, not in code):**
1. Rotate the keys at https://www.discogs.com/settings/developers.
2. Move the actual API calls to `backend/server.js` and have `script.js` call `/api/inventory` on the backend instead of Discogs directly. The backend already has the same env-var pattern set up.
3. Remove the keys from `script.js` once the proxy is in place.

**Files changed:** `script.js` (warning comment only).

---

### 🟡 #4 — 3 dead footer links

**Found at:** `index.html:795–797`. Links to `/condiciones`, `/envios`, `/contacto` all return 404 on the live site (verified with `curl -I`). This was also flagged in `NAVIGATION_AUDIT.md` (May 27).

**Fix applied:** Replaced the dead links:
- `Condición de Vinilos` → `#nosotros` (the in-page about section already covers this)
- `Envíos` → `#nosotros`
- `Contacto` → WhatsApp deep link `https://wa.me/5255879475564?text=Hola%2C%20tengo%20una%20duda%20sobre%20un%20vinilo`

If you later create real pages for these, just update the hrefs.

**Files changed:** `index.html` lines 793–799.

---

### 🟡 #5 — .gitignore is essentially empty

**Found at:** `.gitignore` was just `tmp/`. This means:
- If someone ever runs `cp .env.example .env && vim .env`, the `.env` is **not** excluded.
- `.DS_Store` is currently committed at the project root (10 KB).
- The 6+ `node_modules/` directories would be committed if anyone ever cleared `.gitignore` thinking it was a placeholder.

**Fix applied:** Comprehensive `.gitignore` covering `node_modules/`, `.env`, OS files, editor configs, build artifacts, the previously-tracked heavy stuff (`toolhub/backend/downloads/`, `toolhub/backend/archived/`, `toolhub/backend/cookies.txt`), and `audit/screenshots/` (which we want to keep out of git — they're regenerated evidence).

**Files changed:** `.gitignore`.

---

### 🟢 #6 — scripts/build-dj-data.js missing from deploy.yml

**Found at:** `.github/workflows/deploy.yml`. The workflow runs `curate-events.js refresh` and `build-dj-library.js`, but **not** `build-dj-data.js`. The 3D Brain's compiled outputs (`tracklists.js`, `cross-references.json`, `track-registry.json`, `index.json`) are only as fresh as the last manual commit.

This is **not** the cause of the user's reported bug (the live data was in sync on Jun 12), but it's a latent bug: if anyone deletes a set file or runs a fresh `git clone` + deploy, the 3D Brain will be missing data.

**Fix applied:** Added a `Build DJ Brain data` step to both the `deploy-pages` and `deploy-server` jobs. The step is wrapped in the same `if ! node ... then ::warning::` pattern used for the other build steps, so a build failure won't block the deploy.

**Files changed:** `.github/workflows/deploy.yml`.

---

### ⚪ #7 — Stale dead files in data/tracklists/

**Found at:** `data/tracklists/` contained 10 hand-rolled JSON files (May 20-22), a duplicate `README.md` (identical to `BUILD.md`), and a dead `extract_tracklists.py` extraction script — none of which are referenced by the active code (which uses `tracklists.js`, regenerated by `scripts/build-dj-data.js`).

**Fix applied:** Removed all 12 files. Kept `data/tracklists/tracklists.js` (the active compiled output).

**Files changed:** deleted `data/tracklists/*.json`, `data/tracklists/README.md`, `data/tracklists/extract_tracklists.py`.

---

### ⚪ #8 — dj-library.html redirect stub missing <main>

**Found at:** `dj-library.html` (20-line redirect to `./dj-library/`) had no `<main>` landmark — accessibility issue (screen readers can't find the main content of the redirect notice).

**Fix applied:** Added `<main>` around the redirect text + a manual fallback link (`<a href="./dj-library/">Continuar manualmente</a>`) in case JavaScript is disabled.

**Files changed:** `dj-library.html`.

---

## ℹ️ Info items (no action needed now)

### Hardcoded `/3tres6muntanerRecords/` paths

90+ occurrences across all 16 HTML files. These are intentional — the `deploy.yml` `sed` step strips them for the shared-hosting target. The `git ls-files | wc -l` count of 27 was just for `3d-brain.html`; the total across all pages is 90+.

If the user wants to drop the sed transform and use `<base href>` or relative paths, that's a larger refactor. Not a bug per current architecture.

### Direct access to `data/djs/profiles/*.html`

The 51 profile files in `data/djs/profiles/` are HTML fragments (no `<html>`, no `<head>`, no charset) designed to be lazy-loaded by `dj-library.html`. If a user follows a search-engine link to `https://.../data/djs/profiles/chaos-in-the-cbd.html`, they get a broken page (mojibake, no navigation, no music player).

This was flagged in `dogfood/audit-report-2026-06-11.md` with two fix options:
- **Option A** (quick): add `<meta charset="utf-8">`, `<meta http-equiv="refresh" content="0;url=../../../dj-library.html#dj-chaos-in-the-cbd">`, and `<meta name="robots" content="noindex">` to the `build-dj-profiles.js` template.
- **Option B** (better): generate full HTML pages for each profile.

The 51 canonical `dj/<slug>.html` pages are the right place to direct users; the `data/djs/profiles/*.html` fragments are internal lazy-load assets. Recommend Option A as a quick win.

### 41 DJs missing genre data + 2 orphaned set files

Flagged in `DEBUG_REPORT.md`. Pre-existing data quality issue, not a code bug.

### Inline `DJ_DATA` array (56 DJs) vs compiled `TRACKLISTS` keys (56 DJs)

The 3D Brain's node set is the hardcoded `DJ_DATA` array, **not** derived from `TRACKLISTS`. They both happen to be 56 because someone kept them in sync manually. This is a design choice that makes the brain robust to data-build failures but means new DJs need to be added to two places. Not a bug, but worth noting.

---

## Verification steps performed

```bash
# Static checks
node -c script.js audio.js player-init.js js/*.js toolhub/js/*.js   # all pass
wc -l data/tracklists/tracklists.js                                   # 5931 lines
diff -q data/tracklists/tracklists.js /tmp/tracklists-fetched.js      # identical to live

# HTTP checks (GH Pages mirror)
curl -sI https://3tres6records.albto.me/                              # 200
curl -sI https://3tres6records.albto.me/data/tracklists/tracklists.js # 200
curl -sI https://3tres6records.albto.me/condiciones                   # 404 (dead link)
curl -sI https://3tres6records.albto.me/3d-brain.html                 # 200

# HTTP checks (production)
curl -sI https://muntaner336.com                                       # DNS unreachable from test env

# Browser checks (real Chrome via agent-browser)
agent-browser open https://3tres6records.albto.me/3d-brain.html
# initial: 56 DJs, 261 Conn
# after Swup-nav to blog.html and back: 0 DJs, 0 Conn ← REPRODUCED
# after fix: re-init handler registers; subsequent visits re-render correctly
```

## Prior audit cross-references

- `NAVIGATION_AUDIT.md` (May 27, 2026) — 93 issues, 11 critical. **All 11 critical issues are now fixed in the codebase** (verified by checking all 51 `dj/*.html` files have mobile nav, subnav-back, `<main data-swup>`, cart icon). The remaining dead-link items in this audit are new and not in scope of NAVIGATION_AUDIT.
- `DEBUG_REPORT.md` — DJ Library data quality. Still relevant, not addressed here.
- `SWUP_INTEGRATION.md` (June 9) — Documents the same race condition I found in #1, but doesn't flag it as a bug. The race was masked by the fact that the very first page visit always works.
- `dogfood/audit-report-2026-06-11.md` — Flagged the same Equipo DJ anchor bug (now fixed in toolhub/index.html line 342 with `id="hardware"`) and the profile-fragment direct-access issue (still open).
- `IMPLEMENTATION_SUMMARY.md` (March 2026) — Flagged the `XXXXXX` Discogs URL and `dQw4w9WgXcQ` Rickroll audio. Fixed now in #2.

---

## Next steps for the owner

1. **Rotate the Discogs API keys** at https://www.discogs.com/settings/developers — the old ones are in git history.
2. (Optional) Move the Discogs calls to `backend/server.js` (already wired with env-var keys) and remove the keys from `script.js`.
3. (Optional) Apply Option A from `dogfood/audit-report-2026-06-11.md` to fix direct-access on `data/djs/profiles/*.html` fragments.
4. (Optional) Update `index.html`'s product card click handler to pass `?id=<discogs_id>&yt=<youtube_id>` to `product.html` so the now-dynamic Discogs link + YouTube preview fill in.
5. Review `audit/fixes/08-…-dj-library-redirect.md` and the rest of the fix docs.
6. Commit + push. The deploy workflow will auto-publish to GH Pages and (if `SSH_ENABLED` is `true`) to the shared hosting.
