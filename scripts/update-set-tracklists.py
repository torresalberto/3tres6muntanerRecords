#!/usr/bin/env python3
"""Update set JSON files with confirmed tracklists from the registry."""
import json
from pathlib import Path

BASE = Path("/home/alb/projects/muntaner336/website-build")
SETS_DIR = BASE / "data/djs/sets"
REGISTRY = BASE / "data/djs/tracks/track-registry.json"

with open(REGISTRY) as f:
    registry = json.load(f)

# Group tracks by set
from collections import defaultdict
set_tracks = defaultdict(list)

for track in registry["tracks"]:
    for i, set_id in enumerate(track["sets"]):
        dj_id = track["played_by"][i] if i < len(track["played_by"]) else track["played_by"][0]
        ts_info = track.get("timestamp_appearances", [])
        timestamp = ""
        for ts in ts_info:
            if ts["set_id"] == set_id:
                timestamp = ts["timestamp"]
                break
        set_tracks[set_id].append({
            "artist": track["artist"],
            "title": track["title"],
            "timestamp": timestamp,
            "status": "confirmed"
        })

# Update each set file
for set_file in SETS_DIR.glob("*.json"):
    with open(set_file) as f:
        data = json.load(f)

    set_id = data["id"]
    if set_id in set_tracks:
        tracks = set_tracks[set_id]
        # Sort by timestamp if available
        tracks_sorted = sorted(tracks, key=lambda t: t["timestamp"] if t["timestamp"] else "999")
        for i, t in enumerate(tracks_sorted):
            t["position"] = i + 1

        data["tracklist"] = tracks_sorted
        data["curious_facts"]["confirmed_tracks"] = len(tracks_sorted)

        with open(set_file, 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        dj_id = data.get("dj_id", "?")
        print(f"✅ {set_id} ({dj_id}): {len(tracks_sorted)} confirmed tracks")

print("\nDone! All set files updated.")
