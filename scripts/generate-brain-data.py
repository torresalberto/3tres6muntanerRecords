#!/usr/bin/env python3
"""Generate fresh DJ_DATA and MULTI_DJ_TRACKS for 3d-brain.html from the live data files."""
import json
from pathlib import Path

BASE = Path(__file__).parent.parent
INDEX_PATH = BASE / "data/djs/index.json"
REGISTRY_PATH = BASE / "data/djs/tracks/track-registry.json"
OUTPUT = BASE / "tmp" / "brain-data.txt"

with open(INDEX_PATH) as f:
    index = json.load(f)
with open(REGISTRY_PATH) as f:
    registry = json.load(f)

# Build DJ map
dj_map = {dj["id"]: dj for dj in index["djs"]}

# Genre color map (same as in 3d-brain.html)
GENRE_COLORS = {
    "House": "#ff4d00", "Deep House": "#ff8c00", "Acid House": "#ff6a00",
    "Soulful House": "#ff9100", "Melodic House": "#ffab00", "Tech House": "#e040fb",
    "Techno": "#00bcd4", "Minimal Techno": "#00e5ff", "Detroit Techno": "#37474f",
    "Hypnotic Techno": "#00acc1", "Dub Techno": "#4dd0e1", "Minimal": "#7c4dff",
    "UK Bass": "#00c864", "Disco": "#ff6a2a", "Balearic": "#ff8c42",
    "French Touch": "#ff5252", "Experimental": "#607d8b", "Jazz": "#78909c",
    "Ambient": "#90a4ae", "Funk": "#ffca28", "Breaks": "#ab47bc",
    "Garage": "#26a69a", "Trance": "#42a5f5", "Electro": "#66bb6a",
    "Classic House": "#ff7043", "Chicago House": "#ff8a65", "Latin House": "#ffab91",
    "Fashion": "#f06292", "New Age": "#81d4fa", "Live PA": "#a5d6a7",
    "Hard Dance": "#d32f2f", "IDM": "#8e24aa", "Hardgroove": "#5c6bc0",
    "Unknown": "#555555"
}

# Generate DJ_DATA
dj_data_lines = []
for dj in index["djs"]:
    g = dj.get("genres", [None])[0] if dj.get("genres") else "Unknown"
    dj_data_lines.append(f'  {{ id: {json.dumps(dj["id"])}, name: {json.dumps(dj["name"])}, genre: {json.dumps(g)} }}')

# Add carl-cox (missing from index.json)
dj_data_lines.append('  { id: "carl-cox", name: "Carl Cox", genre: "Techno" }')

print(f"DJ_DATA generated: {len(index['djs']) + 1} DJs")

# Find multi-DJ tracks
multi_tracks = [t for t in registry["tracks"] if len(t["played_by"]) > 1]

# Generate MULTI_DJ_TRACKS
track_lines = []
for t in multi_tracks:
    track_name = t["artist"] + " - " + t["title"]
    djs_json = json.dumps(t["played_by"])
    sets_json = json.dumps(t.get("sets", []))
    track_lines.append(f'  {{ track: {json.dumps(track_name)}, djs: {djs_json}, sets: {sets_json} }}')

print(f"MULTI_DJ_TRACKS generated: {len(multi_tracks)} multi-DJ tracks")

# Write output
lines = []
lines.append("// ======== DJ DATA ========")
lines.append("const DJ_DATA = [")
lines.append(",\n".join(dj_data_lines))
lines.append("];")
lines.append("")
lines.append("// ======== MULTI-DJ TRACKS ========")
lines.append("const MULTI_DJ_TRACKS = [")
lines.append(",\n".join(track_lines))
lines.append("];")

with open(OUTPUT, 'w') as f:
    f.write("\n".join(lines))

print(f"\n✅ Written to {OUTPUT}")
print("\n--- DJ_DATA ---")
for l in dj_data_lines[:3]:
    print(l)
print("...")
print("\n--- MULTI_DJ_TRACKS ---")
for l in track_lines:
    print(l)
