# DJ Library — Documentation

## Overview

DJ Library is a curated section of the 3TRES6 Records website that catalogs DJ sets with complete tracklists, most requested IDs, and curious data extracted from YouTube comments.

## Architecture

```
data/djs/
├── index.json              # DJ registry (name, bio, genres, sets)
├── sets/
│   └── [set-id].json       # Individual set data (tracklist, comments, stats)
└── tracks/
    └── track-registry.json # Global track index (enables DJ→track→DJ graph)
```

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
  "djs": [{
    "id": "chaos-in-the-cbd",
    "name": "Chaos In The CBD",
    "origin": "New Zealand",
    "genres": ["Deep House", "Afro House"],
    "bio": "...",
    "sets": ["chaos-in-the-cbd-ballantines-lebanon"]
  }]
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
  "tracklist": [{
    "position": 1,
    "timestamp": "0:00",
    "artist": "...",
    "title": "...",
    "status": "confirmed|unidentified"
  }],
  "most_requested_ids": [{
    "timestamp": "28:30",
    "request_count": 5,
    "sample_comments": ["..."]
  }],
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
6. Update track registry (`tracks/track-registry.json`)
7. Add set to `dj-library.html` data

## Future: Graph Visualization

The `track-registry.json` enables:
- "Which DJs played this track?" → `played_by` array
- "What tracks do 2 DJs share?" → intersect `played_by`
- "Most played tracks" → count appearances

Planned: D3.js force-directed graph showing DJ→track connections.

## Current Sets

| DJ | Set | Views | Duration |
|---|---|---|---|
| Chaos In The CBD | Boiler Room x Ballantine's Lebanon | 161,577 | 1:00:52 |

## Frontend Features

- **Vinyl texture background** with spinning animation
- **Noise overlay** for analog feel
- **Embedded YouTube player**
- **Interactive tracklist** with status badges
- **Most Requested IDs** cards with 🔥 fire ratings
- **Stats dashboard** with curious facts
- **Responsive design** for mobile

## Design System

- Colors: `#ff4d00` (accent), `#111` (bg), `#1a1a1a` (card)
- Font: Space Grotesk
- Textures: Vinyl grooves, noise overlay, gradient accents
