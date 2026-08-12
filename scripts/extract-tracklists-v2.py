#!/usr/bin/env python3
"""
DJ Tracklist Extractor — canonical runner for the 3TRES6 DJ Library.

Usage:
    python3 scripts/extract-tracklists-v2.py <youtube_url> <prefix> [options]

Extracts a DJ set's track IDs from EVERY source available in the yt-dlp payload:
  Layer A   timestamped lines        "0:00 Artist - Title [Label]"
  Layer B   numbered lists           "1. Artist - Title - Label"   (DJ pinned comments, no timestamps)
  Layer C   ID requests              "track id at 1:05:35 ?"
  Layer D   timestamp mentions       "1:13:00 pleeease"
  Layer E   video description        + chapters (CLR / RA / podcast channels)

Signal boosts: pinned comments and comments by the channel owner are authoritative.

Output (review-first):
  tmp/sets/<prefix>_extracted.json     full report (source-tagged candidates)
  tmp/sets/<prefix>_set-scaffold.json  ready-to-edit set file in data/djs/sets/ schema
Use --apply to write the scaffold into data/djs/sets/ and rebuild the site data.

Docs: see scripts/TRACK_ID_EXTRACTION_PROTOCOL.md
"""
import argparse
import json
import re
import subprocess
import sys
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import parse_qs, urlparse

REPO_ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = REPO_ROOT / "tmp" / "sets"
SETS_DIR = REPO_ROOT / "data" / "djs" / "sets"

# ──────────────────────────────────────────────────────────────────────────
# Layer A — timestamped tracklist: "0:00 Artist - Title [Label]"
# ──────────────────────────────────────────────────────────────────────────
FULL_TL = re.compile(
    r'^(\d{1,2}:\d{2}(?::\d{2})?)\s+'   # timestamp
    r'([A-Za-z0-9][^\-–]{0,80}?)\s*[-–]\s*'   # artist (no hyphens allowed)
    r'([A-Za-z0-9].*?)'                   # title
    r'(?:\s*\[([^\]]+)\])?\s*$',          # optional [label]
    re.MULTILINE
)

# Layer B — numbered list. Split on " - " (space-dash-space) so hyphenated
# artist names like "M-Gee" or "R-One By Julien Creance" survive intact.
NUMBERED_RE = re.compile(r'^\s*(\d{1,3})[\.\)]\s+(.*)$')

# Layer C — ID request with timestamp
ID_REQ = re.compile(
    r'(track\s*id|song\s*id|trackid|tune\s*id|id\??|what\s+is|name\s+of|song\s+name|title\??)'
    r'.*?(\d{1,2}:\d{2}(?::\d{2})?)',
    re.IGNORECASE
)

# Layer D — any timestamp mention
TS_MENTION = re.compile(r'\b(\d{1,2}:\d{2}(?::\d{2})?)\b')


def extract_video_id(url):
    parsed = urlparse(url)
    if parsed.hostname in ('www.youtube.com', 'youtube.com'):
        return parse_qs(parsed.query).get('v', [None])[0]
    elif parsed.hostname == 'youtu.be':
        return parsed.path[1:]
    return None


def ts_ok(timestamp, duration):
    if not timestamp:
        return True
    ts_seconds = sum(int(x) * 60 ** i for i, x in enumerate(reversed(timestamp.split(':'))))
    return not duration or ts_seconds <= duration + 60


def parse_numbered_line(line):
    """'1. Artist - Title - Label' -> (artist, title, label). Splits on ' - '
    so hyphenated artists survive. Returns None if not a numbered list."""
    m = NUMBERED_RE.match(line)
    if not m:
        return None
    parts = [p.strip() for p in m.group(2).split(' - ')]
    if len(parts) < 2:
        return None
    artist, title = parts[0], parts[1]
    label = parts[2] if len(parts) > 2 else ''
    if not artist or not title or not re.match(r'^[A-Za-z0-9]', title):
        return None
    return artist, title, label


