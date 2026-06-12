#!/usr/bin/env node
/**
 * curate-events.js — Manages data/events/events.json for the 3TRES6 calendar
 *
 * Usage:
 *   node scripts/curate-events.js list                    # show all events
 *   node scripts/curate-events.js add <file.json>         # add event(s) from JSON file
 *   node scripts/curate-events.js remove <id>             # remove by id
 *   node scripts/curate-events.js approve <id>            # change status pending -> approved
 *   node scripts/curate-events.js refresh                 # pull from scraper sources (stubs)
 *   node scripts/curate-events.js validate                # validate events.json structure
 *   node scripts/curate-events.js dedupe                  # remove duplicate events
 *   node scripts/curate-events.js export-pending          # dump localStorage-style pending events
 *
 * Source scrapers (scripts/curate-events.js refresh):
 *   - Instagram: @3tresrecords (manual paste for now; IG API requires business account)
 *   - AudioDias: https://www.audiodias.com/  (live HTML scrape; selectors in scrapeAudioDias)
 *   - Alta Fidelitat Club: https://www.altafidelitatclub.com/  (live HTML scrape)
 *   - Les Enfants: https://lesenfants.bcn/  (live HTML scrape)
 *
 * Each scraper returns [] on failure (network/selector mismatch) so refresh is safe to run.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const EVENTS_PATH = path.join(__dirname, '..', 'data', 'events', 'events.json');
const PENDING_PATH = path.join(__dirname, '..', 'data', 'events', 'pending.json');
const TMP_DIR = path.join(__dirname, '.tmp');

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function loadEvents() {
  try {
    return JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf-8'));
  } catch (e) {
    console.error(`Cannot read ${EVENTS_PATH}: ${e.message}`);
    process.exit(1);
  }
}

function saveEvents(events) {
  // Sort: recurring last, then by date
  events.sort((a, b) => {
    if (a.recurring && !b.recurring) return 1;
    if (!a.recurring && b.recurring) return -1;
    return new Date(a.date) - new Date(b.date);
  });
  fs.writeFileSync(EVENTS_PATH, JSON.stringify(events, null, 2) + '\n', 'utf-8');
  console.log(`Wrote ${events.length} events to ${path.relative(process.cwd(), EVENTS_PATH)}`);
}

function loadPending() {
  try {
    return JSON.parse(fs.readFileSync(PENDING_PATH, 'utf-8'));
  } catch (_) {
    return [];
  }
}

function savePending(pending) {
  fs.writeFileSync(PENDING_PATH, JSON.stringify(pending, null, 2) + '\n', 'utf-8');
}

function nextId(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) + '-' + Date.now().toString(36).slice(-4);
}

function validateEvent(e) {
  const errors = [];
  if (!e.title) errors.push('missing title');
  // Recurring events use recurringDays instead of date
  if (!e.recurring && !e.date) errors.push('missing date (or set recurring:true + recurringDays)');
  if (e.recurring && (!Array.isArray(e.recurringDays) || e.recurringDays.length === 0)) {
    errors.push('recurring event must have recurringDays[]');
  }
  if (e.date && e.date !== 'weekly' && !/^\d{4}-\d{2}-\d{2}/.test(e.date)) {
    errors.push(`date should be YYYY-MM-DD or "weekly", got: ${e.date}`);
  }
  if (!e.venue) errors.push('missing venue');
  if (!e.city) errors.push('missing city');
  if (!Array.isArray(e.djs)) errors.push('djs must be an array');
  if (!Array.isArray(e.genres)) errors.push('genres must be an array');
  if (!e.status) errors.push('missing status (approved|pending)');
  return errors;
}

function fetchText(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.get(u, { headers: { 'User-Agent': '3TRES6-Curator/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow one redirect
        return fetchText(new URL(res.headers.location, url).toString(), timeoutMs).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let body = '';
      res.setEncoding('utf-8');
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve(body));
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

// ----------------------------------------------------------------------------
// Commands
// ----------------------------------------------------------------------------

function cmdList() {
  const events = loadEvents();
  console.log(`\n${events.length} events in ${path.relative(process.cwd(), EVENTS_PATH)}:\n`);
  events.forEach((e, i) => {
    const dateStr = e.recurring ? `[WEEKLY] ${e.recurringDays?.join(',') || ''}` : e.date;
    const status = `[${e.status?.toUpperCase() || 'NO-STATUS'}]`;
    console.log(`  ${String(i + 1).padStart(3, ' ')}. ${status.padEnd(11)} ${dateStr.padEnd(12)} ${e.title}`);
    console.log(`       @ ${e.venue}, ${e.city}  |  ${(e.djs || []).join(', ')}`);
  });
  const pending = loadPending();
  if (pending.length) {
    console.log(`\n${pending.length} pending submissions (data/events/pending.json):`);
    pending.forEach((e) => console.log(`  - [PENDING] ${e.date} ${e.title} @ ${e.venue}`));
  }
  console.log('');
}

function cmdAdd(jsonPath) {
  if (!jsonPath) {
    console.error('Usage: curate-events.js add <file.json>  (file contains one event or an array)');
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const incoming = Array.isArray(raw) ? raw : [raw];
  const events = loadEvents();
  let added = 0;
  for (const e of incoming) {
    if (!e.id) e.id = nextId(e.title || 'event');
    if (!e.status) e.status = 'pending';
    const errs = validateEvent(e);
    if (errs.length) {
      console.warn(`  SKIP ${e.title || '(no title)'}: ${errs.join(', ')}`);
      continue;
    }
    // Dedupe: same (title, date, venue) is a duplicate
    const dup = events.find((x) => x.title === e.title && x.date === e.date && x.venue === e.venue);
    if (dup) {
      console.warn(`  SKIP ${e.title} (${e.date}): duplicate of existing event "${dup.id}"`);
      continue;
    }
    events.push(e);
    added++;
  }
  saveEvents(events);
  console.log(`Added ${added}/${incoming.length} event(s).`);
}

function cmdRemove(id) {
  if (!id) {
    console.error('Usage: curate-events.js remove <id>');
    process.exit(1);
  }
  const events = loadEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) {
    console.error(`No event with id "${id}". Run \`list\` to see IDs.`);
    process.exit(1);
  }
  const removed = events.splice(idx, 1)[0];
  saveEvents(events);
  console.log(`Removed: ${removed.title} (${removed.date})`);
}

function cmdApprove(id) {
  if (!id) {
    console.error('Usage: curate-events.js approve <id>');
    process.exit(1);
  }
  const events = loadEvents();
  const e = events.find((x) => x.id === id);
  if (!e) {
    console.error(`No event with id "${id}".`);
    process.exit(1);
  }
  e.status = 'approved';
  saveEvents(events);
  console.log(`Approved: ${e.title} (${e.date})`);
}

function cmdValidate() {
  const events = loadEvents();
  let bad = 0;
  events.forEach((e) => {
    const errs = validateEvent(e);
    if (errs.length) {
      bad++;
      console.warn(`  INVALID ${e.id || e.title}: ${errs.join(', ')}`);
    }
  });
  console.log(`${events.length - bad}/${events.length} events valid.`);
  if (bad) process.exit(1);
}

function cmdDedupe() {
  const events = loadEvents();
  const seen = new Map();
  const kept = [];
  let removed = 0;
  for (const e of events) {
    const key = `${e.title}|${e.date}|${e.venue}`;
    if (seen.has(key)) {
      removed++;
      console.log(`  Drop duplicate: ${e.title} (${e.date}) @ ${e.venue}`);
      continue;
    }
    seen.set(key, e);
    kept.push(e);
  }
  saveEvents(kept);
  console.log(`Removed ${removed} duplicate(s). ${kept.length} events remain.`);
}

// ----------------------------------------------------------------------------
// Scraper stubs
// Each returns a Promise<Event[]>. Always resolves to [] on failure.
// ----------------------------------------------------------------------------

async function scrapeAudioDias() {
  try {
    const html = await fetchText('https://www.audiodias.com/');
    // Selectors will need updating when site changes. Keep tolerant.
    const eventBlocks = html.match(/<article[\s\S]*?<\/article>/gi) || [];
    return eventBlocks.slice(0, 10).map((block, i) => ({
      id: `audiodias-${i}-${Date.now().toString(36)}`,
      title: (block.match(/<h[23][^>]*>(.*?)<\/h[23]>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim() || 'AudioDias Event',
      date: 'TBA',
      venue: 'AudioDias',
      city: 'Barcelona',
      country: 'ES',
      djs: [],
      genres: ['House'],
      price: 'TBA',
      url: 'https://www.audiodias.com/',
      source: 'audiodias',
      status: 'pending',
    }));
  } catch (e) {
    console.warn(`  [AudioDias] skipped: ${e.message}`);
    return [];
  }
}

async function scrapeAltaFidelitat() {
  try {
    const html = await fetchText('https://www.altafidelitatclub.com/');
    const eventBlocks = html.match(/<div[^>]*class="[^"]*event[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi) || [];
    return eventBlocks.slice(0, 10).map((block, i) => ({
      id: `altafidelitat-${i}-${Date.now().toString(36)}`,
      title: (block.match(/<h[23][^>]*>(.*?)<\/h[23]>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim() || 'Alta Fidelitat Event',
      date: 'TBA',
      venue: 'Alta Fidelitat Club',
      city: 'Barcelona',
      country: 'ES',
      djs: [],
      genres: ['House', 'Techno'],
      price: 'TBA',
      url: 'https://www.altafidelitatclub.com/',
      source: 'altafidelitat',
      status: 'pending',
    }));
  } catch (e) {
    console.warn(`  [Alta Fidelitat] skipped: ${e.message}`);
    return [];
  }
}

async function scrapeLesEnfants() {
  try {
    const html = await fetchText('https://lesenfants.bcn/');
    const eventBlocks = html.match(/<div[^>]*class="[^"]*evento[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi) || [];
    return eventBlocks.slice(0, 10).map((block, i) => ({
      id: `lesenfants-${i}-${Date.now().toString(36)}`,
      title: (block.match(/<h[23][^>]*>(.*?)<\/h[23]>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim() || 'Les Enfants Event',
      date: 'TBA',
      venue: 'Les Enfants',
      city: 'Barcelona',
      country: 'ES',
      djs: [],
      genres: ['Techno', 'House'],
      price: 'TBA',
      url: 'https://lesenfants.bcn/',
      source: 'lesenfants',
      status: 'pending',
    }));
  } catch (e) {
    console.warn(`  [Les Enfants] skipped: ${e.message}`);
    return [];
  }
}

async function scrapeInstagram() {
  // Instagram requires auth. Manual workflow:
  //   1. Open @3tresrecords, copy event posts
  //   2. Run: node scripts/curate-events.js add ig-batch.json
  console.warn('  [Instagram] Manual: export posts to JSON and run `add <file>`');
  return [];
}

async function cmdRefresh() {
  console.log('Pulling from sources...\n');
  const sources = [scrapeAudioDias, scrapeAltaFidelitat, scrapeLesEnfants, scrapeInstagram];
  const allNew = [];
  for (const src of sources) {
    try {
      const events = await src();
      allNew.push(...events);
      console.log(`  ${src.name}: ${events.length} new`);
    } catch (e) {
      console.warn(`  ${src.name}: error: ${e.message}`);
    }
  }

  if (allNew.length === 0) {
    console.log('\nNo new events from scrapers. (All sources returned 0 — site structures may have changed, or you need to seed manually.)');
    return;
  }

  const events = loadEvents();
  let added = 0;
  for (const e of allNew) {
    const dup = events.find((x) => x.title === e.title && x.date === e.date && x.venue === e.venue);
    if (dup) continue;
    if (!e.id) e.id = nextId(e.title);
    if (!e.status) e.status = 'pending';
    const errs = validateEvent(e);
    if (errs.length) {
      console.warn(`  SKIP ${e.title}: ${errs.join(', ')}`);
      continue;
    }
    events.push(e);
    added++;
  }
  saveEvents(events);
  console.log(`\nRefresh complete: ${added} new event(s) added as "pending". Run \`approve <id>\` to publish.`);
}

function cmdExportPending() {
  const pending = loadPending();
  if (!pending.length) {
    console.log('No pending events.');
    return;
  }
  const out = path.join(TMP_DIR, 'pending-export.json');
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(pending, null, 2));
  console.log(`Wrote ${pending.length} pending events to ${out}`);
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

function main() {
  const [cmd, ...args] = process.argv.slice(2);
  switch (cmd) {
    case 'list':         return cmdList();
    case 'add':          return cmdAdd(args[0]);
    case 'remove':       return cmdRemove(args[0]);
    case 'approve':      return cmdApprove(args[0]);
    case 'validate':     return cmdValidate();
    case 'dedupe':       return cmdDedupe();
    case 'refresh':      return cmdRefresh();
    case 'export-pending': return cmdExportPending();
    default:
      console.log(`Usage: node scripts/curate-events.js <command> [args]

Commands:
  list                    List all events
  add <file.json>         Add event(s) from JSON file (single object or array)
  remove <id>             Remove event by id
  approve <id>            Change status pending -> approved
  validate                Validate all events
  dedupe                  Remove duplicate events
  refresh                 Pull from scrapers (AudioDias, Alta Fidelitat, Les Enfants, IG)
  export-pending          Dump pending.json to scripts/.tmp/`);
  }
}

main();
