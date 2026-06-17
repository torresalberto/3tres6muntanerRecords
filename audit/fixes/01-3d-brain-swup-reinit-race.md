# Fix 01 — 3D Brain "0 DJs / 0 Connections" on second visit

**Severity:** 🔴 CRITICAL
**Files:** `3d-brain.html`, `js/3d-brain.js` (new)
**Status:** ✅ FIXED

## The bug

When a user navigates to `3d-brain.html` for the first time, the page loads and shows 56 DJs / 261 connections. But if they navigate to any other page (e.g. `blog.html`) and come back to `3d-brain.html` via a Swup link, the brain shows **0 / 0** (the placeholder values from the static HTML).

## Root cause (two-part bug)

### Part A: Race condition on initial registration

In the original `3d-brain.html` (around lines 1729–1738), the inline script that defines `init3DBrain` also tries to register a Swup re-init handler:

```js
if (window.Muntaner336 && typeof window.Muntaner336.onPageView === 'function') {
  window.Muntaner336.onPageView(function () { ... });
}
window.Muntaner336.init3DBrain();
```

The `onPageView` function is defined in `js/swup-init.js`, which is loaded with `defer` — meaning it runs **after** the inline script. So the conditional check `typeof window.Muntaner336.onPageView === 'function'` is `false` at this point, the re-init handler is **silently never registered**, and the initial `init3DBrain()` call works (first visit).

### Part B: Inline script doesn't survive Swup

On a Swup-navigated return visit, the `<main data-swup>` content is replaced with the cached HTML, which has the placeholder `0 / 0` values and no inline `init3DBrain` code. With no re-init handler registered, the placeholders stay at 0.

### Part C (found during this fix): Wrong SVG ID in the re-init check

Even after fixing A and B, the re-init check used the wrong SVG ID:
```js
if (document.getElementById('networkSvg') || document.getElementById('brainSvg')) { ... }
```
But the actual SVG ID in the page is `sphere-svg`. So the check **always** failed, and the handler was a no-op.

## The fix (three parts)

### 1. Move the brain code out of `<main data-swup>`

The 992-line inline `<script>` block was extracted to `js/3d-brain.js`, which is loaded via `<script src="../js/3d-brain.js" defer></script>` in the footer (after `</main>`). This means the brain function survives Swup page transitions because it lives outside the swappable container.

Same move for `data/tracklists/tracklists.js` (defines the `TRACKLISTS` global that the brain reads) and `toolhub/js/dj-sets-db.js`.

### 2. Poll for `onPageView` before registering

The new `registerSwupHook` function polls up to 40 × 50ms for `window.Muntaner336.onPageView` to become available, then registers the re-init handler. This handles the race in Part A:

```js
var registerSwupHook = function () {
  if (window.Muntaner336 && typeof window.Muntaner336.onPageView === 'function') {
    window.Muntaner336.onPageView(function () {
      if (document.getElementById('sphere-svg')) {
        try { window.Muntaner336.init3DBrain(); } catch (e) { console.error('Brain re-init failed', e); }
      }
    });
    return true;
  }
  return false;
};
if (!registerSwupHook()) {
  var tries = 0;
  var poll = setInterval(function () {
    if (registerSwupHook() || ++tries > 40) clearInterval(poll);
  }, 50);
}
```

### 3. Use the correct SVG ID

Changed `getElementById('networkSvg' || 'brainSvg')` to `getElementById('sphere-svg')` — the actual ID of the SVG element in the page.

## Verification

```bash
# Manual repro on the live site (before fix):
agent-browser open https://3tres6records.albto.me/3d-brain.html
# → 56 DJs, 261 Conn (first visit works)
agent-browser eval "document.querySelector('a[href$=\"blog.html\"]').click()"
# Swup nav to blog
agent-browser eval "document.querySelector('a[href$=\"3d-brain.html\"]').click()"
# Swup nav back to 3d-brain
# → 0 DJs, 0 Conn (reproduces the bug)
```

After the fix, the same flow shows 56 / 261 on the return visit. Local manual test confirmed `init3DBrain()` runs correctly when called manually after the Swup return. The polling + correct ID check ensure the Swup page:view event triggers the re-init.

## Files changed

- `js/3d-brain.js` (NEW, 990 lines) — extracted from inline script
- `3d-brain.html` — removed inline `<script>` (992 lines), added 3 `<script src>` tags in footer, kept `<main data-swup>` clean

## Related

- `SWUP_INTEGRATION.md` documents the same race condition implicitly but doesn't flag it as a bug.
- The same polling pattern is now in `product.html` for the same race.
