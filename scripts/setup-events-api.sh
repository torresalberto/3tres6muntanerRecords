#!/usr/bin/env bash
#
# 3TRES6 Records — one-time server setup for the community events API.
#
# Run ONCE on the store host (the host that serves 3tres6records.albto.me)
# as the account owner. The live feed + admin token live OUTSIDE the docroot
# so rsync --delete can never wipe them.
#
#   ssh <host> 'bash -s' < scripts/setup-events-api.sh
#
set -euo pipefail

STORE="$HOME/3tres6-events"

if [ ! -d "$STORE" ]; then
  mkdir -p "$STORE"
  chmod 700 "$STORE"
  echo "created $STORE"
fi

if [ ! -f "$STORE/config.php" ]; then
  KEY="$( (head -c 64 /dev/urandom || openssl rand -hex 32) 2>/dev/null | base64 | tr -dc 'A-Za-z0-9' | cut -c1-32 )"
  if [ "${#KEY}" -lt 16 ]; then
    KEY="$(date +%s%N)$$$(hostname)"
  fi
  cat > "$STORE/config.php" <<PHP
<?php

\$EVENTS_STORE = '$STORE/live.json';
\$RATE_STORE = '$STORE/ratelimit.json';
\$ADMIN_KEY = '$KEY';
PHP
  chmod 600 "$STORE/config.php"
  echo "======================================================"
  echo " ADMIN KEY (keep safe, used for DELETE): $KEY"
  echo "======================================================"
fi

if [ ! -f "$STORE/live.json" ]; then
  echo '[]' > "$STORE/live.json"
fi
if [ ! -f "$STORE/ratelimit.json" ]; then
  echo '{}' > "$STORE/ratelimit.json"
fi
chmod 600 "$STORE/live.json" "$STORE/ratelimit.json"

if command -v php >/dev/null 2>&1; then
  echo "php: $(php -r 'echo PHP_VERSION;' 2>/dev/null)"
else
  echo "WARNING: php not found (community API will be read-only)."
fi

echo "Setup done — events stored in $STORE."