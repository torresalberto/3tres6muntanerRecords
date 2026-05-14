#!/usr/bin/env python3
"""Batch add Kerri Chandler, Ian Pooley, Apollonia to track registry and build cross-references."""
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

# KERRI CHANDLER - Boiler Room NYC 2022
for a, t in [
    ("The O'Jays", "I Love Music (Part I)"),
    ("Underground Ministries feat. Kenny Bobien", "I Shall Not Be Moved (Stand Still)"),
    ("Tasha LaRae & DJ Spen", "Wish I Didn't Miss You (John Morales M+M Vocal Mix)"),
    ("Kerri Chandler", "So Let The Wind Come"),
    ("Fusion Groove Orchestra feat. Steve Lucas", "If Only I Could (Liem Remix)"),
    ("Kerri Chandler", "I Feel It"),
    ("Kerri Chandler feat. Sunchilde", "Never Thought (Printworks) (Main Vocal Mix)"),
    ("Demuir", "High. Alive. And Dirty."),
    ("Dennis Ferrer feat. Tyrone Ellis", "Underground Is My Home"),
    ("Jovonn", "Random (Extended Mix)"),
    ("DJ Kwame", "Spirit Dance (Timmy Regisford Edit)"),
    ("Kerri Chandler feat. Rev F.L. Brown", "Prayer (623 Again Vocal)"),
    ("Matt Early & Lee Jeffries feat. Otis Corley", "I Think I'm Falling In Love (Grant Nelson Remix)"),
    ("Mateo & Matos", "Release The Rhythm (Kevin McKay Extended Remix)"),
    ("Honey Dijon feat. Annette Bowen & Nikki-O", "Downtown (Louie Vega Extended Raw Dub Mix)"),
    ("Crackazat", "Fire Drift"),
    ("Terry Hunter feat. Devine Brown", "Angel"),
    ("Kerri Chandler feat. Troy Denari", "Change Your Mind (District 8) (Full Vocal)"),
    ("Jovonn", "Hesperia Soul (Main Mix)"),
    ("Kerri Chandler feat. Lady Linn", "You Get Lost In It (The Warehouse Project)"),
    ("Armonica feat. Toshi", "Ngeke (andhim Remix)"),
    ("Emmaculate", "Voodoo (Shannon Chambers 1Sound Remix)"),
    ("Peven Everett", "Special (Timmy Regisford Remix)"),
    ("Masters At Work feat. India", "I Can't Get No Sleep (Ken/Lou 12 Inch)"),
    ("Kerri Chandler", "Atmospheric Beats"),
    ("Massimo Lippoli", "Let It Ride (Dario D'Attis Remix)"),
    ("Yves Murasca", "All About Housemusic (Dario D'Attis Extended Remix)"),
    ("Michel De Hey", "Tracklights (Crackazat Dub)"),
    ("JohNick", "Heat"),
]:
    add_track(a, t, "kerri-chandler", "kerri-chandler-br-nyc-2022")

# IAN POOLEY - HOR Berlin 2023
for a, t in [
    ("Ian O'Brien", "Eden"),
    ("Laurence Guy", "You Do Your Best To Hide The Good Parts Of Yourself"),
    ("Ian Pooley", "SP12 Electric Mistress"),
    ("Javonntte", "Enter The Disco"),
    ("JoVonn", "Eclipse"),
    ("Paul Johnson", "I Got Rhythm"),
    ("Loose Joints", "Honey Strut"),
    ("Ian Pooley", "Feel It"),
]:
    add_track(a, t, "ian-pooley", "ian-pooley-hor-berlin-2023")

# IAN POOLEY - Paloma Berlin 2023
for a, t in [
    ("Q-Burn's Abstract Message", "Mess Of Afros (Glenn Underground Remix)"),
    ("X-Press 2", "Zeven"),
    ("Boris Dlugosch feat. Rosin Murphy", "Never Enough (Ian Pooley's Raw Dub)"),
    ("6th Borough Project", "Rhythm"),
    ("Raw Instinct", "Grande De Folie (DJ Gregory's Main Club Mix)"),
    ("DJ Mes", "All About House"),
    ("Kerri Chandler", "Last Man Up"),
    ("Cajmere", "Only 4 U (ID Remix)"),
    ("Motor City Drum Ensemble", "Send A Prayer (Pt.2)"),
    ("Pepe Braddock", "4"),
    ("Nick Holder feat. Andraya", "Inside Your Soul"),
    ("Adam Port", "86"),
    ("Johnny D & Nicky P", "Wild Kingdom"),
    ("K-Alexi", "The Dancer (Ian Pooley Remix)"),
    ("Daft Punk", "Musique"),
    ("Ben Sims", "Raise Your Hands"),
    ("DJ Gregory", "S2 (Dubarash)"),
    ("Ian Pooley", "900 (Mix)"),
]:
    add_track(a, t, "ian-pooley", "ian-pooley-paloma-berlin-2023")

# APOLLONIA - BR x Epizode Festival Vietnam 2019
for a, t in [
    ("Moritz Von Oswald", "Watamu Beach Rework"),
    ("Audio Werner", "Story"),
    ("Klanggut", "Padlab"),
    ("Shonky & Dan Ghenacia", "Close To The Edge (The Mole Remix)"),
    ("Rowlanz", "Jogger"),
    ("Dave Barker", "Pos"),
    ("Apollonia", "Trinidad"),
    ("Callisto", "Need Ur Love (Stalagmite Mix)"),
    ("The Mole", "Bleep Blop Robot"),
    ("Nail", "I've Been There"),
]:
    add_track(a, t, "apollonia", "apollonia-br-epizode-2019")

# BUILD CROSS-REFERENCES
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
        shared_tracks.append({
            "track": f"{t['artist']} - {t['title']}",
            "djs": t["played_by"]
        })

cross_refs = {
    "shared_artists": shared_artists,
    "shared_tracks": shared_tracks,
    "stats": {
        "total_artist_connections": len(shared_artists),
        "total_track_connections": len(shared_tracks)
    }
}

with open(XREF, "w") as f:
    json.dump(cross_refs, f, indent=2, ensure_ascii=False)

dj_counts = Counter()
for t in reg["tracks"]:
    for dj in t["played_by"]:
        dj_counts[dj] += 1

reg["stats"] = {
    "total_tracks": len(reg["tracks"]),
    "cross_referenced": len(shared_tracks),
    "dj_count": len(dj_counts)
}

with open(REG, "w") as f:
    json.dump(reg, f, indent=2, ensure_ascii=False)

print(f"Tracks: {reg['stats']['total_tracks']}")
print(f"DJs: {reg['stats']['dj_count']}")
print(f"Shared artists: {len(shared_artists)}")
print(f"Exact track cross-refs: {len(shared_tracks)}")
print()
print("=== CROSS-REFERENCES ===")
for s in shared_artists:
    print(f"  ARTIST {s['artist']}: {' & '.join(s['djs'])}")
for s in shared_tracks:
    print(f"  TRACK {s['track']}: {' & '.join(s['djs'])}")
