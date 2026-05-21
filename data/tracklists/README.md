# Adding a New DJ Tracklist

## Overview

This guide covers how to add tracklist data for a new DJ so it appears in both the **DJ Sets tab** (expandable tracklists) and the **3D Brain** (connection edges when tracks overlap across DJs).

## Data Flow

```
YouTube / 1001tracklists / MixesDB
        ↓
data/tracklists/<dj-id>.json  (raw source data)
        ↓
data/tracklists/tracklists.js (JS module loaded by browser)
        ↓
toolhub/index.html  → DJ Sets tab (expandable cards)
3d-brain.html       → Neural Graph (auto-generated edges)
```

## Step 1: Gather Tracklist Data

Sources (in priority order):
1. **YouTube video description** — often has full tracklist
2. **1001tracklists.com** — crowd-sourced, well-formatted
3. **MixesDB.com** — community database
4. **YouTube comments** — use `extract_tracklists.py` as fallback

## Step 2: Create the JSON File

Create `data/tracklists/<dj-id>.json` following this schema:

```json
{
  "<dj-id>": {
    "artist": "DJ Name",
    "artist_id": "<dj-id>",
    "sets": [
      {
        "id": "<dj-id>-<venue-or-event>-<year>",
        "title": "Descriptive set title",
        "venue": "Venue, City, Country",
        "date": "YYYY-MM-DD",
        "duration": "HH:MM:SS",
        "youtube": "YouTube video ID (11 chars)",
        "views": 0,
        "genre": ["House", "Techno"],
        "tracks_identified": 10,
        "tracks_total": 12,
        "source": "Where the tracklist came from",
        "tracklist": [
          { "time": "00:00", "artist": "Artist Name", "title": "Track Title", "label": "Label Name" },
          { "time": "05:30", "artist": "Artist Name", "title": "Track Title" }
        ]
      }
    ]
  }
}
```

### Field Rules
- `id` — must match `dj_id` in `toolhub/js/dj-sets-db.js` DJ_SETS entries
- `youtube` — the 11-char video ID only (not full URL). **This is the key used to match sets.**
- `time` — `MM:SS` or `H:MM:SS`. Use `""` if unknown.
- `label` — optional. Omit the key entirely if unknown (don't use `null`).
- `note` — optional, for "ID", "Unreleased", etc.

## Step 3: Merge into `tracklists.js`

The `tracklists.js` file contains a single `TRACKLISTS` object. Add your new DJ entry alongside existing ones:

```javascript
const TRACKLISTS = {
  "folamour": { ... },
  "new-dj": { ... your new entry ... }
};
```

Then append the API functions at the bottom (they iterate over all keys automatically).

## Step 4: Add Set Entries to `dj-sets-db.js`

Each set needs a corresponding entry in `DJ_SETS` array in `toolhub/js/dj-sets-db.js`:

```javascript
{
  "id": "<same-as-tracklist-set-id>",
  "dj_id": "<dj-id>",
  "dj_name": "DJ Name",
  "title": "Same title as in tracklists.js",
  "venue": "Same venue",
  "date": "YYYY-MM-DD",
  "tracks": 10,
  "confirmed": 8,
  "youtube": "SAME YouTube ID as tracklists.js",
  "duration": "HH:MM:SS",
  "views": 0
}
```

**Critical:** The `youtube` field must match exactly between `DJ_SETS` and `TRACKLISTS` — this is how the DJ Sets tab finds the tracklist to display.

## Step 5: Update DJ Registry (if new DJ)

If this is a new DJ, add them to `DJ_REGISTRY` in `dj-sets-db.js`:

```javascript
{
  "id": "<dj-id>",
  "name": "DJ Name",
  "genres": ["House", "Techno"],
  "origin": "City, Country",
  "set_count": 1,
  "image": "https://i.ytimg.com/vi/<youtube-id>/hqdefault.jpg"
}
```

Also add to `DJ_DATA` in `3d-brain.html` with a genre (used for node coloring).

## Step 6: Verify

1. Open `toolhub/index.html` → click DJ Sets tab → click a set card → tracklist should expand
2. Open `3d-brain.html` → if any tracks overlap with other DJs, new edges appear
3. Search in 3D Brain for a track name → connected DJs should highlight

## Automated Extraction (Optional)

For YouTube comment-based extraction:

```bash
cd data/tracklists
python3 extract_tracklists.py <youtube-video-id> --output raw-comments.json
```

Then manually review and merge the output into the JSON structure above. The regex parser catches `MM:SS - Artist - Title` patterns but always verify manually.

## Checklist

- [ ] JSON file created with correct schema
- [ ] Merged into `tracklists.js`
- [ ] Set entries added to `DJ_SETS` in `dj-sets-db.js`
- [ ] YouTube IDs match between both files
- [ ] DJ added to `DJ_REGISTRY` and `DJ_DATA` (if new)
- [ ] Tested in toolhub/index.html (expandable tracklist)
- [ ] Tested in 3d-brain.html (connections render)
- [ ] Deployed to live
