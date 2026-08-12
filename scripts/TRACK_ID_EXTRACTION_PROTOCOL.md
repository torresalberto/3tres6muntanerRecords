# TRACK ID Extraction Protocol — 3TRES6 DJ Library

Canonical procedure for **any AI agent** asked to extract the track IDs of a DJ set
for the DJ Library (site data: `data/djs/sets/*.json`). Follow top-to-bottom. The
companion runner is `scripts/extract-tracklists-v2.py`.

> **Chain of process (the thinking):** this protocol encodes the full reasoning
> chain used to capture the Chaos In The CBD @ Djoon set (23/23) and the
> Etapp Kyle Early 2000s Archive set (16/16). Read the "Pitfalls" section — those
> are the exact mistakes that caused missed track IDs before.

---

## 0. Classify the video (is it a DJ set?)

Before extracting, confirm the target is a DJ set worth adding:

- Title contains a DJ name + venue/event/stream (`"Etapp Kyle - Early 2000s Archive"`).
- Duration ≥ ~45 min (`1:08:03`). Channel is Boiler Room / RA / HÖR / The Lot / Make It Deep / label podcast, etc.
- If it's a single track video → stop, not a set.

Quick check:

```bash
yt-dlp --skip-download --no-playlist --print "%(title)s | %(channel)s | %(duration_string)s" "<url>"
```

---

## 1. Fetch the full payload (comments + description + metadata)

```bash
python3 scripts/extract-tracklists-v2.py "<youtube_url>" "<prefix>"
```

- Downloads `yt-dlp --write-comments --skip-download` → `tmp/sets/<prefix>.info.json` (cached; `--force` to refresh).
- The `info.json` **already contains** `description`, `duration`, `uploader`, `view_count`, `upload_date` — the script reads them all. **Never assume the description is empty without checking it** (many channels ship the full tracklist there).
- Fresh videos grow comments fast: for a set with no tracklist yet, **re-run in ~2 weeks** (the Etapp set went 0 → 16 tracks in a few days).

---

## 2. Extraction layers (what the script scans)

| Layer | Format                       | Example                                                             | Confidence                      |
| ----- | ---------------------------- | ------------------------------------------------------------------- | ------------------------------- |
| A     | Timestamped lines            | `0:00 Kai Alce - Take A Chance (Larry Heard Remix Instrumental #1)` | high                            |
| B     | **Numbered lists**           | `1. Kelela - Washed Away - Warp Records`                            | high                            |
| C     | ID requests                  | `track id at 1:05:35 ?`                                             | medium (→ `most_requested_ids`) |
| D     | Timestamp mentions           | `1:13:00 pleeease`                                                  | low                             |
| E     | Video description + chapters | timestamped or numbered list in `description`                       | high                            |

**Signal boosts:** pinned comments and comments authored by the **channel owner** (the
DJ) are authoritative — the script flags them `⭐` and scores them higher.

---

## 3. Interpret the results

The script prints and saves:

- `tmp/sets/<prefix>_extracted.json` — full report (all candidates, source-tagged).
- `tmp/sets/<prefix>_set-scaffold.json` — a draft set file in the site schema.

Read the printed table. Then:

1. **Trust the ⭐ (DJ/owner) list** over crowd comments. If the DJ pinned a numbered
   list, that is the definitive tracklist (Etapp Kyle case).
2. **Ambiguity resolution** (one slot, two candidates — e.g. the Djoon case:
   `25:20 DJ Kaos - Religious // or The Vision - Sharde`): prefer the answer
   corroborated by another commenter (`"25:20 is The Vision - Shardé. Unforgettable 1991 classic."`)
   and by Discogs/1001tracklists. Keep the runner-up in the track's `notes`, never guess.
3. **ID requests = unsolved slots** → keep in `most_requested_ids` with sample
   comments + request counts. These are the tracks fans want — mark them, don't drop them.
4. **Incomplete sets are OK.** Set `tracks_identified`/`tracks_total` honestly and
   add a `recheck_after` date (the script does this automatically when incomplete).

---

## 4. Cross-check external sources (when gaps remain or to confirm)

