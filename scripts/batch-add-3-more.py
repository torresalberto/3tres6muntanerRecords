#!/usr/bin/env python3
"""Add Dixon, Ben UFO, Moodymann to the registry."""
import json
from collections import defaultdict, Counter

REG = "data/djs/tracks/track-registry.json"
XREF = "data/djs/cross-references.json"

with open(REG) as f:
    reg = json.load(f)
existing_ids = {t["id"] for t in reg["tracks"]}

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

# DIXON - Cercle Festival 2024 (Innervisions, melodic techno/house)
for a, t in [
    ("SBTRKT", "VOLCA"),
    ("Ede & Nowa", "I Am Wavy"),
    ("Alex Medina", "La Gustosa"),
    ("Jimi Jules", "Don't Break My Heart"),
    ("Hunter/Game & Noah Kaluga", "Stars (Mano Le Tough Remix)"),
    ("Deer Jade", "Firmament"),
    ("Ame", "Asa"),
    ("Ame & Curses", "Shadow Of Love"),
    ("Yet More", "Tryna Jack My Style"),
    ("MULYA", "Aus Music"),
]:
    add_track(a, t, "dixon", "dixon-cercle-2024")

# BEN UFO - Boiler Room x Sugar Mountain 2025
for a, t in [
    ("Mim Suleiman", "Fumbo"),
    ("Or:la", "Chant (Pearson Sound Edit)"),
    ("Olof Dreijer & Diva Cruz", "Acuyuye"),
    ("Breaka", "Squashy Track"),
    ("O'Flynn", "Srekye"),
    ("Binary Digit", "Ale By The Sea"),
    ("KiNK", "Kazan"),
    ("Skream & KODO", "Shinogi"),
    ("Pangaea", "Router"),
    ("Pearson Sound", "Untitled"),
    ("Digital Mystikz", "Walkin' With Jah"),
    ("Addison Groove", "Fuk Tha 101"),
]:
    add_track(a, t, "ben-ufo", "ben-ufo-br-sugar-mountain-2025")

# MOODYMANN - RBMA Rollerskating Jam 2010
for a, t in [
    ("Cloud One", "Atmosphere Strut"),
    ("Lonnie Smith", "Funk Reaction"),
    ("Slum Village", "Disco"),
    ("Dwele", "Feels So Good"),
    ("Roy Ayers", "Love Will Bring Us Back Together"),
    ("William DeVaughn", "Be Thankful For What You Got"),
    ("Indeep", "Last Night A DJ Saved My Life"),
    ("Marshall Jefferson", "The House Music Anthem - Dub Your Body"),
    ("Alexander Robotnick", "Problemes D'Amour"),
    ("The Whispers", "The Planets Of Life"),
    ("Prince", "Uptown"),
    ("Moodymann", "J.A.N."),
    ("Phuture", "Acid Trax"),
]:
    add_track(a, t, "moodymann", "moodymann-rbma-2010")

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

print(f"Tracks: {reg['stats']['total_tracks']}")
print(f"DJs: {reg['stats']['dj_count']}")
print(f"Shared artists: {len(shared_artists)}")
print(f"Exact track cross-refs: {len(shared_tracks)}")
print()
print("=== NEW CONNECTIONS ===")
existing_conns = {"X-Press 2", "Floating Points", "Peven Everett", "Masters At Work feat. India", "Barbara Tucker", "Harry Romero", "Kings Of Tomorrow", "Boards Of Canada", "Kerri Chandler"}
for s in shared_artists:
    if s["artist"] not in existing_conns:
        print(f"  {s['artist']}: {' & '.join(s['djs'])}")
