# 3TRES6 Muntaner336 — Site Audit Report
**Date:** 2026-06-11
**URL:** https://3tres6records.albto.me/
**Audit goal:** Verify the 4 user tasks + discover any hidden bugs

---

## TASK 1: Music Player Verification ✅ WORKS

**Status: PASS** (with one minor caveat)

Tested on:
- `/` (home) → player loads
- `/3d-brain.html` (via Swup nav) → player persists

Findings:
- Player iframe `qfF19hUzLo0` (`3TRES6 Radio`) present on every page
- State saved in `localStorage['3tres6_audio_state']`
- Toggle button class `audio-toggle playing` preserved across Swup transitions
- Slim bottom bar (commit `caf8c04`) prevents the player from covering cards
- No console errors on any page tested

**Caveat:** The home page does NOT explicitly call `AudioPlayer.init()` (the script has it on `DOMContentLoaded`). Tested — no JS errors, so it's fine, but worth a defensive guard if it ever breaks.

---

## TASK 2: Calendar Population Script ✅ EXISTS

**Status: SCRIPT EXISTS, NOT YET WIRED UP**

Found `scripts/curate-events.js` (394 lines) — full-featured curator:
- Subcommands: `list`, `add`, `remove`, `approve`, `refresh`, `validate`, `dedupe`, `export-pending`
- Scraper stubs for: Instagram, AudioDias, Alta Fidelitat Club, Les Enfants
- Each scraper returns `[]` on failure (safe to run)

Current `data/events/events.json`:
- **6 events total** (4 future dates + 1 weekly recurring)
- Cities: Barcelona + Ciudad de México (both represented — no mismatch)
- Sources used: dice.fm, resident-advisor
- Sources NOT used: Instagram, AudioDias, Alta Fidelitat, Les Enfants

What needs to be done:
1. Run `node scripts/curate-events.js refresh` to test if the 4 scrapers actually work
2. Fix any selector mismatches
3. Wire it into a cron or post-deploy hook so the calendar auto-refreshes
4. Verify the homepage calendar widget actually displays the events (it was rendering but with weekday names without a real card structure)

---

## TASK 3: DJ Hub Subnav UX — MINOR ISSUE

**Status: MOSTLY OK, ONE BROKEN ANCHOR**

Subnav items (6): Tienda, Blog, DJ Library, Neural, Herramientas, Equipo DJ

**BUG:** "Equipo DJ" links to `toolhub/#hardware` but the toolhub page has no element with `id="hardware"`. The hardware section is labeled "Equipo Recomendado" — anchor target is wrong, so the link is silently broken (no scroll happens).

**Suggested subnav restructure (UX improvement, not blocking):**
- Group: Library (Blog + DJ Library), Tools (Herramientas + Equipo DJ), Explore (Tienda + Neural)
- Or: collapse to icons on mobile

---

## TASK 4: DJ Library Static Performance ✅ WORKS

**Status: WORKS, but with a CRITICAL bug for direct access**

Implementation:
- `scripts/build-dj-profiles.js` generates 51 static HTML fragments in `data/djs/profiles/`
- 67 set JSONs in `data/djs/sets/`
- dj-library.html lazy-loads each fragment on first card expand (1 fetch per DJ, cacheable)
- YouTube iframes lazy-mount on play button click
- Pagination: 12 per page, "Cargar más DJs" button

Performance is solid. Static loading works exactly as designed.

**CRITICAL BUG: Direct URL access to profile fragments is broken**

If a user (or Google) visits `https://3tres6records.albto.me/data/djs/profiles/apollonia.html` directly:
- Page renders with UTF-8 mojibake everywhere (â–¶, ðŸ, â\x8f±ï¸\x8f) because the fragment has no `<meta charset="utf-8">`
- No site header, no nav, no music player, no footer
- Empty `<title>` (browser shows URL or "Untitled")
- No way to navigate back to the site

This is bad for:
- Google SEO (will index broken pages with no parent context)
- Link sharing (a user shares a profile URL → recipient gets a broken page)
- Bookmarks (same)

**Fix options:**

A) **Quick fix** — modify `build-dj-profiles.js` to prepend a tiny HTML wrapper to each fragment that:
- Has `<meta charset="utf-8">`
- Has a meta refresh redirect to `../dj-library.html#dj-apollonia`
- Has `<meta name="robots" content="noindex">`
- This keeps the static-loading speed benefit AND handles direct access gracefully

B) **Better fix** — generate FULL HTML pages instead of fragments:
- Each profile gets the full site chrome (header, music player, footer, DJ Hub subnav)
- Direct URL works, shareable, bookmarkable
- 1 file per DJ = 51 full pages (vs 51 fragments) — same number, just bigger
- `dj-library.html` no longer needs to load these via fetch — but you can still load them in an iframe or via partial include for the inline expand behavior

Recommended: **Option A** (5-minute fix in the build script). Option B is a bigger refactor.

---

## SUMMARY

| # | Task | Status | Action needed |
|---|------|--------|---------------|
| 1 | Music player | ✅ Works | None |
| 2 | Calendar script | ✅ Exists | Test `refresh` subcommand, wire into deploy hook |
| 3 | DJ Hub subnav | ⚠️ Minor | Fix `toolhub/#hardware` anchor |
| 4 | Static DJ profiles | ✅ Works | **Fix direct-access bug (Option A or B)** |

**Critical:** Task 4's direct-access bug should be fixed before any public launch or SEO campaign.
