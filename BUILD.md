# DJ Data Build Pipeline

## What This Does

Every time you add new DJ sets to the library, run one command to regenerate all compiled outputs. The 3D Brain and DJ Library will automatically get richer with connections, shared tracks, and artist bridges.

## Source of Truth

**Only edit these files manually:**

- `data/djs/sets/*.json` — Individual set tracklists (add new ones here)
- `data/djs/index.json` — DJ metadata (names, genres, images; auto-synced by build)

**Never edit these manually** (they are auto-generated):

- `data/tracklists/tracklists.js`
- `data/djs/cross-references.json`
- `data/djs/tracks/track-registry.json`

## Workflow

### 1. Add a New DJ Set

Create a JSON file in `data/djs/sets/`:

```json
{
  "id": "artist-venue-year",
  "title": "Set Title",
  "venue": "Venue Name",
  "date": "2024-01-01",
  "duration": "1:30:00",
  "youtube_embed_id": "YOUTUBE_VIDEO_ID",
  "view_count": 1000000,
  "genre": ["House", "Techno"],
  "tracks_identified": 20,
  "tracks_total": 22,
  "tracklist": [
    { "time": "00:00", "artist": "Artist Name", "title": "Track Title", "label": "Label Name" }
  ],
  "curious_facts": {}
}
```

### 2. Run the Compiler

```bash
node scripts/build-dj-data.js
```

### 3. Commit & Deploy

```bash
git add data/
git commit -m "Add [DJ Name] set + rebuild data"
git push
```

## What Gets Generated

### `data/tracklists/tracklists.js`
- Compiled JS object for the 3D Brain to load inline
- Groups all set files by DJ
- Matches the format the Brain expects (`TRACKLISTS` global)

### `data/djs/cross-references.json`
- **Shared tracks** — exact same track played by 2+ DJs
- **Shared artists** — different tracks by the same artist played by 2+ DJs
- **Venue networks** — venues that host multiple DJs
- **Label affinity** — labels whose releases appear in multiple DJs' sets
- **Genre bridges** — genres that connect multiple DJs
- **Super connectors** — DJs with the most cross-connections

### `data/djs/tracks/track-registry.json`
- Normalized track database for the DJ Library graph
- Each track points to which DJs played it and in which sets

### `data/djs/index.json`
- Auto-updated DJ list with correct set IDs
- Auto-computed stats (set count, track count, completion rate)
- Backfilled `image` fields from `youtube_embed_id`

## Architecture

```
Your edits:
  data/djs/sets/*.json
         |
         v
  node scripts/build-dj-data.js
         |
         +---> data/tracklists/tracklists.js  (3D Brain inline data)
         +---> data/djs/cross-references.json (connection insights)
         +---> data/djs/tracks/track-registry.json (DJ Library graph)
         +---> data/djs/index.json (updated stats & images)
```

## How the 3D Brain Uses the Data

1. **Inline load:** `tracklists.js` is loaded synchronously as `<script src="...">`
2. **Dynamic scan:** `buildTracklistConnections()` scans all tracklists at runtime to find shared tracks
3. **Async enrichment:** After page load, the Brain fetches `cross-references.json` and adds **shared artist bridges** as purple connections between DJs

Result: The Brain shows both exact track matches (green) and artist-level connections (purple), giving a richer picture of DJ relationships.

## How the DJ Library Uses the Data

1. **Browsing:** `index.json` is fetched to render the DJ grid with cards
2. **Tracklists:** Individual set JSONs are fetched on demand when a user clicks a DJ
3. **Graph:** `dj-graph.js` loads `track-registry.json` to render the D3 force-directed graph showing DJ → Set → Track → Shared Track relationships
4. **Cross-references:** `cross-references.json` is fetched to highlight shared artists and tracks in the stats panel

## Troubleshooting

### "Brain enrichment failed" in console
- Check that `data/djs/cross-references.json` exists and is valid JSON
- Run `node scripts/build-dj-data.js` to regenerate it

### DJ Library graph is empty
- Check that `data/djs/tracks/track-registry.json` exists
- Check browser console for 404s on `index.json` or `track-registry.json`

### Missing DJ images
- Make sure set files have `youtube_embed_id` populated
- Re-run the build script to backfill `image` fields in `index.json`

### New DJs not showing up
- Ensure the set filename starts with a recognizable DJ ID prefix
- The build script uses heuristics to extract DJ IDs from filenames
- If extraction fails, the DJ gets an ID like `artist-venue-year` — edit `index.json` manually to fix the name/image
