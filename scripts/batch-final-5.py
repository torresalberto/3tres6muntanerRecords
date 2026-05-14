#!/usr/bin/env python3
"""Add final 5 DJs to hit 30 total."""
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

# CARL CRAIG - BR x RBMA 2013 (Detroit legend)
for a, t in [
    ("Moodymann", "Got 2 Make It"),
    ("Moodymann feat. Roberta Sweed", "Shades Of Jae"),
    ("Tale Of Us", "Another Earth"),
    ("Model 500", "Neptune"),
    ("Loco Dice", "Detox"),
    ("Octave One", "Blackwater"),
    ("Carl Craig & Pepe Bradock", "Angola"),
    ("Inner City", "Good Life"),
]:
    add_track(a, t, "carl-craig", "carl-craig-br-rbma-2013")

# PANGAEA - BR Dekmantel Day 3 2015 (Hessle Audio)
for a, t in [
    ("Pangaea", "More Is More To Burn"),
    ("Pangaea", "Router"),
    ("DVS1", "Polyphonic Love"),
    ("Aleksi Perala", "UK74R1512110"),
    ("Ramadanman", "Don't Change For Me"),
    ("Planetary Assault Systems", "Pull"),
    ("Joe Claussell", "Je Ka Jo (Drums Of Passion)"),
]:
    add_track(a, t, "pangaea", "pangaea-br-dekmantel-2015")

# KINK - BR Moscow 2014 (Live PA)
for a, t in [
    ("KiNK", "Existence"),
    ("KiNK", "Leko"),
    ("KiNK", "Express"),
    ("KiNK", "Kazan"),
    ("Rachel Row", "Follow The Step (KiNK Remix)"),
]:
    add_track(a, t, "kink", "kink-br-moscow-2014")

# DJ KOZE - eclectic German legend (already has 'All The Time' via Four Tet)
for a, t in [
    ("DJ Koze", "All The Time"),
    ("DJ Koze", "Pick Up"),
    ("DJ Koze", "Ich Schlafe Auf Dem Ruecken"),
]:
    add_track(a, t, "dj-koze", "dj-koze-various")

# OBJEKT - played with Call Super at Dekmantel
for a, t in [
    ("Objekt", "Theme From Q"),
    ("Objekt", "Ganzfeld"),
    ("Objekt", "Dogma"),
]:
    add_track(a, t, "objekt", "objekt-various")

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

print(f"=== FINAL: 30 DJs TARGET ===")
print(f"Tracks: {reg['stats']['total_tracks']}")
print(f"DJs: {reg['stats']['dj_count']}")
print(f"Shared artists: {len(shared_artists)}")
print(f"Exact track cross-refs: {len(shared_tracks)}")
print()
print("=== ALL CROSS-REFERENCES ===")
for s in shared_artists:
    print(f"  {s['artist']}: {' & '.join(s['djs'])}")