def scan_lines(lines, duration, source, owner, pinned, likes):
    """Run Layers A + B over a block of lines. Returns list of results."""
    out = []
    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Layer A: timestamped
        m = FULL_TL.match(line)
        if m:
            timestamp, artist, title, label = m.groups()
            if ts_ok(timestamp, duration):
                out.append({
                    'type': 'full_tracklist',
                    'confidence': 'high',
                    'format': 'timestamped',
                    'timestamp': timestamp,
                    'artist': artist.strip(),
                    'title': title.strip(),
                    'label': label.strip() if label else '',
                    'source': source,
                    'pinned': pinned,
                    'owner': owner,
                    'likes': likes,
                    'score': 10 + min(likes, 50) / 10 + (3 if owner else 0) + (1 if pinned else 0)
                })
            continue

        # Layer B: numbered
        numbered = parse_numbered_line(line)
        if numbered:
            artist, title, label = numbered
            out.append({
                'type': 'full_tracklist',
                'confidence': 'high',
                'format': 'numbered',
                'timestamp': '',
                'artist': artist,
                'title': title,
                'label': label,
                'source': source,
                'pinned': pinned,
                'owner': owner,
                'likes': likes,
                'score': 9 + min(likes, 50) / 10 + (3 if owner else 0) + (1 if pinned else 0)
            })
    return out


def norm_handle(name):
    """'@Etapp Kyle' -> 'etappkyle' (for owner == uploader comparison)."""
    return re.sub(r'[^a-z0-9]', '', (name or '').lower())


def parse_payload(data):
    """Parse all layers from an info.json dict. Returns (results, title, comment_count)."""
    comments = data.get('comments', [])
    duration = data.get('duration', 0) or 0
    uploader = norm_handle(data.get('uploader') or data.get('channel'))
    results = []

    # Pass 1 — comments: Layers A + B
    for c in comments:
        text = c.get('text', '')
        likes = c.get('like_count', 0) or 0
        owner = norm_handle(c.get('author')) == uploader
        pinned = bool(c.get('is_pinned'))
        results.extend(scan_lines(text.split('\n'), duration, 'comment', owner, pinned, likes))

    # Pass 1b — description: Layers A + B (channels ship full lists here)
    desc = data.get('description') or ''
    if desc.strip():
        results.extend(scan_lines(desc.split('\n'), duration, 'description', True, False, 0))

    # Pass 2 — ID requests (Layer C)
    for c in comments:
        text = c.get('text', '')
        likes = c.get('like_count', 0) or 0
        m = ID_REQ.search(text)
        if m and ts_ok(m.group(2), duration):
            results.append({
                'type': 'id_request',
                'confidence': 'medium',
                'timestamp': m.group(2),
                'artist': '',
                'title': '',
                'label': '',
                'source': 'comment',
                'pinned': bool(c.get('is_pinned')),
                'owner': norm_handle(c.get('author')) == uploader,
                'likes': likes,
                'text': text[:150],
                'score': 5 + min(likes, 50) / 20
            })

    # Pass 3 — timestamp mentions (Layer D), only if not already captured
    seen_tss = set(r['timestamp'] for r in results)
    for c in comments:
        text = c.get('text', '')
        likes = c.get('like_count', 0) or 0
        kw_hits = ['track', 'song', 'tune', 'minute', 'this', 'name', 'id']
        for ts in TS_MENTION.findall(text):
            if ts not in seen_tss and any(k in text.lower() for k in kw_hits) and ts_ok(ts, duration):
                results.append({
                    'type': 'mention',
                    'confidence': 'low',
                    'timestamp': ts,
                    'artist': '',
                    'title': '',
                    'label': '',
                    'source': 'comment',
                    'pinned': bool(c.get('is_pinned')),
                    'owner': False,
                    'likes': likes,
                    'text': text[:150],
                    'score': 2 + min(likes, 50) / 50
                })

    results.sort(key=lambda x: -x['score'])
    return results, data.get('title', 'Unknown'), len(comments)


