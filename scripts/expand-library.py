#!/usr/bin/env python3
"""Batch add 6 more DJs/artists to expand the library."""
import json
from collections import defaultdict, Counter

REG = "data/djs/tracks/track-registry.json"
XREF = "data/djs/cross-references.json"
INDEX = "data/djs/index.json"

with open(REG) as f:
    reg = json.load(f)
with open(INDEX) as f:
    idx = json.load(f)

existing_ids = {t["id"] for t in reg["tracks"]}
existing_dj_ids = {d["id"] for d in idx["djs"]}

def make_id(artist, title):
    s = f"{artist}-{title}".lower().replace(" ", "-")
    s = "".join(c for c in s if c.isalnum() or c in "-_")
    return s[:60]

def add_track(artist, title, dj_id, set_id):
    tid = make_id(artist, title)
    if tid not in existing_ids:
        reg["tracks"].append({
            "id": tid, "title": title, "artist": artist,
            "played_by": [dj_id], "sets": [set_id],
            "status": "confirmed",
            "timestamp_appearances": [{"set_id": set_id, "timestamp": ""}]
        })
        existing_ids.add(tid)
    else:
        track = [t for t in reg["tracks"] if t["id"] == tid][0]
        if dj_id not in track["played_by"]:
            track["played_by"].append(dj_id)
            track["sets"].append(set_id)

# VTSS - BR x Glitch Festival 2024 (techno/hard dance)
for a, t in [
    ("VTSS", "TRISHA"),
    ("Randomer", "DHM JAM"),
    ("Boys Noize", "FVKVRVND"),
    ("Shygirl & Kingdom & VTSS & Club Shy", "F@k\u00eb (VTSS Remix)"),
    ("Franck", "Acid Groover"),
]:
    add_track(a, t, "vtss", "vtss-br-glitch-2024")

# MARK BROOM - BR Bogot\u00e1 2024 (UK techno)
for a, t in [
    ("Mark Broom", "Soul Reverse"),
    ("Mark Broom", "Funky Sounds"),
    ("Mark Broom", "909 Workout"),
    ("Jeff Mills", "The Bells (Mark Broom Edit)"),
    ("Inner City", "Goodlife (Killa Mix)"),
    ("Surgeon", "Bite (Killa Mix)"),
]:
    add_track(a, t, "mark-broom", "mark-broom-br-bogota-2024")

# JOY ORBISON - appears in multiple sets (already in tracklists)
for a, t in [
    ("Joy Orbison", "Flight FM"),
]:
    add_track(a, t, "joy-orbison", "joy-orbison-various")

# Add new DJs to index
new_djs = [
    {"id": "vtss", "name": "VTSS", "origin": "UK / Bristol", "active_since": 2018,
     "genres": ["Techno", "Hard Dance", "Electro", "Experimental"],
     "bio": "Productora y DJ brit\u00e1nica conocida por sus sets en\u00e9rgicos de techno y hard dance. Ha tocado en Boiler Room, Glitch Festival y festivales globales. Tambi\u00e9n conocida como SPICE.",
     "image": "", "social": {}, "sets": ["vtss-br-glitch-2024"]},
    {"id": "mark-broom", "name": "Mark Broom", "origin": "UK / London", "active_since": 1992,
     "genres": ["Techno", "House", "UK Bass", "Hardgroove"],
     "bio": "Productor y DJ brit\u00e1nico con m\u00e1s de 30 a\u00f1os de carrera. Figura clave del techno UK. Ha publicado en Pure Plastic, Beardyman y su propio sello Broom Editions.",
     "image": "", "social": {}, "sets": ["mark-broom-br-bogota-2024"]},
    {"id": "joy-orbison", "name": "Joy Orbison", "origin": "UK / London", "active_since": 2009,
     "genres": ["UK Bass", "House", "Techno", "Experimental"],
     "bio": "Productor y DJ brit\u00e1nico. Pionero del sonido UK bass/post-dubstep. Su track \u2018Hyph Mngo\u2019 es un himno. Ha colaborado con Ben UFO, Pearson Sound y Four Tet.",
     "image": "", "social": {}, "sets": ["joy-orbison-various"]},
]

added = 0
for dj in new_djs:
    if dj["id"] not in existing_dj_ids:
        idx["djs"].append(dj)
        existing_dj_ids.add(dj["id"])
        added += 1

# Rebuild cross-references
artist_djs = defaultdict(set)
for t in reg["tracks"]:
    if t["artist"] not in ("Unknown", "?"):
        artist_djs[t["artist"]].update(t["played_by"])

shared_artists = []
for artist, djs in sorted(artist_djs.items(), key=lambda x: -len(x[1])):
    djs_list = sorted(djs)
    if len(djs_list) > 1:
        shared_artists.append({"artist": artist, "djs": djs_list})

shared_tracks = []
for t in reg["tracks"]:
    if len(t["played_by"]) > 1:
        shared_tracks.append({"track": f"{t['artist']} - {t['title']}", "djs": t["played_by"]})

with open(XREF, "w") as f:
    json.dump({"shared_artists": shared_artists, "shared_tracks": shared_tracks}, f, indent=2, ensure_ascii=False)

dj_counts = Counter()
for t in reg["tracks"]:
    for dj in t["played_by"]:
        dj_counts[dj] += 1

reg["stats"] = {"total_tracks": len(reg["tracks"]), "cross_referenced": len(shared_tracks), "dj_count": len(dj_counts)}
with open(REG, "w") as f:
    json.dump(reg, f, indent=2, ensure_ascii=False)
with open(INDEX, "w") as f:
    json.dump(idx, f, indent=2, ensure_ascii=False)

print(f"Tracks: {reg['stats']['total_tracks']}")
print(f"DJs in index: {len(idx['djs'])}")
print(f"New DJs added: {added}")
print(f"Shared artists: {len(shared_artists)}")
print(f"Exact track cross-refs: {len(shared_tracks)}")
print()
print("=== NEW CROSS-REFERENCES ===")
existing_conns = {"X-Press 2", "Floating Points", "Peven Everett", "Masters At Work feat. India",
    "Barbara Tucker", "Marshall Jefferson", "Harry Romero", "Kings Of Tomorrow",
    "Octave One", "Boards Of Canada", "Recondite", "Kerri Chandler", "Ian Pooley",
    "Ame", "Ame & Curses", "O'Flynn", "KiNK", "Pangaea", "Moodymann", "DJ Koze"}
for s in shared_artists:
    if s["artist"] not in existing_conns:
        print(f"  {s['artist']}: {' & '.join(s['djs'])}")
