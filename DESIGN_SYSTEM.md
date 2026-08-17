# 3TRES6 Design System

House style for the content sections of the 3TRES6 Records site. Born from the
**Discoteca 3TRES6** (DJ Library) redesign and applied to every content section:
Herramientas (Taller), Mapa, Crew, Neural.

## Tokens

| Token          | Value                     | Use                                        |
| -------------- | ------------------------- | ------------------------------------------ |
| `--primary`    | `#ff4d00`                 | accent, active states, catalog numbers     |
| `--bg`         | `#0a0a0a`                 | page background                            |
| `--surface`    | `#111` / `#141414`        | cards, panels, rails                       |
| `--success`    | `#00ff88`                 | ✓ confirmed / verified / "probado"         |
| `--yellow`     | `#f5c518`                 | 🔥 crowd-requested / picks / alerts        |
| `--text-dim`   | `rgba(255,255,255,.55)`   | secondary text                             |
| `--text-faint` | `rgba(255,255,255,.32)`   | tertiary text                              |
| `--line`       | `rgba(255,255,255,.08)`   | hairlines, borders                         |
| Font UI        | Space Grotesk             | body, titles                               |
| Font mono      | Space Mono                | catalog numbers, timestamps, labels, specs |
| Radius         | 8–14px cards, 999px chips |                                            |

## Signature components

- **Editorial hero** — mono kicker (`Archivo sonoro · Barcelona → México`),
  giant uppercase display title (`DISCOTECA 3TRES6`, `EL TALLER`), lede, live
  stat counters (`.stat-pill`).
- **Catalog numbers** `Nº 001` — mono badge, top-left of cards/sleeves. Each
  section uses its own prefix: `Nº` (Discoteca), `MOD` (Taller).
- **Vinyl disc** — CSS radial-gradient disc + spinning label; hero decoration
  and hover "disc peek" on cards.
- **Completion / status rings** — `conic-gradient` ring for rates; color =
  status.
- **Status system** — ✓ green (confirmed/verified), dim dashed (unknown),
  🔥 yellow (requested/pick), ⭐ orange (crew pick).
- **Chips** — mono pills; genre filters, tool tabs, tabs (`.genre-chip`,
  `.chip`, `.set-tab`, `.tool-tab`). Active = primary bg + dark text.
- **Set sheet / detail panel** — right slide-over (Discoteca) or inline detail
  (Cabina archived); player + seekable timeline rows with status dots and label
  pills.
- **Toolbar / rail** — search + chips + sort; mono labels on rail blocks.
- **El Hilo graph** — D3 force layout (`js/dj-library-core.js →
DJCore.initGraph`): nodes sized by connections, links weighted by shared
  tracks/artists, genre filters, tooltips.

## Page chrome

Ticker (top-banner) → header (logo, two nav groups, cart) → `header-spacer`
(content pages only) → `main[data-swup]` → footer.

One nav bar only (single-bar rule, see UX Playbook):

- **Tienda:** Catálogo · Calendario · Nosotros
- **Música:** Discoteca (`dj-library.html`) · Neural (`3d-brain.html`) · Mapa
  (`mapa.html`) · Crew (`crew.html`) · Herramientas (`toolhub/`) · Blog

Active tab marked `.active` (+ `aria-current="page"`). Mapa links carry
`data-no-swup`. The mobile drawer mirrors the same groups plus Redes.

## UX Playbook (persona × journey × surface)

Use before any section pass or nav change. **Orientación is the failure
point** — a visitor must know "store, archive or project?" in <1s, and there
must be exactly **one** menu.

**Visitor personas**

| Persona                           | Entry surface                    | Primary goal                  | Primary action               |
| --------------------------------- | -------------------------------- | ----------------------------- | ---------------------------- |
| 🧴 El Coleccionista               | Discogs, IG, Google              | buy vinyl (650 MXN, envío MX) | Ver catálogo → Discogs       |
| 🎧 El Cabeza (DJ/selector)        | set links, track IDs, SoundCloud | find a set / tracklist        | Ir a Discoteca               |
| 🕺 El Clubber (CDMX/BCN)          | IG, WhatsApp                     | qué club / quién toca         | Abrir Mapa                   |
| 🤝 El Colaborador (club, talento) | CTA "Sugerir un club"            | contribute / collab           | Formulario/IG CTA            |
| 🪝 El Link-Clicker (SEO)          | blog/tools                       | shallow; funnel onward        | redirect to a persona funnel |

