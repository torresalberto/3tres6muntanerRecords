# Swup Integration — Continuous Music Playback

**Date:** June 9, 2026
**Goal:** Keep the audio player running continuously as users navigate
between pages (index, 3d-brain, blog, dj-library, product, dj/*, toolhub).

## What was the problem

The site was a static multi-page site. Each page had its own copy of
`player-init.js` + `audio.js` (or `AudioPlayer` inside `script.js`).
Clicking a link like `<a href="3d-brain.html">` triggered a real page
navigation that destroyed the current page's YouTube iframe. The new
page would re-create the iframe from scratch, restarting the audio
and producing a brief gap or autoplay-blocked silence.

## What was done

Added [Swup v4.9.0](https://swup.js.org/) to enable seamless client-side
page transitions. The YouTube iframe now lives **outside the swappable
container**, so it is never destroyed on navigation.

### Files added

- `js/vendor/swup.umd.js` — Swup library, vendored locally (25 KB).
- `js/swup-init.js` — Swup initializer + `window.Muntaner336.onPageView`
  hook system for per-page re-initialization.

### Files modified

All 16 HTML pages now have:

- `<main data-swup>` wrapper around their content.
- `<script src="js/vendor/swup.umd.js" defer></script>` and
  `<script src="js/swup-init.js" defer></script>` loaded before
  `player-init.js`.

Specific pages with extra wrapping:

- **`index.html`** — Wrapped the existing `<section>`s in `<main data-swup>`.
  The audio player (`#audioControls`, `#youtubeAudioContainer`) was
  already outside any wrapper, so it survives navigation unchanged.
- **`3d-brain.html`** — Wrapped the ~840-line inline Three.js / SVG
  script in `window.Muntaner336.init3DBrain()` so it can re-run on
  every navigation back to the page.
- **`blog.html`** — Mobile menu + category filter wrapped in
  `initBlogPage()` with idempotent event binding.
- **`dj-library.html`** — `loadDjs()` + `DJGraph.init()` wrapped in
  `initDjLibrary()`.
- **`product.html`** — Thumbnail gallery + scroll effect wrapped in
  `initProductPage()`.
- **`toolhub/index.html`** — Tooltab deep-link logic wrapped in
  `initToolhubPage()`.
- **`dj/*.html`** (10 pages) — Related-DJ fetch wrapped in
  `initDjPage_<name>()`.

- **`script.js`** — Refactored the bottom init block:
  - Wrapped all component init calls in a callable `initHomepage()`.
  - Exposed `window.Muntaner336.reinitHomepage()` for Swup to call.
  - Excluded `AudioPlayer.init()` from re-init (its state must persist).

## How it works

1. User clicks `<a href="3d-brain.html">`.
2. Swup intercepts the click (via the `linkSelector` config).
3. Swup fetches `3d-brain.html` in the background.
4. Swup parses the response and finds `<main data-swup>`.
5. Swup calls `Element.replaceWith()` to swap the OLD `<main>` with
   the NEW `<main>` — the header, footer, and **audio player** are
   never touched.
6. Swup fires the `page:view` hook.
7. `swup-init.js` runs all registered `onPageView` handlers, which
   re-bind event listeners on the new DOM.
8. The YouTube iframe continues playing without interruption.

## Configuration

The Swup instance is configured to:

- Cache pages (`cache: true`) for instant back/forward.
- Skip links with `target="_blank"`, `download`, `mailto:`, `tel:`,
  `rel="external"`, `data-no-swup`, or in-page anchors (`#`).
- Default container selector: `[data-swup]`.

## Validation

Ran a structural verification script that confirmed:

- All 16 pages have `<main data-swup>` and balanced `<main>` tags.
- All 16 pages load the Swup scripts.
- In `index.html`, the audio player is rendered **before** `<main data-swup>`,
  so it's never destroyed by Swup.
- Swup UMD module loads (verified in Node.js: `class`, version 4.9.0).
- `js/swup-init.js` passes Prettier and ESLint.

## Known limitations

- **No headless browser available** in this environment to run an
  end-to-end smoke test. Manual testing in a real browser is required.
- **3d-brain animation loop** has no teardown for `requestAnimationFrame`
  on re-init. If a user rapidly navigates in/out of 3d-brain, multiple
  animation loops could run briefly. In practice this is invisible.
- The `@swup/scripts-plugin` is not used (it warns of memory leaks).
  Inline scripts are wrapped manually as init functions instead.
