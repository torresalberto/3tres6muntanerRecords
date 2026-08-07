# Sitemap & Information Architecture — 3TRES6 Records

**Domain:** `https://3tres6records.albto.me`
**Deployment:** Static HTML/CSS/JS, no build step. Edits go live on `git push` to A2hosting.
**Deliverables:** `sitemap.xml` (SEO), `sitemap.html` (human), this IA doc. Wired via `robots.txt` + `.htaccess` `/sitemap` rewrite.

---

## 1. Information Architecture (tree)

```
3TRES6 Records (root /)
├── Inicio / Tienda
│   ├── /                      Home (vinyl catalog, player, calendar)
│   └── /product.html          Single-product / vinyl detail view
├── DJ Library
│   ├── /dj-library.html       All DJs + tracklists (primary)
│   ├── /3d-brain.html         Neural graph — DJ connections (D3)
│   └── /dj/<dj-id>.html       56 individual DJ profile pages
├── Descubrir
│   ├── /mapa                  Curated club map (Leaflet)
│   ├── /crew                  The crew
│   └── /crew/d-mfrutis/       Crew member profile (example)
├── Recursos
│   ├── /toolhub/              DJ tools hub (Camelot wheel, USB, etc.)
│   └── /blog.html             Blog / editorial
└── Sitemap
    ├── /sitemap.html          Human-readable sitemap
    └── /sitemap.xml           Machine-readable sitemap (SEO)
```

---

## 2. URL patterns & canonical strategy

| Pattern | Resolves to | Canonical form used in sitemap |
|---------|-------------|-------------------------------|
| `/` | `index.html` | `/` |
| `/dj-library.html` | `dj-library.html` | `/dj-library.html` |
| `/3d-brain.html` | `3d-brain.html` | `/3d-brain.html` |
| `/blog.html` | `blog.html` | `/blog.html` |
| `/product.html` | `product.html` | `/product.html` |
| `/toolhub/` | `toolhub/index.html` | `/toolhub/` |
| `/mapa` | 301 → `mapa.html` | `/mapa` (clean) |
| `/crew` | 301 → `crew.html` | `/crew` (clean) |
| `/sitemap` | 301 → `sitemap.html` | `/sitemap` (clean) |
| `/dj/<id>.html` | `dj/<id>.html` | `/dj/<id>.html` |
| `/crew/d-mfrutis/` | `crew/d-mfrutis/index.html` | `/crew/d-mfrutis/` |

Clean-URL rewrites live in `.htaccess` (`/crew`, `/mapa`, and the new `/sitemap`).
`dj-library.html`, `blog.html`, `3d-brain.html`, `product.html` have no clean rewrite and
are listed by their real filename.

---

## 3. Priority & change-frequency rationale (sitemap.xml)

- **1.0 — `/`**: primary conversion page (catalog + checkout entry).
- **0.9 — `/dj-library.html`**: flagship content pillar, updated weekly.
- **0.8 — `/blog.html`**: editorial, freshness-driven.
- **0.7 — `/toolhub/`, `/3d-brain.html`, `/mapa`, `/crew`**: evergreen hub pages.
- **0.6 — 56 × `/dj/<id>.html`**: individual profiles, equal weight.
- **0.5 — `/product.html`**: template/detail view.
- **0.4 — `/crew/d-mfrutis/`**: single sub-profile, low update rate.

---

## 4. Pagination decision (dj-library/page-2..5.html)

`dj-library/page-2.html … page-5.html` are paginated copies of `/dj-library.html`, each
currently self-canonicalized. **Decision: excluded from both `sitemap.xml` and
`sitemap.html`** to avoid thin/duplicate content competing with the primary page.

**Recommended follow-up (not blocking):** add to each paginated file:
```html
<link rel="canonical" href="https://3tres6records.albto.me/dj-library.html" />
```
and/or `<meta name="robots" content="noindex, follow" />`. This consolidates ranking on the
main DJ Library page.

---

## 5. Footer link

A "Sitemap" link is injected into every page footer:
- Via `player-init.js` for pages using `.footer-nav` (covers all 56 DJ pages + library/3d-brain/blog/crew/mapa/product/toolhub).
- Added directly to `index.html` (`.footer-container` structure, does not load `player-init.js`).

---

## 6. Files

**Created:** `sitemap.xml`, `sitemap.html`, `SITEMAP_IA.md`, `robots.txt`
**Modified:** `.htaccess` (added `/sitemap` rewrite), `player-init.js` (footer link injection), `index.html` (footer link)

---

## 7. Verification

1. `python3 -m http.server` in `website-build`:
   - `GET /sitemap` → 301 → `/sitemap.html` (renders, all links resolve).
   - `GET /robots.txt` shows `Sitemap:` line; `GET /sitemap.xml` is well-formed XML.
   - Spot-check 3 DJ pages for the injected footer "Sitemap" link.
2. Validate `sitemap.xml` well-formed and every `<loc>` returns 200 against actual files.
3. `git push` → re-verify live `https://3tres6records.albto.me/sitemap.xml`.
