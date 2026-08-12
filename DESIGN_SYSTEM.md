# 3TRES6 Design System

House style for the content sections of the 3TRES6 Records site. Born from the
**Discoteca 3TRES6** (DJ Library) redesign and applied to every content section:
Herramientas (Taller), Mapa, Crew, Neural.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--primary` | `#ff4d00` | accent, active states, catalog numbers |
| `--bg` | `#0a0a0a` | page background |
| `--surface` | `#111` / `#141414` | cards, panels, rails |
| `--success` | `#00ff88` | ✓ confirmed / verified / "probado" |
| `--yellow` | `#f5c518` | 🔥 crowd-requested / picks / alerts |
| `--text-dim` | `rgba(255,255,255,.55)` | secondary text |
| `--text-faint` | `rgba(255,255,255,.32)` | tertiary text |
| `--line` | `rgba(255,255,255,.08)` | hairlines, borders |
| Font UI | Space Grotesk | body, titles |
| Font mono | Space Mono | catalog numbers, timestamps, labels, specs |
| Radius | 8–14px cards, 999px chips | |

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

Ticker (top-banner) → header (logo, nav groups, cart) → `dj-hub-subnav`
(Blog · Discoteca · Neural · Crew · Mapa · Herramientas) → `main[data-swup]` →
footer. All sections use the same chrome; active tab marked `.active`.

## Internal-linking conventions

| Entity | Canonical home | Linked from |
|---|---|---|
| DJ | Discoteca sleeve (`dj-library.html#dj:<id>`) + static `dj/<id>.html` | Neural node, Crew card, Mapa popup |
| Set | Discoteca set sheet (`#set:<id>` via sheet) | Mapa venue popup, Taller DJ-sets search, Neural info panel |
| Venue | Mapa pin (`mapa.html#venue:<id>`) | Discoteca set-sheet venue chip, Crew residency |
| Genre / Label / Track | Discoteca editorial + El Hilo filters | Neural bridges, Taller filters |
| Crew member | `crew.html` card | Discoteca sleeve (members = DJs), Neural node, Mapa residency |
| Tool | `toolhub/#hardware\|wheel\|music\|software` | subnav everywhere |

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
- ✅ Taller (toolhub) — redone in this system
- 🚧 Mapa — next
- 🚧 Crew — next
- 🚧 Neural — next
