# Muntaner336 — Website

Vinyl resale business website. Pure HTML/CSS/JS. Barcelona-sourced records → Mexican collectors.

**Parent project context:** See `../CLAUDE.md` for business rules, pricing, and strategy.

## Active Skills
- `frontend-design` — UI improvements and layout
- `ui-ux-pro-max` — UX and design decisions
- `gsap-skills` — scroll animations and transitions

## Mapa — "Nuestro Territorio" (interactive club map)

A curated interactive map of clubs that program the music that defines 3TRES6 (house / techno /
disco). It is the curation pillar of the site: every venue is added on the judgment of the crew,
not scraped automatically.

- **Page:** `mapa.html` (also served at `/mapa/` and `/mapa` via `.htaccess` rewrite).
- **Library:** Leaflet 1.9.4 + **OpenFreeMap "dark"** vector basemap rendered via
  MapLibre GL JS (`maplibre-gl@5.24.0`) + `@maplibre/maplibre-gl-leaflet`
  (`L.maplibreGL`). **Keyless — no account, no API key** (house rule: no Google).
  Falls back to CartoDB Dark Matter if the GL layer fails to init.
- **Renderer:** `js/map-loader.js` (`VenueMap`) — reads JSON, draws markers, popups,
  city-filter tabs, sidebar rail and fly-to navigation. Deep links:
  `mapa.html#venue:<id>` (fly-to + open + highlight rail card).
  No build step: edits to the JSON go live on next deploy.
- **Data source (source of truth):** `data/venues/index.json` — `venues[]` + `cities[]`.

### Adding a venue
Edit `data/venues/index.json` following the existing schema:

```json
{
  "id": "kebab-case-id",
  "name": "Venue Name",
  "city": "Barcelona",
  "country": "Spain",
  "coordinates": { "lat": 41.37805, "lng": 2.17368 },
  "address": "Carrer de Guàrdia 3, 08002 Barcelona",
  "curated_by": "3tres6 crew",
  "notes": "One-line note on why it's on the map.",
  "links": { "ra": "...", "instagram": "...", "website": "..." },
  "capacity": 220,
  "soundsystem": "Funktion-One"
}
```

- `city` must match an entry in `cities[]` (that drives the filter tab + center/zoom).
- Verify addresses/coordinates (OpenStreetMap Nominatim is the usual source) — approximate pins
  are worse than no pin. Update `cities[].center/zoom` when a city's spread grows.
- Keep notes in Spanish, brief, and describe the sound, not the business.

### Cross-links with the Discoteca (DJ Library)
- **Mapa popup → Discoteca:** popups render "DJs que tocaron aquí" + "Sets en este club →"
  by matching the curated venue name against `venue_networks` in
  `data/djs/cross-references.json` (distinctive-token matching; generic words like
  "studio"/"club"/"sala" are ignored). Links use `dj-library.html#dj:<id>` / `#set:<id>`
  with `data-no-swup`. No match = rows omitted (never a dead link).
- **Discoteca set-sheet venue chip → Mapa:** `Core.buildMetaChips` turns the venue chip
  into `mapa.html#venue:<id>` when the set venue matches `CURATED_MAP_VENUES`
  (`js/dj-library-core.js`). **Keep that map in sync with `data/venues/index.json`** when
  adding a curated venue (key = normalized set venue string).

### Gotchas
- The Leaflet CSS/JS `<link>`/`<script>` on `mapa.html` have strict SRI `integrity`
  hashes — same for the MapLibre GL + `@maplibre/maplibre-gl-leaflet` includes. If you
  bump any version, recompute all hashes (a wrong hash silently blocks the asset).
- **No swup on mapa.html** on purpose: it is a full-load section. Links *into* it from
  swup-enabled pages (index, blog, product, toolhub) carry `data-no-swup` so its scripts
  always run.
- Venue links (Instagram / RA / website) are rendered conditionally — a venue with no links is fine.
- Crew curation: new venue suggestions land via the "Sugerir un club →" CTA (Instagram DM) and are
  reviewed by the crew before being added here.

## DJ Track IDs (extracting sets for the DJ Library)

To extract the tracklist of a DJ set into `data/djs/sets/*.json`, follow the
`dj-tracklist-extraction` skill (`.agents/skills/dj-tracklist-extraction/SKILL.md`),
the full protocol in `scripts/TRACK_ID_EXTRACTION_PROTOCOL.md`, and the runner
  `scripts/extract-tracklists-v2.py`. Covers all comment formats (timestamped,
  numbered, ID requests), descriptions, owner/pinned boosts, external cross-checks,
  and honest incomplete-set handling (`recheck_after`).

## DJ Library / Discoteca (canonical) + house design system

- **Winner of the A/B:** "Discoteca 3TRES6" (`dj-library.html` + `css/dj-library.css`
  + `js/dj-library-core.js` + `js/dj-library.js`). The runner-up "Cabina" is
  archived (not linked) at `experiments/`.
- **`DESIGN_SYSTEM.md`** is the house style for all content sections (tokens,
  signature components, internal-linking conventions). Read it before touching
  any section.
- Data is build-generated: `node scripts/build-dj-data.js` (index, stats,
  cross-references, tracklists, track-registry). Never hand-edit generated files.
- Section redesign roadmap (one per pass): ✅ Taller (toolhub — editorial hero,
  MOD rail, Sets tool that deep-links to the Discoteca; see `DESIGN_SYSTEM.md`
  "Known gaps") · ✅ Mapa (hero removed — map-first layout, Discoteca-style
  rail, keyless dark basemap, `#venue:` deep links + popup↔Discoteca
  cross-links) · 🚧 Crew · 🚧 Neural. Each deploys + is smoke-tested before the next.

<!-- autoskills:start -->

Summary generated by `autoskills`. Check the full files inside `.claude/skills`.

## Accessibility (a11y)

Audit and improve web accessibility following WCAG 2.2 guidelines. Use when asked to "improve accessibility", "a11y audit", "WCAG compliance", "screen reader support", "keyboard navigation", or "make accessible".

- `.claude/skills/accessibility/SKILL.md`
- `.claude/skills/accessibility/references/A11Y-PATTERNS.md`: Practical, copy-paste-ready patterns for common accessibility requirements. Each pattern is self-contained and linked from the main [SKILL.md](../SKILL.md).
- `.claude/skills/accessibility/references/WCAG.md`

## Design Thinking

Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beaut...

- `.claude/skills/frontend-design/SKILL.md`

## Node.js Backend Patterns

Build production-ready Node.js backend services with Express/Fastify, implementing middleware patterns, error handling, authentication, database integration, and API design best practices. Use when creating Node.js servers, REST APIs, GraphQL backends, or microservices architectures.

- `.claude/skills/nodejs-backend-patterns/SKILL.md`
- `.claude/skills/nodejs-backend-patterns/references/advanced-patterns.md`: Advanced patterns for dependency injection, database integration, authentication, caching, and API response formatting.

## Node.js Best Practices

Node.js development principles and decision-making. Framework selection, async patterns, security, and architecture. Teaches thinking, not copying.

- `.claude/skills/nodejs-best-practices/SKILL.md`

## SEO optimization

Optimize for search engine visibility and ranking. Use when asked to "improve SEO", "optimize for search", "fix meta tags", "add structured data", "sitemap optimization", or "search engine optimization".

- `.claude/skills/seo/SKILL.md`

<!-- autoskills:end -->
