#!/usr/bin/env python3
"""
Build track-registry.json from confirmed tracklists across all DJ sets.
Sources: MixesDB, 1001tracklists, YouTube comments
"""
import json
from pathlib import Path

BASE = Path("/home/alb/projects/muntaner336/website-build")
REGISTRY = BASE / "data/djs/tracks/track-registry.json"
INDEX = BASE / "data/djs/index.json"

def load_index():
    with open(INDEX) as f:
        return json.load(f)

def save_registry(registry):
    with open(REGISTRY, 'w') as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)

def make_track_id(artist, title):
    """Generate a unique track ID from artist and title."""
    s = f"{artist}-{title}".lower()
    s = ''.join(c for c in s if c.isalnum() or c in '-_ ')
    s = s.replace(' ', '-')[:60]
    return s

# ============================================================
# CONFIRMED TRACKLISTS
# ============================================================

tracks = {}

def add_track(artist, title, dj_id, set_id, status="confirmed", timestamp=""):
    tid = make_track_id(artist, title)
    if tid not in tracks:
        tracks[tid] = {
            "id": tid,
            "title": title,
            "artist": artist,
            "played_by": [],
            "sets": [],
            "status": status,
            "timestamp_appearances": []
        }
    tracks[tid]["played_by"].append(dj_id)
    tracks[tid]["sets"].append(set_id)
    tracks[tid]["timestamp_appearances"].append({
        "set_id": set_id,
        "timestamp": timestamp
    })

# =====================
# 1. PALMS TRAX - Dekmantel 2024 (from MixesDB)
# =====================
palms_trax_2024 = [
    ("00", "Mood II Swing & Wall Of Sound", "I Need Your Luv (Church Mix)"),
    ("02", "DJ Antoine", "The Disco Bassline (Real Disco Bassline Mix)"),
    ("12", "Joeski", "Dia De Ayer (Extended Mix)"),
    ("24", "Club Royale", "Groove 4 Joy"),
    ("43", "Gilberto", "Da Samba (Club Mix)"),
    ("47", "Mr. Jay", "The Love"),
    ("66", "Borai & Denham Audio", "Make Me (Paul Sirrell Remix)"),
    ("79", "The Grid", "Diablo (The Devil Rides Out Mix)"),
    ("84", "DJ Flavours", "Your Caress (All I Need) (Open Arms Remix)"),
    ("93", "X-Press 2", "Smoke Machine"),
    ("108", "Sam Alfred", "Feel The Friction (Alfredo Mix)"),
]
for ts, artist, title in palms_trax_2024:
    add_track(artist, title, "palms-trax", "palms-trax-dekmantel-2024", timestamp=ts)

# =====================
# 2. FRANKIE KNUCKLES - Boiler Room NYC 2013 (from MixesDB)
# =====================
frankie_nyc = [
    ("58", "Frankie Knuckles", "Let's Stay Home (Director's Cut Classic Mix)"),
    ("53", "Erick Morillo, Harry Romero & Jose Nunez feat. Shawnee Taylor", "My Melody (Morillo & Romero Dirty Mix)"),
    ("47", "The Layabouts feat. Portia Monique", "Bring Me Joy (Directors Cut Remix)"),
    ("40", "Joey Negro & The Sunburst Band & Diane Charlemagne", "The Secret Life Of Us (Director's Cut Signature Mix)"),
    ("32", "Joe Smooth feat. Paris Brightledge", "We Gotta Love (Director's Cut Signature Mix)"),
    ("27", "Phunk Investigation", "Your Love (Instrumental Simulator Mix)"),
    ("22", "Frankie Knuckles Pres. Directors Cut feat. B Slade", "Get Over U (Rober Gaez 'Mustache' Mix)"),
    ("15", "Frankie Knuckles Pres. Director's Cut", "Bourgie Bourgie (A Director's Cut Exclusive)"),
    ("07", "Marko Militano feat. Darren Barrett", "Good People (A Director's Cut Master Exclusive)"),
    ("00", "Dbow", "Get Involved (Director's Cut Mix)"),
]
for ts, artist, title in frankie_nyc:
    add_track(artist, title, "frankie-knuckles", "frankie-knuckles-br-nyc", timestamp=ts)