**Journey stages:** Entrada → Orientación → Exploración → Acción → Retorno.
Every page should answer, in order: _¿qué es esto?_ (Entrada/Orientación),
_¿qué hay aquí?_ (Exploración), _¿qué hago?_ (Acción), _¿cómo vuelvo?_
(Retorno — footer/IG/Discogs always present).

**Nav rules**

1. Exactly one visible nav bar. Never stack two global navs (the old
   `dj-hub-subnav` duplicated Tienda + Música and is gone).
2. Organize by task/goal, not department; two groups max (Tienda / Música).
3. Labels must match the page's visible title (Discoteca is canonical for the
   DJ Library; `3d-brain.html` is THE Neural page — `3d-brain-v3.html` "Órbita"
   stays internal-only).
4. Every nav destination must be reachable from the mobile drawer too.
5. Deep links never change: `mapa.html#venue:<id>`, `dj-library.html#dj:<id>`,
   `dj-library.html#set:<id>`.
6. The fixed header occupies 40→121px (ticker band 0→40 + header 80). Content
   pages offset with `.header-spacer` (121px); full-viewport sections compute
   from the real flow start (see Mapa: `calc(100vh - 161px)`).

## Internal-linking conventions

| Entity                | Canonical home                                                       | Linked from                                                   |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| DJ                    | Discoteca sleeve (`dj-library.html#dj:<id>`) + static `dj/<id>.html` | Neural node, Crew card, Mapa popup                            |
| Set                   | Discoteca set sheet (`#set:<id>` via sheet)                          | Mapa venue popup, Taller DJ-sets search, Neural info panel    |
| Venue                 | Mapa pin (`mapa.html#venue:<id>`)                                    | Discoteca set-sheet venue chip, Crew residency                |
| Genre / Label / Track | Discoteca editorial + El Hilo filters                                | Neural bridges, Taller filters                                |
| Crew member           | `crew.html` card                                                     | Discoteca sleeve (members = DJs), Neural node, Mapa residency |
| Tool                  | `toolhub/#hardware\|wheel\|music\|software`                          | Música nav group                                              |

Rules:

- A DJ always deep-links to the Discoteca sleeve; a set opens its sheet.
- A venue popup shows "DJs que tocaron aquí" (from `venue_networks`) and
  "Sets en este club →".
- Crew members that exist in `data/djs/index.json` link to their sleeve.
- Never dead-end: every entity links forward to at least one other section.

## Data sources

- `data/djs/index.json`, `data/djs/stats.json`, `data/djs/sets/*.json`,
  `data/djs/cross-references.json` — DJ Library / shared graph.
- `data/venues/index.json` — Mapa.
- `data/crew/index.js` — Crew.
- `toolhub/js/*-db.js` — Taller catalogs.

## Status

- ✅ Discoteca (DJ Library) — canonical
- ✅ Taller (toolhub) — redone in this system (adds Sets tool that deep-links
  to the Discoteca via `dj-library.html#set:<id>`)
- ✅ Mapa — redone in this system (map-first, two per-city panels (Barcelona /
  México) with per-city rails, keyless OpenFreeMap dark basemap,
  `mapa.html#venue:<id>` deep links that route to the venue's own city map,
  popup "DJs que tocaron aquí / Sets en este club" + reciprocal set-sheet
  venue chip)
- 🚧 Crew — next
- 🚧 Neural — next

## Known gaps / learnings (from past passes)

- **swup page-init gap:** only `blog.html`, `index.html`, `product.html` and
  `toolhub/` load `swup-init.js`. Navigations _into_ `dj-library.html`,
  `crew.html`, `mapa.html`, `3d-brain.html` from a swup page swap the content
  without re-running those pages' scripts. Until those sections register
  `window.Muntaner336.onPageView` re-inits, links that MUST fully initialize a
  target section add `data-no-swup` (the Taller Sets tool does this for its
  deep links). Revisit in the Mapa/Crew/Neural passes.
- **Top-level `const` data files** (`HardwareDB`, `MusicDB`, `DJ_SETS`, …) are
  NOT on `window`. Check with `typeof X === 'undefined'`, never
  `window.X`. (Bite that cost two fixes in the Taller pass.)
