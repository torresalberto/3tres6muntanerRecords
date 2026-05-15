#!/usr/bin/env python3
"""Batch extract tracklists for remaining empty sets."""
import json, subprocess, sys, re, os
from pathlib import Path

BASE = Path(__file__).parent.parent
SETS_DIR = BASE / "data/djs/sets"
REGISTRY_PATH = BASE / "data/djs/tracks/track-registry.json"
TMP = BASE / "tmp"
TMP.mkdir(exist_ok=True)

EMPTY_SETS = [
    "avalon-emerson-dekmantel-2025",
    "dj-pierre-br-chicago",
    "frankie-knuckles-session-2015",
    "kettama-br-london",
    "palms-trax-dekmantel-2018",
    "rey-colino-br",
    "richie-hawtin-br-paris",
    "young-marco-dekmantel-ten",
]

FULL_TL = re.compile(
    r'^(\d{1,2}:\d{2}(?::\d{2})?)\s+'
    r'([A-Za-z0-9].*?)\s*[-–]\s*'
    r'([A-Za-z0-9].*?)'
    r'(?:\s*\[([^\]]+)\])?\s*$',
    re.MULTILINE
)

for sid in EMPTY_SETS:
    spath = SETS_DIR / f"{sid}.json"
    with open(spath) as f:
        data = json.load(f)
    url = data.get("youtube_url", "")
    if not url:
        print(f"❌ {sid}: no youtube_url")
        continue
    dj_id = data.get("dj_id", "?")
    print(f"\n🎯 {sid} ({dj_id})")
    print(f"   {url}")

    # Download comments
    vid_id = re.search(r'(?:v=|/)([a-zA-Z0-9_-]{11})', url)
    if not vid_id:
        print(f"   ❌ Could not extract video ID")
        continue
    vid_id = vid_id.group(1)
    outpath = TMP / f"{vid_id}.info.json"
    if not outpath.exists():
        result = subprocess.run([
            "yt-dlp", "--write-comments", "--skip-download",
            "--output", str(TMP / vid_id),
            "--no-warnings", url
        ], capture_output=True, text=True, timeout=180)
        if result.returncode != 0:
            print(f"   ❌ yt-dlp failed: {result.stderr[:200]}")
            continue
    else:
        print(f"   📁 Using cached {outpath.name}")

    if not outpath.exists():
        print(f"   ❌ Info JSON not found")
        continue

    with open(outpath) as f:
        info = json.load(f)
    comments = info.get("comments", [])
    print(f"   💬 {len(comments)} comments")

    # Extract full tracklists
    tracklist = []
    seen = set()
    for c in comments:
        text = c.get("text", "")
        likes = c.get("like_count", 0) or 0
        matches = FULL_TL.findall(text)
        for ts, artist, title, label in matches:
            key = f"{artist}||{title}".lower().strip()
            if key not in seen and len(key) > 10:
                seen.add(key)
                tracklist.append({
                    "position": len(tracklist) + 1,
                    "timestamp": ts,
                    "artist": artist.strip(),
                    "title": title.strip(),
                    "status": "confirmed"
                })

    if tracklist:
        print(f"   ✅ Extracted {len(tracklist)} tracks")
        data["tracklist"] = tracklist
        data.setdefault("curious_facts", {})["confirmed_tracks"] = len(tracklist)
    else:
        print(f"   ⚠️ No full tracklists found")

    with open(spath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

print("\n✅ Batch extraction complete!")
