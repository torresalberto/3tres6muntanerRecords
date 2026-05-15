#!/usr/bin/env python3
"""Rebuild track-registry.json from all set files."""
import json
from pathlib import Path
from collections import defaultdict

BASE = Path(__file__).parent.parent
SETS_DIR = BASE / "data/djs/sets"
REGISTRY_PATH = BASE / "data/djs/tracks/track-registry.json"

def make_track_id(artist, title):
    s = f"{artist}-{title}".lower()
    s = ''.join(c for c in s if c.isalnum() or c in '-_ ')
    s = s.replace(' ', '-')[:60]
    return s

tracks = {}
for spath in sorted(SETS_DIR.glob("*.json")):
    with open(spath) as f:
        data = json.load(f)
    set_id = data.get("id")
    dj_id = data.get("dj_id")
    for t in data.get("tracklist", []):
        if t.get("status") != "confirmed":
            continue
        tid = make_track_id(t["artist"], t["title"])
        if tid not in tracks:
            tracks[tid] = {
                "id": tid,
                "title": t["title"],
                "artist": t["artist"],
                "played_by": [],
                "sets": [],
                "status": "confirmed",
                "timestamp_appearances": []
            }
        tracks[tid]["played_by"].append(dj_id)
        tracks[tid]["sets"].append(set_id)
        tracks[tid]["timestamp_appearances"].append({
            "set_id": set_id,
            "timestamp": t.get("timestamp", "")
        })

for tid, track in tracks.items():
    seen_pb = []
    for d in track["played_by"]:
        if d not in seen_pb:
            seen_pb.append(d)
    track["played_by"] = seen_pb
    seen_sets = []
    for s in track["sets"]:
        if s not in seen_sets:
            seen_sets.append(s)
    track["sets"] = seen_sets

registry = {
    "tracks": list(tracks.values()),
    "stats": {
        "total_tracks": len(tracks),
        "cross_referenced": len([t for t in tracks.values() if len(t["played_by"]) > 1]),
        "dj_count": len(set(dj for t in tracks.values() for dj in t["played_by"]))
    }
}

with open(REGISTRY_PATH, 'w') as f:
    json.dump(registry, f, indent=2, ensure_ascii=False)

print(f"✅ Registry rebuilt!")
print(f"   Total tracks: {len(tracks)}")
print(f"   Cross-referenced: {registry['stats']['cross_referenced']}")
print(f"   DJs: {registry['stats']['dj_count']}")

from collections import Counter
dj_counts = Counter(dj for t in tracks.values() for dj in t["played_by"])
for dj, count in dj_counts.most_common():
    print(f"   {dj}: {count} tracks")
