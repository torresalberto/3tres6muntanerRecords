#!/usr/bin/env python3
"""
v2 Tracklist Extractor — Multi-layer detection with confidence scoring
Supports: full tracklists, ID requests, timestamp mentions
"""
import json, re, sys
from pathlib import Path
from collections import defaultdict
from urllib.parse import urlparse, parse_qs

def extract_video_id(url):
    parsed = urlparse(url)
    if parsed.hostname in ('www.youtube.com', 'youtube.com'):
        return parse_qs(parsed.query).get('v', [None])[0]
    elif parsed.hostname == 'youtu.be':
        return parsed.path[1:]
    return None

# Layer 1: Full tracklist pattern: "0:00 Artist - Title [Label]"
FULL_TL = re.compile(
    r'^(\d{1,2}:\d{2}(?::\d{2})?)\s+'  # timestamp
    r'([A-Za-z0-9].*?)\s*[-–]\s*'        # artist
    r'([A-Za-z0-9].*?)'                   # title
    r'(?:\s*\[([^\]]+)\])?\s*$',          # optional [label]
    re.MULTILINE
)

# Layer 2: ID request with timestamp
ID_REQ = re.compile(
    r'(track\s*id|song\s*id|trackid|tune\s*id|id\??|what\s+is|name\s+of|song\s+name|title\??)'
    r'.*?(\d{1,2}:\d{2}(?::\d{2})?)',
    re.IGNORECASE
)

# Layer 3: Any timestamp mention
TS_MENTION = re.compile(r'\b(\d{1,2}:\d{2}(?::\d{2})?)\b')

def parse_comments(info_json_path):
    with open(info_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    comments = data.get('comments', [])
    duration = data.get('duration', 0)  # in seconds
    results = []

    # First pass: look for full tracklists in comments
    for c in comments:
        text = c.get('text', '')
        likes = c.get('like_count', 0) or 0
        lines = text.split('\n')

        for line in lines:
            m = FULL_TL.match(line.strip())
            if m:
                timestamp, artist, title, label = m.groups()
                # Validate timestamp is within video duration
                ts_seconds = sum(int(x) * 60 ** i for i, x in enumerate(reversed(timestamp.split(':'))))
                ts_ok = not duration or ts_seconds <= duration + 60
                if ts_ok:
                    results.append({
                        'type': 'full_tracklist',
                        'confidence': 'high',
                        'timestamp': timestamp,
                        'artist': artist.strip(),
                        'title': title.strip(),
                        'label': label.strip() if label else '',
                        'likes': likes,
                        'score': 10 + min(likes, 50) / 10
                    })

    # Second pass: ID requests
    for c in comments:
        text = c.get('text', '')
        likes = c.get('like_count', 0) or 0
        m = ID_REQ.search(text)
        if m:
            ts = m.group(2)
            ts_seconds = sum(int(x) * 60 ** i for i, x in enumerate(reversed(ts.split(':'))))
            ts_ok = not duration or ts_seconds <= duration + 60
            if ts_ok:
                results.append({
                    'type': 'id_request',
                    'confidence': 'medium',
                    'timestamp': ts,
                    'artist': '',
                    'title': '',
                    'text': text[:150],
                    'likes': likes,
                    'score': 5 + min(likes, 50) / 20
                })

    # Third pass: timestamp mentions (only if not already caught)
    seen_tss = set(r['timestamp'] for r in results)
    for c in comments:
        text = c.get('text', '')
        likes = c.get('like_count', 0) or 0
        matches = TS_MENTION.findall(text)
        for ts in matches:
            if ts not in seen_tss:
                kw_score = 0
                kw_hits = ['track', 'song', 'tune', 'minute', 'this', 'name', 'id']
                if any(k in text.lower() for k in kw_hits):
                    kw_score = 2
                ts_seconds = sum(int(x) * 60 ** i for i, x in enumerate(reversed(ts.split(':'))))
                ts_ok = not duration or ts_seconds <= duration + 60
                if ts_ok and kw_score > 0:
                    results.append({
                        'type': 'mention',
                        'confidence': 'low',
                        'timestamp': ts,
                        'artist': '',
                        'title': '',
                        'text': text[:150],
                        'likes': likes,
                        'score': kw_score + min(likes, 50) / 50
                    })

    # Sort by score
    results.sort(key=lambda x: -x['score'])
    return results, data.get('title', 'Unknown'), len(comments)

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 extract-tracklists-v2.py <youtube_url> <output_prefix>")
        sys.exit(1)

    url = sys.argv[1]
    prefix = sys.argv[2]
    video_id = extract_video_id(url) or url

    import subprocess, tempfile
    tmp_dir = Path("/home/alb/projects/muntaner336/website-build/tmp/sets")
    tmp_dir.mkdir(parents=True, exist_ok=True)

    output_file = tmp_dir / f"{prefix}.info.json"
    if not output_file.exists():
        print(f"📥 Downloading comments for {video_id}...")
        result = subprocess.run([
            'yt-dlp', '--write-comments', '--skip-download',
            '--output', str(tmp_dir / prefix), url
        ], capture_output=True, text=True, timeout=180)
        if result.returncode != 0:
            print(f"❌ yt-dlp failed: {result.stderr[:200]}")
            sys.exit(1)

    if not output_file.exists():
        print(f"❌ Expected file not found: {output_file}")
        sys.exit(1)

    results, title, total = parse_comments(output_file)

    print(f"\n📹 {title}")
    print(f"💬 Total comments: {total}")
    print(f"🎯 Relevant results: {len(results)}")
    print(f"{'='*60}")

    # Show high confidence (full tracklist) results first
    high = [r for r in results if r['type'] == 'full_tracklist']
    if high:
        print(f"\n✅ FULL TRACKLISTS FOUND ({len(high)}):")
        for r in high[:30]:
            label_str = f" [{r['label']}]" if r['label'] else ""
            print(f"  {r['timestamp']} {r['artist']} - {r['title']}{label_str}")

    medium = [r for r in results if r['type'] == 'id_request']
    if medium:
        print(f"\n🔍 ID REQUESTS ({len(medium)}):")
        ts_counts = defaultdict(int)
        for r in medium:
            ts_counts[r['timestamp']] += 1
        top = sorted(ts_counts.items(), key=lambda x: -x[1])[:10]
        for ts, count in top:
            print(f"  {ts}: {count}x requests")

    # Save structured output
    set_data = {
        'video_title': title,
        'video_id': video_id,
        'total_comments': total,
        'results': results,
        'confirmed_tracks': high[:30],
        'most_requested': [
            {'timestamp': ts, 'count': count}
            for ts, count in sorted(
                defaultdict(int).items(), key=lambda x: -x[1]
            )[:10]
        ]
    }

    # Actually compute most_requested properly
    ts_counts = defaultdict(int)
    for r in medium:
        ts_counts[r['timestamp']] += 1
    set_data['most_requested'] = [
        {'timestamp': ts, 'count': count}
        for ts, count in sorted(ts_counts.items(), key=lambda x: -x[1])[:10]
    ]

    out_path = tmp_dir / f"{prefix}_extracted.json"
    with open(out_path, 'w') as f:
        json.dump(set_data, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Saved to {out_path}")
    print(f"\n📊 Stats: {len(high)} confirmed tracks, {len(medium)} ID requests")

if __name__ == '__main__':
    main()
