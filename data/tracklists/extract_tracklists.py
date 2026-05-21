#!/usr/bin/env python3
"""
YouTube DJ Set Tracklist Extractor
Scrapes YouTube comments and extracts track identifications from DJ set videos.

Usage:
    python extract_tracklists.py <youtube_video_id> [--output tracklist.json]

Patterns detected:
    - "MM:SS - Artist - Title"
    - "MM:SS Artist - Title"
    - "MM:SS - Artist - Title (Label)"
    - "MM:SS Artist - Title (Label)"
    - "MM:SS - Artist ft. Featured - Title"
    - "MM:SS: Artist - Title"
"""

import re
import json
import sys
import argparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from html.parser import HTMLParser


class HTMLStripper(HTMLParser):
    """Strip HTML tags from text."""
    def __init__(self):
        super().__init__()
        self.fed = []
    def handle_data(self, data):
        self.fed.append(data)
    def get_data(self):
        return ''.join(self.fed)
    def reset(self):
        self.fed = []
        super().reset()


# Tracklist patterns (ordered by specificity)
TRACKLIST_PATTERNS = [
    # MM:SS - Artist - Title (Label)
    r'(\d{1,2}:\d{2})\s*[-–—]\s*(.+?)\s*[-–—]\s*(.+?)(?:\s*\[(.+?)\]|\s*\((.+?)\))?\s*$',
    # MM:SS Artist - Title
    r'(\d{1,2}:\d{2})\s+(.+?)\s*[-–—]\s*(.+?)(?:\s*\[(.+?)\]|\s*\((.+?)\))?\s*$',
    # MM:SS: Artist - Title
    r'(\d{1,2}:\d{2})\s*:\s*(.+?)\s*[-–—]\s*(.+?)(?:\s*\[(.+?)\]|\s*\((.+?)\))?\s*$',
]

# Common false positive patterns to exclude
EXCLUDE_PATTERNS = [
    r'^\d+\s*$',  # Just a number
    r'^\d+:\d{2}\s*$',  # Just a timestamp
    r'^tracklist',  # "tracklist" header
    r'^full tracklist',
    r'^timestamp',
    r'^time\s*$',
    r'^artist\s*$',
    r'^title\s*$',
    r'^song\s*$',
    r'^setlist',
    r'^please id',
    r'^can someone',
    r'^who is the',
    r'^what is the',
    r'^id\s*:',
    r'^help',
    r'^thanks',
    r'^amazing',
    r'^fire',
    r'^legend',
    r'^king',
    r'^queen',
    r'^goat',
    r'^best',
    r'^love this',
    r'^🔥',
    r'^❤',
    r'^👏',
    r'^💯',
]


def is_false_positive(text):
    """Check if text is a false positive (not a track identification)."""
    text_lower = text.lower().strip()
    for pattern in EXCLUDE_PATTERNS:
        if re.match(pattern, text_lower, re.IGNORECASE):
            return True
    return False


def parse_track_from_comment(comment_text):
    """Extract track information from a comment."""
    for pattern in TRACKLIST_PATTERNS:
        match = re.search(pattern, comment_text, re.IGNORECASE)
        if match:
            groups = match.groups()
            time = groups[0].strip()
            artist = groups[1].strip() if groups[1] else None
            title = groups[2].strip() if groups[2] else None
            label = groups[3].strip() if groups[3] else (groups[4].strip() if groups[4] else None)

            if artist and title and not is_false_positive(f"{artist} - {title}"):
                return {
                    "time": time,
                    "artist": artist,
                    "title": title,
                    "label": label,
                    "source_comment": comment_text[:200]
                }
    return None


def fetch_youtube_comments(video_id, max_comments=500):
    """
    Fetch YouTube comments using the YouTube Data API v3.
    Requires a valid API key.

    Alternative: Use yt-dlp or a headless browser for scraping.
    """
    api_key = "YOUR_YOUTUBE_API_KEY"  # Replace with actual key

    comments = []
    url = f"https://www.googleapis.com/youtube/v3/commentThreads"
    params = {
        "part": "snippet",
        "videoId": video_id,
        "maxResults": 100,
        "key": api_key,
        "order": "relevance",
        "textFormat": "plainText"
    }

    # This is a placeholder - actual implementation needs API key
    # For now, we'll use yt-dlp as fallback
    print(f"Fetching comments for video: {video_id}")
    print("Note: YouTube API key required. Use yt-dlp as alternative.")
    return comments


def fetch_comments_ytdlp(video_id, max_comments=500):
    """
    Fetch YouTube comments using yt-dlp.
    Requires yt-dlp to be installed.
    """
    import subprocess

    try:
        result = subprocess.run(
            [
                "yt-dlp",
                "--dump-json",
                "--skip-download",
                f"https://www.youtube.com/watch?v={video_id}"
            ],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode == 0:
            info = json.loads(result.stdout)
            return info.get("automatic_captions", {})
    except Exception as e:
        print(f"yt-dlp error: {e}")

    return {}


def extract_tracklist_from_comments(comments):
    """Extract tracklist from a list of comments."""
    tracks = []
    seen = set()

    for comment in comments:
        track = parse_track_from_comment(comment)
        if track:
            # Deduplicate by time + artist + title
            key = (track["time"], track["artist"].lower(), track["title"].lower())
            if key not in seen:
                seen.add(key)
                tracks.append(track)

    # Sort by timestamp
    tracks.sort(key=lambda t: time_to_seconds(t["time"]))
    return tracks


def time_to_seconds(time_str):
    """Convert MM:SS or HH:MM:SS to seconds."""
    parts = time_str.split(":")
    if len(parts) == 2:
        return int(parts[0]) * 60 + int(parts[1])
    elif len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    return 0


def main():
    parser = argparse.ArgumentParser(description="Extract tracklist from YouTube DJ set comments")
    parser.add_argument("video_id", help="YouTube video ID")
    parser.add_argument("--output", "-o", default=None, help="Output JSON file")
    parser.add_argument("--api-key", "-k", default=None, help="YouTube Data API key")
    parser.add_argument("--max-comments", "-m", type=int, default=500, help="Max comments to fetch")
    args = parser.parse_args()

    print(f"🎵 Extracting tracklist from YouTube video: {args.video_id}")

    # Fetch comments (API or yt-dlp)
    if args.api_key:
        comments = fetch_youtube_comments(args.video_id, args.max_comments)
    else:
        print("⚠️  No API key provided. Use --api-key or implement yt-dlp fallback.")
        print("\nFor now, paste comments manually and pipe to stdin:")
        print("  cat comments.txt | python extract_tracklists.py --stdin")
        return

    # Extract tracks
    tracks = extract_tracklist_from_comments(comments)

    if tracks:
        print(f"\n✅ Found {len(tracks)} tracks:")
        for track in tracks:
            label_str = f" [{track['label']}]" if track.get("label") else ""
            print(f"  {track['time']} - {track['artist']} - {track['title']}{label_str}")

        # Output
        output = {
            "video_id": args.video_id,
            "tracks_found": len(tracks),
            "tracks": tracks
        }

        if args.output:
            with open(args.output, "w") as f:
                json.dump(output, f, indent=2)
            print(f"\n💾 Saved to {args.output}")
        else:
            print(f"\n{json.dumps(output, indent=2)}")
    else:
        print("❌ No tracks found in comments.")


if __name__ == "__main__":
    main()
