# DJ Library — Documentation

## Overview

DJ Library is a curated section of the 3TRES6 Records website that catalogs DJ sets with complete tracklists, most requested IDs, and curious data extracted from YouTube comments.

## Architecture

```
data/djs/
├── index.json              # DJ registry (name, bio, genres, sets)
├── stats.json              # Build-generated: aggregates, featured, catalog
│                           # numbers, dj_rows, flat set list, editorial lists
├── sets/
│   └── [set-id].json       # Individual set data (tracklist, comments, stats)
└── tracks/
    └── track-registry.json # Global track index (enables DJ→track→DJ graph)
```

## Build step

`node scripts/build-dj-data.js` regenerates `tracklists.js`, `cross-references.json`,
`track-registry.json`, `index.json` **and** `stats.json` from `data/djs/sets/*.json`.
**Do not hand-edit generated files.** `stats.json` powers both DJ Library designs:
featured set (currently Etapp Kyle, Nº 001), `catalog_numbers`, `dj_rows` (for the
Discoteca sleeves), a flat `sets` list (for the Cabina console) and editorial lists
(top shared tracks, `label_clout`, `venues`, `genres`).

## Data Flow

1. **Find Set** → Search YouTube for popular DJ sets (>50 min)
2. **Extract Comments** → `yt-dlp --write-comments --skip-download`
3. **Parse Tracklist** → Python script filters for track IDs, timestamps
4. **Manual Review** → Confirm tracks, identify "most requested IDs"
5. **Update JSON** → Add to set file + update track registry
6. **Frontend** → `dj-library.html` renders from embedded JSON

## File Formats

### DJ Registry (`index.json`)

```json
{
  "djs": [
    {
      "id": "chaos-in-the-cbd",
      "name": "Chaos In The CBD",
      "origin": "New Zealand",
      "genres": ["Deep House", "Afro House"],
      "bio": "...",
      "sets": ["chaos-in-the-cbd-ballantines-lebanon"]
    }
  ]
}
```

### Set Data (`sets/[id].json`)

```json
{
  "id": "...",
  "dj_id": "...",
  "title": "...",
  "venue": "...",
  "date": "YYYY-MM-DD",
  "youtube_embed_id": "...",
  "duration_minutes": 60,
  "view_count": 161577,
  "tracklist": [
    {
      "position": 1,
      "timestamp": "0:00",
      "artist": "...",
      "title": "...",
      "status": "confirmed|unidentified"
    }
  ],
  "most_requested_ids": [
    {
      "timestamp": "28:30",
      "request_count": 5,
      "sample_comments": ["..."]
    }
  ],
  "curious_facts": {
    "total_comments": 191,
    "track_relevant_comments": 50,
    "unidentified_tracks": 27
  }
}
```

## Adding a New DJ Set

1. Find popular set on YouTube (>50 min, >10K views)
2. Extract comments:
   ```bash
   cd /home/alb/personal-projects/youtube-comment-tracker
   python3 extract_tracks.py <youtube_url>
   ```
3. Review `track_comments.txt`
4. Create set JSON file
5. Update DJ registry (`index.json`)
6. Update track registry: `node scripts/build-dj-data.js`
7. Deploy — both pages render the new set automatically (lazy-loaded on open)

## Future: Graph Visualization

The `track-registry.json` enables:

- "Which DJs played this track?" → `played_by` array
- "What tracks do 2 DJs share?" → intersect `played_by`
- "Most played tracks" → count appearances

Planned: D3.js force-directed graph showing DJ→track connections.

## Current Sets

**56 DJs · 77 sets · 932 tracks · 82.5h** (source of truth: `data/djs/sets/*.json`;
the full flat list is generated into `stats.json` → `sets`). Counts update on every
`node scripts/build-dj-data.js` run.

## Frontend Features

Shared engine (`js/dj-library-core.js`):

- Lazy data layer — pages paint from `stats.json`/`index.json`; a set's JSON is
  fetched only when its sheet/console is opened.
- Seekable timeline — clicking a track row loads the YouTube embed with
  `?start=SECONDS&autoplay=1` (`js/dj-library-core.js` → `seekSrc`/`tsToSec`).
- Status color system: ✓ confirmed (green dot), unidentified (dashed dot), 🔥
  crowd-requested IDs (yellow, with sample comments).
- Label pills on track rows (only sets with label data show them).
- **El Hilo** D3 force graph (DJs as nodes sized by `super_connectors`, links
  weighted by shared tracks/artists, genre filters, tooltips).
- Editorial rows: top shared tracks, labels with clout, venue networks.

### Variant A — Discoteca 3TRES6 (`dj-library.html` · `css/dj-library.css`)

Record-shelf editorial archive. Giant display header with animated counters,
featured-set hero (Etapp Kyle Nº 001) with rotating vinyl, crate toolbar
(search/genre chips/sort), DJ "sleeve" grid with completion rings, slide-over
set sheet with seekable timeline, editorial rows, El Hilo.
Logic: `js/dj-library.js`.

### Variant B — Cabina (`dj-library-console.html` · `css/dj-library-console.css`)

Player-first club console. Minimal header, left filter rail, ranked **set** list
(77), inline console detail (player + seekable timeline), and a pinned
"now playing" bar with a scrub strip of timestamp chips.
Logic: `js/dj-library-console.js`.

> **Winner: Discoteca 3TRES6** (canonical, `dj-library.html`). The runner-up
> "Cabina" variant is archived at `experiments/dj-library-console.html` (+
> `experiments/css/`, `experiments/js/`) for reference and is **not linked** from
> the live site. The Discoteca system is codified in `DESIGN_SYSTEM.md` and is
> the house style for the content sections (Herramientas, Mapa, Crew, Neural).

## Design System

- Colors: `#ff4d00` (accent), `#0a0a0a` (bg), `#111/#141414` (surface), `#00ff88`
  (confirmed), `#f5c518` (requested IDs)
- Font: Space Grotesk (UI) + Space Mono (catalog numbers, timestamps)
- Signature: per-DJ catalog numbers (`Nº 001`…), vinyl discs, completion rings
