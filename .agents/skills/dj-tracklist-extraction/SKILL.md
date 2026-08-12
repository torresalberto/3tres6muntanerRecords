---
name: dj-tracklist-extraction
description: Extract the complete track ID list of a DJ set for the 3TRES6 DJ Library. Use when asked to "extract track IDs", "get the tracklist", "find the tracks in a DJ set", "add a set to the DJ library", or given a YouTube DJ set URL. Covers timestamped lists, numbered lists, pinned/owner comments, descriptions, and external cross-checks (1001tracklists, Discogs, agent-reach).
license: MIT
metadata:
  author: 3tres6
  version: "1.0"
---

# DJ Tracklist Extraction

Canonical process for turning a DJ set URL into a verified `data/djs/sets/<id>.json`
entry for the 3TRES6 site (DJ Library + 3D Brain). **Full protocol:**
`scripts/TRACK_ID_EXTRACTION_PROTOCOL.md` — read it. Runner: `scripts/extract-tracklists-v2.py`.

## When to use

- A user gives a YouTube/SoundCloud DJ set URL and asks for its tracks.
- A set in `data/djs/sets/` has `tracks_identified < tracks_total` or a pending
  `tracklist_status` — re-run the extractor to fill gaps.
- A fresh set needs capturing before the tracklist disappears or comments grow.

## Quick steps

```bash
# 1. Classify: DJ set? (duration, channel)
yt-dlp --skip-download --no-playlist --print "%(title)s | %(channel)s | %(duration_string)s" "<url>"

# 2. Fetch + extract (comments + description, all formats)
python3 scripts/extract-tracklists-v2.py "<url>" "<prefix>"
```

## The 5 layers (must all be scanned)

1. **Timestamped lines** `0:00 Artist - Title [Label]`
2. **Numbered lists** `1. Artist - Title - Label` ← DJ's own pinned comment, no timestamps (e.g. Etapp Kyle 16/16)
3. **ID requests** `track id at 1:05:35 ?` → keep as `most_requested_ids`, don't drop
4. **Timestamp mentions** — low confidence, context only
5. **Video description + chapters** — CLR/RA/podcast channels ship full lists there

**Authoritative signals:** ⭐ owner/pinned comments (the DJ's own list) beat everything.

## Rules (learned the hard way)

- **Read the pinned comment fully** — it held the complete tracklist we missed.
- **Never filter by keywords alone** — "here it is:" has no "tracklist" word. Look for `Artist - Title` structure.
- **Split on `" - "`** (space-hyphen-space) so hyphenated artists (`M-Gee`, `R-One By Julien Creance`) survive.
- **Normalize handles** for owner detection: `@etappkyle` == `Etapp Kyle`.
- **Ambiguous slot (2 candidates):** prefer the corroborated one, keep the runner-up in `notes`, never guess.
- **Incomplete is fine:** set `tracks_identified/tracks_total` honestly + `recheck_after` (~2 weeks, comments grow).

## Cross-check (when gaps remain)

1001tracklists.com → MixesDB → Discogs → agent-reach (X/Reddit search) → auto-caption transcript.

## Ship

```bash
python3 scripts/extract-tracklists-v2.py "<url>" "<prefix>" --dj <dj-id> --venue <venue> --date <date> --apply
npx prettier --check data/djs/sets/<prefix>.json
node scripts/build-dj-data.js   # run by --apply; re-run if you hand-edit the JSON
```

Then commit + push (deploy workflow rebuilds and deploys to GitHub Pages + shared hosting).
