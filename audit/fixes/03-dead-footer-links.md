# Fix 03 — 3 dead footer links in index.html

**Severity:** 🟡 HIGH
**File:** `index.html` (lines 793–799)
**Status:** ✅ FIXED

## The bug

The footer "Info" column had 3 dead links:
- `/condiciones` (Condición de Vinilos) → 404
- `/envios` (Envíos) → 404
- `/contacto` (Contacto) → 404

All three target pages were never created, but the links were hardcoded into the home page. Anyone clicking them got a 404. Flagged in `NAVIGATION_AUDIT.md` (May 27) but never fixed.

## The fix

```html
<!-- BEFORE -->
<a href="/3tres6muntanerRecords/condiciones">Condición de Vinilos</a>
<a href="/3tres6muntanerRecords/envios">Envíos</a>
<a href="/3tres6muntanerRecords/contacto">Contacto</a>

<!-- AFTER -->
<a href="https://wa.me/5255879475564?text=Hola%2C%20tengo%20una%20duda%20sobre%20un%20vinilo" target="_blank" rel="noopener">Contacto</a>
<a href="#nosotros">Condición de Vinilos</a>
<a href="#nosotros">Envíos</a>
```

- **Contacto** → WhatsApp deep link with a prefilled message (best UX, instant contact)
- **Condición de Vinilos** and **Envíos** → `#nosotros` (the in-page about section; expand it later with real content)

If you later create dedicated `condiciones.html`, `envios.html`, and `contacto.html` pages, just update the hrefs.

## Verification

```bash
curl -sI https://3tres6records.albto.me/condiciones  # → 404 (still)
curl -sI https://3tres6records.albto.me/envios       # → 404 (still)
curl -sI https://3tres6records.albto.me/contacto     # → 404 (still)
# But these URLs are no longer linked from any page
```

## Files changed

- `index.html` lines 793–799.