# =====================
# 3. LAURENT GARNIER - Boiler Room Lyon 2015 (from MixesDB)
# =====================
laurent_lyon = [
    ("000", "5volts", "Opencluster"),
    ("007", "Redspecs", "Absent"),
    ("0??", "Rodriguez Jr.", "Kenopsia"),
    ("020", "M.A.N.D.Y.", "Gizmo (Monoloc Remix)"),
    ("023", "Marc Romboy vs. Blake Baxter", "Follow The Sound (Version 1)"),
    ("0??", "Stephan Bodzin", "Lx (Marc Romboy Lost In Leploops Remix)"),
    ("035", "Maceo Plex", "Solar Detroit"),
    ("041", "Trikk", "Firma"),
    ("0??", "Tripmastaz", "Grindin"),
    ("0??", "Mr. G", "Newmerique (Mango Boys Sunday Dub)"),
    ("0??", "Amy Winehouse", "Valerie (Andy Cato Pack Up And Dance Remix)"),
    ("059", "Après", "Chicago (Club Edit)"),
    ("064", "Julian Jabre", "War"),
    ("067", "Copy Paste Soul", "Home"),
    ("073", "Kölsch feat. Gregor Schwellenbach", "The Road"),
    ("080", "Sébastien Léger", "Soldier"),
    ("086", "Guy Gerber & Chaim", "Myspace"),
    ("091", "Joao Ceser", "5th Dimension"),
    ("095", "Trunkline", "1st Shoot (Clave Tool Mix)"),
    ("103", "Jan Driver", "Filter"),
    ("107", "DJ Rush", "Look & See (Daniel Boon & Marco Remus Remix)"),
    ("109", "Geeeman", "Wanna Go Bang"),
    ("1??", "Thomas Bangalter", "What To Do (ID Remix)"),
    ("120", "Kissy Sell Out feat. Holly Lois", "Tell You (Jay Robinson Remix)"),
    ("123", "Jay Robinson", "Carnage"),
    ("130", "Distro", "East Side"),
    ("134", "Corticyte", "Modulate"),
    ("139", "Agents Of Time", "Emperor"),
    ("143", "Hackman", "Semibreves (Epiphylogenetically Enumerated Reset By KiNK)"),
    ("1??", "Copy Paste Soul", "Voyager"),
    ("157", "Oniris", "Daylight"),
    ("162", "Laurent Garnier feat. The Lbs Crew", "Our Futur (Loud Disco Mix)"),
    ("169", "Cerrone", "Supernature"),
]
for ts, artist, title in laurent_lyon:
    add_track(artist, title, "laurent-garnier", "laurent-garnier-br-lyon", timestamp=ts)

# =====================
# 4. FLOATING POINTS - Boiler Room NYC 5hr (from MixesDB, partial)
# =====================
floating_nyc = [
    ("010", "Fairouz", "Ma Kedert Neseet"),
    ("014", "Renaissance Ensemble", "Pourque Les Fruits Murissent Cet Été"),
    ("017", "The Ba-Benzele Pygmies", "Hindewhu (Whistle Solo)"),
    ("019", "Maxime Denuc", "Ouverture"),
    ("023", "Agitation Free", "Rucksturz"),
    ("025", "Angie Stone", "Everyday"),
    ("028", "Dee Edwards", "(I Can) Deal With That"),
    ("031", "Pure Pleasure", "By My Side"),
    ("034", "Crystal Clear", "Stay With Me"),
    ("038", "JC Lodge", "Between The Sheets"),
    ("041", "Chevelle Franklin", "Real Love"),
    ("044", "Tiffany Villarreal", "You, Yourself & You"),
    ("047", "Melvin Sparks", "Ain't No Woman"),
    ("050", "Conjunto Los Tic Tac", "El Carreton"),
    ("052", "Joao Bosco", "A Nível De…"),
    ("056", "João Donato", "Xangô É De Baê"),
    ("059", "Paulo Jeronimo", "Vida Agitada"),
    ("062", "Allure feat. Az & Tone", "Head Over"),
    ("065", "Maurice Moore", "Everything That Shines"),
    ("090", "Scott Grooves", "La Ridd"),
    ("124", "Floating Points", "Fast Forward"),
]
for ts, artist, title in floating_nyc:
    add_track(artist, title, "floating-points", "floating-points-br-nyc-5hr", timestamp=ts)

# ============================================================
# BUILD REGISTRY
# ============================================================

# Deduplicate played_by and sets
for tid, track in tracks.items():
    track["played_by"] = list(dict.fromkeys(track["played_by"]))
    track["sets"] = list(dict.fromkeys(track["sets"]))

registry = {
    "tracks": list(tracks.values()),
    "stats": {
        "total_tracks": len(tracks),
        "cross_referenced": len([t for t in tracks.values() if len(t["played_by"]) > 1]),
        "dj_count": len(set(dj for t in tracks.values() for dj in t["played_by"]))
    }
}

save_registry(registry)

print(f"✅ Track registry built!")
print(f"   Total tracks: {registry['stats']['total_tracks']}")
print(f"   Cross-referenced (2+ DJs): {registry['stats']['cross_referenced']}")
print(f"   DJs represented: {registry['stats']['dj_count']}")

# Show DJ distribution
from collections import Counter
dj_counts = Counter(dj for t in tracks.values() for dj in t["played_by"])
for dj, count in dj_counts.most_common():
    print(f"   {dj}: {count} tracks")
