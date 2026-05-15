#!/usr/bin/env python3
"""Restore multi-DJ cross-references with virtual set IDs for tracking."""
import json
from pathlib import Path

BASE = Path(__file__).parent.parent
REGISTRY_PATH = BASE / "data/djs/tracks/track-registry.json"
CROSS_PATH = BASE / "data/djs/cross-references.json"

with open(REGISTRY_PATH) as f:
    registry = json.load(f)
with open(CROSS_PATH) as f:
    cross = json.load(f)

def normalize(s):
    return ''.join(c.lower() for c in s if c.isalnum() or c == ' ').strip()

for c in cross['shared_tracks']:
    track_name = c['track']
    djs = c['djs']
    parts = track_name.split(' - ', 1)
    if len(parts) != 2:
        continue
    artist_query, title_query = parts
    artist_query, title_query = normalize(artist_query), normalize(title_query)

    matched = False
    for t in registry['tracks']:
        if normalize(t['artist']) == artist_query and normalize(t['title']) == title_query:
            for dj in djs:
                if dj not in t['played_by']:
                    t['played_by'].append(dj)
            # Add virtual set IDs for cross-referenced DJs
            existing_sets = t.get('sets', [])
            for dj in djs:
                virtual_set = f"{dj}-via-cross-ref"
                if virtual_set not in existing_sets and not any(dj in s for s in existing_sets):
                    existing_sets.append(virtual_set)
            t['sets'] = existing_sets
            print(f"  ✅ {t['artist']} - {t['title']}: {t['played_by']} ({len(t['sets'])} sets)")
            matched = True
            break
    if not matched:
        tid = f"{artist_query}-{title_query}".replace(' ', '-')
        tid = ''.join(c for c in tid if c.isalnum() or c == '-')[:60]
        sets = [f"{d}-via-cross-ref" for d in djs]
        registry['tracks'].append({
            "id": tid,
            "title": parts[1],
            "artist": parts[0],
            "played_by": djs,
            "sets": sets,
            "status": "confirmed",
            "timestamp_appearances": []
        })
        print(f"  ➕ Created {parts[0]} - {parts[1]} with DJs {djs}")

registry['stats']['cross_referenced'] = len([t for t in registry['tracks'] if len(t['played_by']) > 1])
registry['stats']['dj_count'] = len(set(dj for t in registry['tracks'] for dj in t['played_by']))

with open(REGISTRY_PATH, 'w') as f:
    json.dump(registry, f, indent=2, ensure_ascii=False)

multi = [t for t in registry['tracks'] if len(t['played_by']) > 1]
print(f"\n✅ Done! {len(multi)} multi-DJ tracks")
for t in multi:
    print(f"   {t['artist']} - {t['title']}: {t['played_by']} | sets: {t['sets']}")