Only after the comments/description pass. Priority order:

1. **1001tracklists.com** — search `"<dj> <event>" tracklist` (well-formatted, crowd-verified).
2. **MixesDB.com** — community tracklist database.
3. **Discogs** — confirm artist/title/label against real releases (also feeds the site's track registry).
4. **agent-reach** — search X/Twitter and Reddit for `"<dj> <event>" tracklist ID` threads.
5. **Auto-captions transcript** — `yt-dlp --write-auto-subs --sub-langs en --skip-download` then scan the VTT. Rarely useful for track names (DJs don't announce titles) but free and worth a check.

---

## 5. Ship to the site

1. Review the scaffold, fix artist/title splits (esp. hyphenated names), add `dj_id`, `venue`, `date`, `genres`.
2. Apply + rebuild:
   ```bash
   python3 scripts/extract-tracklists-v2.py "<url>" "<prefix>" --dj <dj-id> --venue <venue> --date <date> --apply
   node scripts/build-dj-data.js   # (--apply already runs this)
   ```
3. Format + verify:
   ```bash
   npx prettier --check data/djs/sets/<prefix>.json
   node -e 'const T=require("vm").runInContext(require("fs").readFileSync("data/tracklists/tracklists.js","utf8")+"; TRACKLISTS",require("vm").createContext({})); console.log(T["<dj-id>"].sets.map(s=>s.id+" "+s.tracks_identified+"/"+s.tracks_total).join("\n"));'
   ```
4. Commit + push (the deploy workflow rebuilds data and deploys to GitHub Pages + shared hosting).

---

## Pitfalls (the mistakes that cost us IDs — learn these)

| #   | Pitfall                                        | What happened                                                                                                                                 | Rule                                                                          |
| --- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | **Timestamp-only regex**                       | The Djoon README marked rows 8-23 "ID requested" even though the **full 23-track list sat in the 144-like pinned comment**.                   | Always read pinned + top-liked comments fully.                                |
| 2   | **Numbered lists have no "tracklist" keyword** | The Etapp DJ comment _"YouTube has recognised most of the tracks already but here it is: 1. Kelela - ..."_ was invisible to a keyword filter. | Layer B exists _because_ of this.                                             |
| 3   | **Keyword filters miss phrasing**              | "here it is:" has no `tracklist`/`id`/`timestamp` words.                                                                                      | Scan every comment's text for `Artist - Title` structure, not just keywords.  |
| 4   | **Hyphenated artist names**                    | `M-Gee`, `R-One By Julien Creance` broke the `[^-]` artist class (14/16 caught).                                                              | Split on `" - "` (space-hyphen-space), which keeps intra-word hyphens intact. |
| 5   | **Comment counts grow**                        | Etapp had 66 comments day 0; the DJ posted the list days later.                                                                               | Incomplete → set `recheck_after`, re-run later.                               |
| 6   | **Owner vs handle mismatch**                   | `@etappkyle` ≠ `Etapp Kyle` on a naive string compare.                                                                                        | Normalize to alphanumerics for the owner test.                                |
| 7   | **Descriptions ignored**                       | yt-dlp already returns `description`; the old parser never read it.                                                                           | Layer E exists.                                                               |
| 8   | **Strict line formats only**                   | Real lists use `01.`, `Artist – Title`, `(timestamp)`, replies.                                                                               | Loose parsing + LLM normalization for the leftovers.                          |

---

## Agent checklist (copy-paste)

```
[ ] Classify: DJ set? (title/channel/duration)
[ ] Fetch: python3 scripts/extract-tracklists-v2.py "<url>" "<prefix>"
[ ] Read the ⭐ owner/pinned list first — it's authoritative
[ ] Resolve ambiguous slots (2+ candidates) via comments + 1001tracklists/Discogs; note runner-ups
[ ] Keep ID-request slots in most_requested_ids (don't drop)
[ ] Incomplete? ensure recheck_after is set; plan a re-run in ~2 weeks
[ ] Review scaffold; fix hyphenated artist splits
[ ] Ship: re-run with --apply --dj --venue --date; prettier; verify counts; commit + push
```
