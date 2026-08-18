#!/usr/bin/env bash
#
# 3TRES6 Records — admin helper for the community events API.
#
# The live feed + admin key live on the store host at:
#   <site docroot>/data/events/live/   (events.json, ratelimit.json, admin.key)
# That folder is excluded from rsync deploys and blocked from the web by its
# own .htaccess, so it survives redeploys and is never served.
#
# Get the key from the server:
#   ssh <host> 'cat <site docroot>/data/events/live/admin.key'
#
# Usage (key via $1 or $EVENTS_ADMIN_KEY):
#   scripts/events-admin.sh list
#   scripts/events-admin.sh delete <event-id>
#   scripts/events-admin.sh --key <KEY> list
#
set -euo pipefail

API="${EVENTS_API:-https://3tres6records.albto.me/api/events.php}"
KEY="${1:-${EVENTS_ADMIN_KEY:-}}"

cmd=""
case "${1:-}" in
  --key) KEY="$2"; shift 2;;
esac
cmd="${1:-}"
shift || true

if [ -z "$KEY" ]; then
  echo "ERROR: admin key required (arg or EVENTS_ADMIN_KEY)." >&2
  echo "It lives on the server at <site docroot>/data/events/live/admin.key" >&2
  exit 2
fi

case "$cmd" in
  list)
    curl -s "$API?live=1" | python3 -c '
import sys, json
d = json.load(sys.stdin)
events = [e for e in d.get("events", []) if e.get("community")]
if not events:
    print("(no community events)")
for e in events:
    print(f"{e[\"id\"]:24s} {e.get(\"date\", \"\")}  {e.get(\"title\", \"\")} @ {e.get(\"venue\", \"\")} [{e.get(\"city\", \"\")}]")
'
    ;;
  delete)
    id="${1:-}"
    if [ -z "$id" ]; then echo "usage: events-admin.sh delete <id>"; exit 2; fi
    curl -s -X DELETE "$API?id=$id&key=$KEY"
    echo
    ;;
  *)
    echo "usage: events-admin.sh [--key KEY] <list|delete <id>>" >&2
    exit 2
    ;;
esac