def build_scaffold(data, results, prefix, video_id, args):
    """Build a set file in the current data/djs/sets/ schema (review-first)."""
    confirmed = [r for r in results if r['type'] == 'full_tracklist']
    id_requests = [r for r in results if r['type'] == 'id_request']

    ts_counts = defaultdict(list)
    for r in id_requests:
        ts_counts[r['timestamp']].append(r['text'])
    most_requested = [
        {'timestamp': ts, 'request_count': len(samples),
         'sample_comments': samples[:3], 'status': 'unidentified'}
        for ts, samples in sorted(ts_counts.items(), key=lambda x: -len(x[1]))
    ]

    tracklist = []
    seen = set()
    for i, r in enumerate(confirmed, 1):
        key = (r['timestamp'], r['artist'].strip().lower(), r['title'].strip().lower())
        if key in seen:
            continue
        seen.add(key)
        entry = {
            'position': i,
            'timestamp': r['timestamp'],
            'time': r['timestamp'],
            'artist': r['artist'],
            'title': r['title'],
            'status': 'confirmed',
            'notes': 'DJ pinned comment' if (r['owner'] and r['pinned']) else
                     ('Channel description' if r['source'] == 'description' else
                      ('Pinned comment' if r['pinned'] else 'Comments'))
        }
        if r['label']:
            entry['label'] = r['label']
        tracklist.append(entry)

    dur_min = int((data.get('duration') or 0) // 60)
    dur_fmt = data.get('duration_string') or ''

    incomplete = len(confirmed) == 0 or len(most_requested) > 0
    recheck = (date.today() + timedelta(days=14)).isoformat() if incomplete else None

    curious = {
        'total_comments': data.get('comment_count') or len(data.get('comments') or []),
        'confirmed_tracks': len(confirmed),
        'unidentified_tracks': len(most_requested),
        'tracklist_source': '; '.join(sorted({r['source'] for r in confirmed})) or 'none',
        'tracklist_format': '; '.join(sorted({r.get('format', '') for r in confirmed})) or 'none',
    }
    if recheck:
        curious['recheck_after'] = recheck
        curious['recheck_note'] = 'Comments grow over time — re-run to capture IDs the DJ/community posts later.'

    return {
        'id': prefix,
        'dj_id': args.dj or '',
        'title': args.title or data.get('title', ''),
        'venue': args.venue or '',
        'date': args.date or data.get('upload_date', ''),
        'youtube_url': f"https://www.youtube.com/watch?v={video_id}",
        'youtube_embed_id': video_id,
        'duration_minutes': dur_min,
        'duration_formatted': dur_fmt,
        'view_count': data.get('view_count') or 0,
        'channel': data.get('channel') or data.get('uploader') or '',
        'genres': (args.genres or '').split(',') if args.genres else [],
        'tracks_identified': len(tracklist),
        'tracks_total': len(tracklist),
        'tracklist': tracklist,
        'most_requested_ids': most_requested,
        'curious_facts': curious,
    }


def main():
    ap = argparse.ArgumentParser(description='Extract a DJ set tracklist for the 3TRES6 DJ Library.')
    ap.add_argument('url')
    ap.add_argument('prefix', help='Output/file prefix (also used as the set id)')
    ap.add_argument('--dj', help='dj_id (e.g. etapp-kyle)')
    ap.add_argument('--title')
    ap.add_argument('--venue')
    ap.add_argument('--date', help='YYYY-MM-DD')
    ap.add_argument('--genres', help='comma-separated genre list')
    ap.add_argument('--apply', action='store_true',
                    help='Write scaffold to data/djs/sets/ and rebuild (default: dry-run to tmp/)')
    ap.add_argument('--force', action='store_true', help='Re-download comments even if cached')
    args = ap.parse_args()

    video_id = extract_video_id(args.url) or args.url
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    output_file = TMP_DIR / f"{args.prefix}.info.json"

    if not output_file.exists() or args.force:
        print(f"📥 Downloading comments for {video_id}...")
        result = subprocess.run([
            'yt-dlp', '--write-comments', '--skip-download', '--no-playlist',
            '--output', str(TMP_DIR / args.prefix), args.url
        ], capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            print(f"❌ yt-dlp failed: {result.stderr[:300]}")
            sys.exit(1)

    if not output_file.exists():
        print(f"❌ Expected file not found: {output_file}")
        sys.exit(1)

    with open(output_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    results, title, total = parse_payload(data)
    confirmed = [r for r in results if r['type'] == 'full_tracklist']
    id_requests = [r for r in results if r['type'] == 'id_request']

    id_ts = defaultdict(list)
    for r in id_requests:
        id_ts[r['timestamp']].append(r['text'])

    print(f"\n📹 {title}")
    print(f"💬 Total comments: {total}")
    print(f"🎯 Confirmed tracks: {len(confirmed)}  |  ID requests: {len(id_requests)}")
    print("=" * 62)

    for r in confirmed:
        tag = '⭐' if r['owner'] else ('📌' if r['pinned'] else '  ')
        src = r['source'][:4]
        label_str = f" [{r['label']}]" if r['label'] else ""
        print(f"  {tag} {r['timestamp'] or '--:--':<8} {r['artist']} - {r['title']}{label_str}  ({src})")

    if id_requests:
        print("\n🔍 ID REQUESTS (unresolved slots):")
        for ts, samples in sorted(id_ts.items(), key=lambda x: -len(x[1])):
            print(f"  {ts}: {len(samples)}x")

    # Report (review-first)
    set_data = {
        'video_title': title,
        'video_id': video_id,
        'total_comments': total,
        'confirmed_tracks': confirmed,
        'most_requested': [
            {'timestamp': ts, 'count': len(samples)}
            for ts, samples in sorted(id_ts.items(), key=lambda x: -len(x[1]))[:10]
        ]
    }
    report_path = TMP_DIR / f"{args.prefix}_extracted.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(set_data, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Report saved to {report_path}")

    # Scaffold
    scaffold = build_scaffold(data, results, args.prefix, video_id, args)
    if args.apply:
        dest = SETS_DIR / f"{args.prefix}.json"
        with open(dest, 'w', encoding='utf-8') as f:
            json.dump(scaffold, f, indent=2, ensure_ascii=False)
        print(f"✅ Set written to {dest}")
        build = subprocess.run(['node', 'scripts/build-dj-data.js'],
                               cwd=str(REPO_ROOT), capture_output=True, text=True)
        print(build.stdout[-1200:] if build.stdout else build.stderr[-1200:])
    else:
        scaffold_path = TMP_DIR / f"{args.prefix}_set-scaffold.json"
        with open(scaffold_path, 'w', encoding='utf-8') as f:
            json.dump(scaffold, f, indent=2, ensure_ascii=False)
        print(f"✅ Scaffold saved to {scaffold_path} (review, then re-run with --apply)")

    # Agent next steps
    print("\n" + "═" * 62)
    print("NEXT STEPS FOR THE AGENT")
    print("═" * 62)
    print("1. Review the confirmed tracks (fix artist/title split issues, esp. hyphenated names).")
    print("2. Resolve ambiguities (two IDs for one slot): prefer the DJ/owner answer;")
    print("   cross-check 1001tracklists.com, MixesDB, Discogs, agent-reach (X/Reddit).")
    print("3. Fill gaps marked ID REQUEST via the sources above (comments-only coverage is partial).")
    print("4. When satisfied: python3 scripts/extract-tracklists-v2.py <url> <prefix> "
          "--dj <dj-id> --venue <venue> --date <date> --apply")
    print("5. Prettier check: npx prettier --check data/djs/sets/<prefix>.json")
    print("6. Commit + push (deploy workflow rebuilds + deploys).")


if __name__ == '__main__':
    main()
