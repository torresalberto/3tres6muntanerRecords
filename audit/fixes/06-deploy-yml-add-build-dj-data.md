# Fix 06 — Add scripts/build-dj-data.js to deploy.yml

**Severity:** 🟢 MEDIUM
**File:** `.github/workflows/deploy.yml`
**Status:** ✅ FIXED

## The problem

The deploy workflow ran two build steps:
- `node scripts/curate-events.js refresh` (calendar events)
- `node scripts/build-dj-library.js` (pre-renders `/dj-library/*.html`)

But it did **not** run `node scripts/build-dj-data.js`, which is what regenerates the 3D Brain's compiled data:
- `data/tracklists/tracklists.js` (inline-loaded by 3d-brain.html)
- `data/djs/cross-references.json` (async enrichment)
- `data/djs/tracks/track-registry.json` (DJ Library graph)
- `data/djs/index.json` (DJ metadata, backfilled stats & images)

The compiled files in git were regenerated manually and committed. If anyone:
- Deletes a set JSON in `data/djs/sets/`
- Renames a DJ's id
- Runs a fresh `git clone` + manual deploy

…the 3D Brain would silently show stale or missing data.

## The fix

Added a `Build DJ Brain data` step to **both** the `deploy-pages` and `deploy-server` jobs. Same `if ! node ... then ::warning::` pattern as the other build steps, so a build failure won't block the deploy.

```yaml
- name: Build DJ Brain data
  run: |
    if ! node scripts/build-dj-data.js 2>&1; then
      echo "::warning::build-dj-data failed — continuing deploy with existing compiled data"
    fi
```

## What the build script does

`scripts/build-dj-data.js` (514 lines, already in repo) reads every JSON in `data/djs/sets/`, normalizes tracks/artists, builds cross-references (shared tracks, shared artists, venue networks, label affinity, genre bridges, super connectors), regenerates the track registry, and backfills DJ metadata + YouTube thumbnails. It is **the single source of truth** for everything the 3D Brain shows.

After this fix, every deploy will have fresh data.

## Files changed

- `.github/workflows/deploy.yml` (added 1 step in `deploy-pages`, 1 step in `deploy-server`).
