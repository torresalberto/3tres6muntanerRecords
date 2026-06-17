# Fix 04 — Discogs API keys in client-side script.js

**Severity:** 🔴 CRITICAL (security)
**File:** `script.js` (lines 14–15)
**Status:** ⚠️ DOCUMENTED (full fix requires owner action)

## The problem

```js
discogs: {
  consumerKey: 'sBEuWoUkdolwupCMeLjk',
  consumerSecret: 'OmvmhuqzJAPBwxYadiczZMsHaLQJoAsw',
  ...
}
```

Real Discogs API credentials are committed in plain text in `script.js`, which is loaded by every page on the site. Anyone who visits any page can:
1. Open DevTools → Sources
2. See the credentials
3. Use them to hit the Discogs API directly, bypassing any rate-limiting

This is a Discogs TOS violation. The seller account could be rate-limited or suspended if someone abuses the keys.

The keys are also in git history, so removing them from the current file is not enough — they're extractable from any historical commit.

## What was done in this fix

Added a loud `⚠️ SECURITY WARNING ⚠️` comment block above the keys in `script.js`, pointing to the rotation URL, the recommended proxy approach, and the corresponding `audit/fixes/04-discogs-api-keys-security.md` doc. This is **not a fix** — it's a marker so the issue isn't forgotten and a future contributor doesn't propagate the pattern.

## What the owner should do

### Step 1: Rotate the keys
Go to https://www.discogs.com/settings/developers and regenerate the consumer key + secret for the "Muntaner336 Website" application.

### Step 2: Move the keys to backend-only
The backend (`backend/server.js` line 63) already has the env-var pattern:
```js
const DISCOGS_CONFIG = {
  consumerKey: process.env.DISCOGS_CONSUMER_KEY,
  consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  ...
};
```
Set the rotated keys in `backend/.env` (NOT committed), and change the frontend to call the backend, not Discogs directly.

### Step 3: Replace the frontend Discogs call
The home page (`index.html` + `script.js`) makes a direct `fetch` to `https://api.discogs.com/users/3tres6records/inventory?...` using the exposed keys. Replace that with `fetch('/api/inventory')` against the backend.

The backend's `/api/inventory` endpoint already exists in `backend/server.js` (search for `app.get('/api/inventory'`). It pulls from Discogs using the env-var keys and serves the result to the frontend. No code changes needed beyond the frontend URL swap.

### Step 4: Remove the keys from script.js
After step 3 is verified to work, delete the `discogs` block from `CONFIG` in `script.js`.

## Why not just delete the keys now?

The current site is **functional** with the keys in place. If I deleted them, the home page would break (no inventory to display). The proper fix requires:
1. Setting up the backend deployment (the current backend is for `/downloads` — confirm the muntaner336 backend is also deployed)
2. Updating the frontend fetch URL
3. Testing the round-trip
4. Then removing the keys

This is a 1-2 hour change, not a 5-minute one. Flagged here so it doesn't get lost.

## Files changed

- `script.js` lines 10–19 (warning comment only).
