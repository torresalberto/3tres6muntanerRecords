#!/usr/bin/env python3
"""Add Maceo Plex, Ame, Four Tet to reach 25 DJs."""
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

# MACEOPLEX - Boiler Room Berlin 2014 (16.6M views!)
for a, t in [
    ("Maceo Plex & Gabriel Ananda", "Solitary Daze"),
    ("Gardens Of God", "Fiddler"),
    ("Shall Ocin", "Orbis"),
    ("Confute", "On The Hour"),
    ("Dense & Pika", "Klank"),
    ("The Smiths", "How Soon Is Now? (Maceo Plex Remix)"),
    ("Der Dritte Raum", "Hale Bopp (Maceo Plex Edit)"),
    ("Nicolas Bougaieff", "Pulse Train"),
]:
    add_track(a, t, "maceo-plex", "maceo-plex-br-berlin-2014")

# AME - Boiler Room x Innervisions ADE 2012 (with Dixon)
for a, t in [
    ("Ame", "Asa"),
    ("Paul Simon", "Diamonds On The Soles Of Her Shoes (Ame Private Remix)"),
    ("Ian Pooley", "CompuRhythm (Dixon 4/4 Treatment)"),
    ("Recondite", "Drgn"),
    ("Konstantin Sibold", "Madeleine"),
    ("Monoloc", "Shame"),
    ("Ame & Curses", "Shadow Of Love"),
]:
    add_track(a, t, "ame", "ame-br-innervisions-ade-2012")

# FOUR TET - Boiler Room London 2015
for a, t in [
    ("Four Tet", "School"),
    ("Anthony Naples", "Refugio"),
    ("O'Flynn", "Tyrion"),
    ("Aphex Twin", "Xmas_Evet1 N"),
    ("Martyn & Four Tet", "Glassbeadgames (8 Hours At Fabric Dub)"),
    ("DJ Koze", "All The Time"),
    ("Caribou", "Never Come Back (Four Tet Remix)"),
    ("KH", "Only Human"),
    ("Jamie xx", "Idontknow"),
]:
    add_track(a, t, "four-tet", "four-tet-br-london-2015")

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
print("=== NEW CONNECTIONS (vs existing) ===")
existing = {"X-Press 2", "Floating Points", "Peven Everett", "Masters At Work feat. India", "Barbara Tucker", "Harry Romero", "Kings Of Tomorrow", "Boards Of Canada", "Kerri Chandler", "Marshall Jefferson"}
for s in shared_artists:
    if s["artist"] not in existing:
        print(f"  {s['artist']}: {' & '.join(s['djs'])}")
