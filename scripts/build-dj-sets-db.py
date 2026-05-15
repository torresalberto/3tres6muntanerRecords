#!/usr/bin/env python3
"""Generate dj-sets-db.js for toolhub from live data files."""
import json
from pathlib import Path

BASE = Path(__file__).parent.parent
INDEX_PATH = BASE / "data/djs/index.json"
REGISTRY_PATH = BASE / "data/djs/tracks/track-registry.json"
OUTPUT = BASE / "toolhub/js/dj-sets-db.js"

with open(INDEX_PATH) as f:
    index = json.load(f)
with open(REGISTRY_PATH) as f:
    registry = json.load(f)

sets_data = []
sets_dir = BASE / "data/djs/sets"
for spath in sorted(sets_dir.glob("*.json")):
    with open(spath) as f:
        s = json.load(f)
    dj_id = s.get("dj_id", "")
    dj_name = ""
    for dj in index["djs"]:
        if dj["id"] == dj_id:
            dj_name = dj["name"]
            break
    track_count = len(s.get("tracklist", []))
    confirmed = sum(1 for t in s.get("tracklist", []) if t.get("status") == "confirmed")
    sets_data.append({
        "id": s["id"],
        "dj_id": dj_id,
        "dj_name": dj_name,
        "title": s.get("title", ""),
        "venue": s.get("venue", ""),
        "date": s.get("date", ""),
        "tracks": track_count,
        "confirmed": confirmed,
        "youtube": s.get("youtube_embed_id", ""),
        "duration": s.get("duration_formatted", ""),
        "views": s.get("view_count", 0),
    })

djs_data = [{
    "id": dj["id"],
    "name": dj["name"],
    "genres": dj.get("genres", []),
    "origin": dj.get("origin", ""),
    "set_count": len(dj.get("sets", [])),
    "image": dj.get("image", ""),
} for dj in index["djs"]]

djs_data.append({"id": "carl-cox", "name": "Carl Cox", "genres": ["Techno"], "origin": "UK", "set_count": 1, "image": ""})

js = f"// Auto-generated from data/djs/\nconst DJ_SETS = {json.dumps(sets_data, indent=2, ensure_ascii=False)};\n\nconst DJ_REGISTRY = {json.dumps(djs_data, indent=2, ensure_ascii=False)};\n"

with open(OUTPUT, 'w') as f:
    f.write(js)

print(f"Done: {len(sets_data)} sets, {len(djs_data)} DJs")
