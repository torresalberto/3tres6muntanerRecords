#!/usr/bin/env python3
"""
Export YouTube comments to DJ Library JSON format.
Usage: python3 export-to-dj-library.py <youtube_url> <dj_id> <set_id>
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse, parse_qs

def extract_video_id(url):
    parsed = urlparse(url)
    if parsed.hostname in ('www.youtube.com', 'youtube.com'):
        return parse_qs(parsed.query).get('v', [None])[0]
    elif parsed.hostname == 'youtu.be':
        return parsed.path[1:]
    return None

def parse_comments(info_json_path):
    with open(info_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    comments = data.get('comments', [])
    title = data.get('title', 'Unknown')
    duration = data.get('duration', 0)
    view_count = data.get('view_count', 0)
    
    # Extract track-relevant comments
    keywords = ['track id', 'trackid', 'song id', 'id?', 'timestamp', 'tracklist',
                '00:', '01:', '02:', '03:', '04:', '05:', '06:', '07:', '08:', '09:']
    time_pattern = re.compile(r'\b(\d{1,2}:\d{2}(?::\d{2})?)\b')
    
    track_comments = []
    for c in comments:
        text = c.get('text', '')
        lower = text.lower()
        score = 0
        
        for kw in keywords:
            if kw in lower:
                score += 2
        
        timestamps = time_pattern.findall(text)
        if timestamps:
            score += 3
        
        likes = c.get('like_count', 0)
        if likes >= 5:
            score += 1
        
        if score >= 2:
            track_comments.append({
                'text': text,
                'likes': likes,
                'timestamps': timestamps
            })
    
    # Aggregate by timestamp
    timestamp_requests = {}
    for c in track_comments:
        for ts in c['timestamps']:
            if ts not in timestamp_requests:
                timestamp_requests[ts] = {'count': 0, 'comments': []}
            timestamp_requests[ts]['count'] += 1
            if len(timestamp_requests[ts]['comments']) < 3:
                timestamp_requests[ts]['comments'].append(c['text'][:100])
    
    # Sort by request count
    most_requested = sorted(
        [{'timestamp': k, 'request_count': v['count'], 'sample_comments': v['comments']} 
         for k, v in timestamp_requests.items()],
        key=lambda x: -x['request_count']
    )[:10]
    
    return {
        'title': title,
        'duration': duration,
        'view_count': view_count,
        'total_comments': len(comments),
        'track_relevant_comments': len(track_comments),
        'most_requested_ids': most_requested
    }

def main():
    if len(sys.argv) < 4:
        print("Usage: python3 export-to-dj-library.py <youtube_url> <dj_id> <set_id>")
        print("Example: python3 export-to-dj-library.py 'https://youtube.com/watch?v=...' 'chaos-in-the-cbd' 'set-1'")
        sys.exit(1)
    
    url = sys.argv[1]
    dj_id = sys.argv[2]
    set_id = sys.argv[3]
    
    video_id = extract_video_id(url)
    if not video_id:
        print("Error: Could not extract video ID from URL")
        sys.exit(1)
    
    print(f"📹 Processing: {url}")
    print(f"🆔 Video ID: {video_id}")
    
    # Run yt-dlp to get comments
    import subprocess
    output_file = f"/tmp/{set_id}.info.json"
    
    result = subprocess.run([
        'yt-dlp', '--write-comments', '--skip-download',
        '--output', f'/tmp/{set_id}', url
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error: yt-dlp failed\n{result.stderr}")
        sys.exit(1)
    
    # Parse comments
    info_path = Path(f"/tmp/{set_id}.info.json")
    if not info_path.exists():
        print(f"Error: Expected file not found: {info_path}")
        sys.exit(1)
    
    data = parse_comments(info_path)
    
    # Generate set JSON template
    set_json = {
        "id": set_id,
        "dj_id": dj_id,
        "title": data['title'],
        "venue": "Unknown Venue",
        "date": "2024-01-01",
        "youtube_url": url,
        "youtube_embed_id": video_id,
        "duration_minutes": data['duration'] // 60,
        "duration_formatted": f"{data['duration'] // 60}:{data['duration'] % 60:02d}",
        "view_count": data['view_count'],
        "tracklist": [],
        "most_requested_ids": data['most_requested_ids'],
        "curious_facts": {
            "total_comments": data['total_comments'],
            "track_relevant_comments": data['track_relevant_comments'],
            "tracklist_requests": len(data['most_requested_ids']),
            "unidentified_tracks": 0,
            "confirmed_tracks": 0
        }
    }
    
    output_path = Path(f"../data/djs/sets/{set_id}.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(set_json, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Set JSON created: {output_path}")
    print(f"\n📊 Stats:")
    print(f"   Total comments: {data['total_comments']}")
    print(f"   Track-relevant: {data['track_relevant_comments']}")
    print(f"   Most requested IDs: {len(data['most_requested_ids'])}")
    print(f"\n🔥 Top requested timestamps:")
    for item in data['most_requested_ids'][:5]:
        print(f"   {item['timestamp']}: {item['request_count']} requests")
    
    print(f"\n⚠️  Next steps:")
    print(f"   1. Fill in venue, date, and tracklist manually")
    print(f"   2. Update data/djs/index.json to add this set")
    print(f"   3. Update data/djs/tracks/track-registry.json")
    print(f"   4. Add set data to dj-library.html")

if __name__ == '__main__':
    main()
