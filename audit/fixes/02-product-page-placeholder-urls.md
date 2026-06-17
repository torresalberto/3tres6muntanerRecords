# Fix 02 — product.html placeholder URLs (XXXXXX + Rick Astley)

**Severity:** 🔴 CRITICAL
**File:** `product.html` (lines 420, 438, and the inline `<script>` block)
**Status:** ✅ FIXED

## The bug

The "Comprar en Discogs" button linked to a placeholder URL:
```html
<a href="https://www.discogs.com/sell/item/XXXXXX" class="btn-primary" target="_blank">
  Comprar en Discogs
</a>
```
And the audio preview iframe embedded a Rick Astley video (placeholder):
```html
<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Audio Preview" ...>
```

Both placeholders were flagged in `IMPLEMENTATION_SUMMARY.md` (March 2026) but never fixed. Any visitor who landed on the product page and clicked Buy got a 404 on Discogs; any visitor who played the preview heard "Never Gonna Give You Up".

## The fix

1. The buy link and iframe now have stable `id`s and read URL query params.
2. `initProductPage()` validates the params and only fills in real URLs:

```js
var params = new URLSearchParams(window.location.search);
var listingId = params.get('id');
var ytId = params.get('yt');
var discogsLink = document.getElementById('product-discogs-link');
if (discogsLink && listingId && /^\d+$/.test(listingId)) {
  discogsLink.href = 'https://www.discogs.com/sell/item/' + listingId;
} else if (discogsLink) {
  discogsLink.style.display = 'none';
}
var previewIframe = document.getElementById('product-preview-iframe');
if (previewIframe && ytId && /^[A-Za-z0-9_-]{6,15}$/.test(ytId)) {
  previewIframe.src = 'https://www.youtube-nocookie.com/embed/' + ytId;
}
```

3. The iframe also switched to `youtube-nocookie.com` for better privacy.

## How to use

The product page now expects URLs of the form:
```
product.html?id=<discogs_listing_id>&yt=<youtube_video_id>
```

**Follow-up (owner action, not in this fix):** Update `index.html`'s product card click handler in `script.js` to navigate to `product.html?id=…&yt=…` when a card is clicked. Until that update, the product page will hide the buy button and skip the preview (no broken links, just an empty action area).

Example edit in `script.js` (not applied in this fix — needs Discogs data shape review):
```js
// Find where product cards are wired (search for ".product-card" or "product.html")
// Change from: window.location.href = 'product.html'
// Change to:   window.location.href = 'product.html?id=' + listing.id + '&yt=' + (release.youtube || '')
```

## Files changed

- `product.html` line 420: buy button href + `id="product-discogs-link"`
- `product.html` line 438: iframe `id` + `data-video-id` + default `about:blank` src
- `product.html` inline script: dynamic Discogs link + YouTube iframe, plus the same Swup re-init race fix as `3d-brain.html` (Fix 01).
