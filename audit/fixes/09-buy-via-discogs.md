# Fix 09 — Buy-via-Discogs (no more broken checkout)

**Severity:** 🔴 CRITICAL (was: every cart-abandoner was a lost sale)
**Files:** `script.js`, `index.html`
**Status:** ✅ FIXED

## The change

Users now buy records directly from Discogs. No more broken Mercado Pago / Stripe / PayPal alerts.

### What was removed
- The 3-step checkout modal (visible in `index.html` as `#checkoutModal`) — hidden with `display: none`
- The "Proceder al Pago" button in the cart sidebar — hidden with `style="display: none"`
- The 4 `payWith*()` stub functions in `script.js` — kept for reference, marked DEAD CODE
- 3 GA4 commerce events (`add_to_cart`, `begin_checkout`, `payment_method_selected`) — removed, replaced with one new event: `select_item` (fires when the user clicks "Comprar en Discogs")

### What was added
- Product card "Agregar" buttons → `<a target="_blank" href="${listing.uri}">Comprar en Discogs</a>`
- Quick-view "Agregar al Carrito" button → `<a target="_blank" href="${listing.discogs}">Comprar en Discogs</a>` (URL is set per-product in `QuickView.open()`)
- GA4 `select_item` event fires on every buy click — preserves the funnel signal

### What stays
- The cart sidebar (visible but functionally dead — no checkout button to click)
- `Cart.addItem()` still works if triggered (used by the dead `add-to-cart-btn` paths)
- The `state.cart` localStorage data
- All other features (audio player, swup navigation, calendar, etc.)

## Verified

Local browser test (against `http://localhost:8765/`):

```js
// 22 buy buttons, all link to actual Discogs listings
{
  buyButtonCount: 22,
  buyButtonHrefs: [
    { href: "https://www.discogs.com/sell/item/3981308527", target: "_blank", text: "Comprar en Discogs" },
    { href: "https://www.discogs.com/sell/item/4001975446", target: "_blank", text: "Comprar en Discogs" },
    { href: "https://www.discogs.com/sell/item/4001982175", target: "_blank", text: "Comprar en Discogs" }
  ],
  checkoutBtnComputed: "none",  // hidden
  checkoutModalComputed: "none" // hidden
}

// Quick view buy link
{
  buyLinkHref: "https://www.discogs.com/sell/item/3981308527",
  buyLinkTag: "A",
  buyLinkText: "Comprar en Discogs"
}

// Click event captured
"GA4 Track: select_item [object Object]"
```

## Notes

- The taste file (`~/.commandcode/taste/taste.md`) was clear: *"do not build custom checkout/payment integration. Route purchases to the user's Discogs seller page instead."* This fix implements that.
- The 4 `payWith*()` stubs in `script.js` are kept (commented `DEAD CODE`) so a future maintainer can see what was here and why it was removed. If/when real payment integration becomes a priority, these stubs are the starting point.
- The cart sidebar is still visible (per the user's request to "keep the cart but disable it"). Users see what's in their cart but cannot check out.

## Files changed

- `index.html` — 3 small changes (hide modal, hide button, convert quick-view button to `<a>`)
- `script.js` — 4 changes (product card render, fallback product render, `attachProductListeners` click handler, `QuickView` `init` + `open`)

## Effort: ~20 minutes
