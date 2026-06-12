#!/usr/bin/env node
/**
 * populate-calendar.js — One-shot calendar population for 3TRES6 Records
 *
 * Combines:
 *   1. Live scraping from Barcelona party sites (AudioDias, Alta Fidelitat, Les Enfants)
 *   2. A curated seed list of known recurring/resident events
 *   3. Manual Instagram additions (via ig-batch.json if present)
 *
 * All scraped/seed events land as `status: "pending"` so you can review before
 * publishing. The script never marks anything as `approved` automatically.
 *
 * Usage:
 *   node scripts/populate-calendar.js                  # run all (scrape + seed + manual)
 *   node scripts/populate-calendar.js --scrape-only    # skip the seed list
 *   node scripts/populate-calendar.js --seed-only      # skip live scrapers
 *   node scripts/populate-calendar.js --dry-run        # show what would be added
 *
 * Output:
 *   - data/events/events.json  (merged with new pending events, sorted)
 *   - data/events/pending.json (also receives new entries for review)
 *   - data/events/.tmp/last-run.json  (raw scrape output for debugging)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const ROOT = path.join(__dirname, '..');
const EVENTS_PATH = path.join(ROOT, 'data', 'events', 'events.json');
const PENDING_PATH = path.join(ROOT, 'data', 'events', 'pending.json');
const SEED_PATH = path.join(ROOT, 'data', 'events', 'seed-barcelona.json');
const IG_BATCH_PATH = path.join(ROOT, 'data', 'events', 'ig-batch.json');
const TMP_DIR = path.join(ROOT, 'data', 'events', '.tmp');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const FLAGS = {
  scrapeOnly: args.includes('--scrape-only'),
  seedOnly: args.includes('--seed-only'),
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('-v') || args.includes('--verbose'),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`);
}

function loadJson(p, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e) {
    if (FLAGS.verbose) console.warn(`  (could not read ${path.relative(ROOT, p)}: ${e.message})`);
    return fallback;
  }
}

function saveJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf-8');
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

function sortEvents(events) {
  return events.sort((a, b) => {
    if (a.recurring && !b.recurring) return 1;
    if (!a.recurring && b.recurring) return -1;
    return new Date(a.date) - new Date(b.date);
  });
}

function dedupeEvents(events) {
  const seen = new Map();
  const kept = [];
  for (const e of events) {
    const key = `${(e.title || '').toLowerCase()}|${e.date || ''}|${(e.venue || '').toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.set(key, e);
    kept.push(e);
  }
  return kept;
}

function fetchText(url, timeoutMs = 12000) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.get(u, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(new URL(res.headers.location, url).toString(), timeoutMs).then(resolve, () => resolve(null));
      }
      if (res.statusCode !== 200) {
        if (FLAGS.verbose) log('⚠️', `${url} → HTTP ${res.statusCode}`);
        return resolve(null);
      }
      let body = '';
      res.setEncoding('utf-8');
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve(body));
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
  });
}

// ---------------------------------------------------------------------------
// Scraper: extract JSON-LD structured event data (works on many modern sites)
// ---------------------------------------------------------------------------

function extractJsonLdEvents(html) {
  const events = [];
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        // Schema.org Event or MusicEvent
        if (item['@type'] === 'Event' || item['@type'] === 'MusicEvent') {
          const ev = jsonLdToEvent(item);
          if (ev) events.push(ev);
        }
        // graph shape
        if (item['@graph']) {
          for (const g of item['@graph']) {
            if (g['@type'] === 'Event' || g['@type'] === 'MusicEvent') {
              const ev = jsonLdToEvent(g);
              if (ev) events.push(ev);
            }
          }
        }
      }
    } catch (_) { /* ignore parse errors */ }
  }
  return events;
}

function jsonLdToEvent(item) {
  if (!item.name) return null;
  const start = item.startDate || item.start || item.date;
  if (!start) return null;
  // Normalize to YYYY-MM-DD
  let date = start;
  const d = new Date(start);
  if (!isNaN(d.getTime())) {
    date = d.toISOString().slice(0, 10);
  }
  const loc = item.location || {};
  const addr = loc.address || {};
  const performerNames = (item.performer || []).map((p) => p.name || p).filter(Boolean);
  return {
    id: 'jsonld-' + (item['@id'] || item.name).toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '-' + Date.now().toString(36).slice(-4),
    title: item.name,
    date,
    time: item.startDate ? new Date(item.startDate).toISOString().slice(11, 16) : undefined,
    venue: loc.name || 'TBA',
    city: addr.addressLocality || 'Barcelona',
    country: addr.addressCountry || 'ES',
    djs: performerNames,
    genres: [],
    price: item.offers?.price || 'TBA',
    url: item.url || '',
    source: 'jsonld',
    status: 'pending',
  };
}

// ---------------------------------------------------------------------------
// Scraper: heuristic regex parser (fallback for sites without JSON-LD)
// ---------------------------------------------------------------------------

function extractHeuristicEvents(html, venueName, city) {
  const events = [];
  // Try article/evento blocks
  const blockRegex = /<(article|div|section|li)[^>]*class=["'][^"']*(?:event|agenda|fiesta|party|sesion)[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  let idx = 0;
  while ((m = blockRegex.exec(html)) !== null && idx < 20) {
    const block = m[2];
    const title = (block.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim();
    if (!title || title.length < 3) continue;
    // Date patterns: 2026-06-15, 15/06/2026, 15 June 2026, June 15
    let date = null;
    const isoM = block.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
    const dmyM = block.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.]?(20\d{2})?\b/);
    if (isoM) {
      date = `${isoM[1]}-${isoM[2]}-${isoM[3]}`;
    } else if (dmyM) {
      const yr = dmyM[3] || new Date().getFullYear();
      date = `${yr}-${dmyM[2].padStart(2, '0')}-${dmyM[1].padStart(2, '0')}`;
    } else {
      // Try month name
      const monthM = block.match(/\b(\d{1,2})\s+(ene|jan|feb|mar|abr|apr|may|jun|jul|ago|aug|sep|oct|nov|dic|dec)[a-z]*\s+(20\d{2})?/i);
      if (monthM) {
        const mn = { ene:1,jan:1,feb:2,mar:3,abr:4,apr:4,may:5,jun:6,jul:7,ago:8,aug:8,sep:9,oct:10,nov:11,dic:12,dec:12 }[monthM[2].toLowerCase()];
        if (mn) {
          const yr = monthM[3] || new Date().getFullYear();
          date = `${yr}-${String(mn).padStart(2,'0')}-${monthM[1].padStart(2,'0')}`;
        }
      }
    }
    if (!date) continue;
    events.push({
      id: `heuristic-${venueName.toLowerCase().replace(/\s+/g,'')}-${idx++}-${Date.now().toString(36).slice(-4)}`,
      title,
      date,
      venue: venueName,
      city,
      country: 'ES',
      djs: [],
      genres: [],
      price: 'TBA',
      source: 'heuristic',
      status: 'pending',
    });
  }
  return events;
}

// ---------------------------------------------------------------------------
// Per-site scrapers
// ---------------------------------------------------------------------------

async function scrapeSite(siteKey, urls, venueName) {
  log('🌐', `Scraping ${siteKey} (${urls.length} URL${urls.length>1?'s':''})...`);
  const all = [];
  for (const url of urls) {
    const html = await fetchText(url);
    if (!html) continue;
    if (FLAGS.verbose) log('  ✓', `Fetched ${url} (${html.length} bytes)`);
    // Try JSON-LD first
    const ld = extractJsonLdEvents(html);
    if (ld.length) {
      if (FLAGS.verbose) log('  ✓', `Found ${ld.length} JSON-LD event(s)`);
      all.push(...ld);
      continue;
    }
    // Fall back to heuristic
    const h = extractHeuristicEvents(html, venueName, 'Barcelona');
    if (h.length && FLAGS.verbose) log('  ✓', `Found ${h.length} heuristic event(s)`);
    all.push(...h);
  }
  return all;
}

async function scrapeAudioDias() {
  return scrapeSite('AudioDias', [
    'https://www.audiodias.com/',
    'https://www.audiodias.com/agenda',
    'https://www.audiodias.com/events',
  ], 'AudioDias');
}

async function scrapeAltaFidelitat() {
  return scrapeSite('Alta Fidelitat Club', [
    'https://www.altafidelitatclub.com/',
    'https://www.altafidelitatclub.com/agenda',
    'https://www.altafidelitatclub.com/eventos',
  ], 'Alta Fidelitat Club');
}

async function scrapeLesEnfants() {
  return scrapeSite('Les Enfants', [
    'https://lesenfants.bcn/',
    'https://lesenfants.bcn/agenda',
    'https://lesenfants.bcn/events',
  ], 'Les Enfants');
}

async function scrapeInstagram() {
  log('📷', 'Instagram: manual workflow required (export to ig-batch.json)');
  return [];
}

// ---------------------------------------------------------------------------
// Merge & save
// ---------------------------------------------------------------------------

function mergeNewEvents(existing, incoming) {
  let added = 0;
  let skipped = 0;
  const errors = [];
  for (const e of incoming) {
    if (!e.id) e.id = nextId(e.title || 'event');
    if (!e.status) e.status = 'pending';
    const errs = validateEvent(e);
    if (errs.length) {
      errors.push({ title: e.title || '(no title)', errs });
      skipped++;
      continue;
    }
    const dup = existing.find((x) =>
      x.title?.toLowerCase() === e.title?.toLowerCase() &&
      x.date === e.date &&
      x.venue?.toLowerCase() === e.venue?.toLowerCase()
    );
    if (dup) {
      skipped++;
      continue;
    }
    existing.push(e);
    added++;
  }
  return { added, skipped, errors };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  log('🚀', '3TRES6 Calendar Populator');
  log('📅', `Today: ${new Date().toISOString().slice(0, 10)}`);
  if (FLAGS.dryRun) log('🧪', 'DRY RUN — no files will be modified');

  const events = loadJson(EVENTS_PATH, []);
  log('📊', `Existing events.json: ${events.length} events`);

  const incoming = [];
  const scrapeRaw = {};

  // 1. Live scraping
  if (!FLAGS.seedOnly) {
    log('', '');
    log('═══ LIVE SCRAPERS ═══', '');
    const scrapers = [
      ['audiodias', scrapeAudioDias],
      ['altafidelitat', scrapeAltaFidelitat],
      ['lesenfants', scrapeLesEnfants],
      ['instagram', scrapeInstagram],
    ];
    for (const [key, fn] of scrapers) {
      try {
        const found = await fn();
        scrapeRaw[key] = found;
        incoming.push(...found);
        log('  →', `${key}: ${found.length} event(s)`);
      } catch (e) {
        log('  ✗', `${key}: ${e.message}`);
        scrapeRaw[key] = [];
      }
    }
    saveJson(path.join(TMP_DIR, 'last-run-scrape.json'), scrapeRaw);
  }

  // 2. Seed file
  if (!FLAGS.scrapeOnly) {
    log('', '');
    log('═══ SEED DATA ═══', '');
    const seed = loadJson(SEED_PATH, []);
    if (seed.length) {
      incoming.push(...seed);
      log('  →', `Loaded ${seed.length} curated event(s) from seed-barcelona.json`);
    } else {
      log('  →', 'No seed file (or empty) — skipping');
    }
  }

  // 3. Manual Instagram batch
  if (!FLAGS.scrapeOnly) {
    const ig = loadJson(IG_BATCH_PATH, []);
    if (ig.length) {
      incoming.push(...ig);
      log('  →', `Loaded ${ig.length} manual IG event(s) from ig-batch.json`);
    }
  }

  log('', '');
  log('═══ MERGE ═══', '');
  log('📦', `${incoming.length} candidate event(s) to merge`);

  const { added, skipped, errors } = mergeNewEvents(events, incoming);
  log('✅', `Added: ${added}`);
  log('⏭️ ', `Skipped (duplicate/invalid): ${skipped}`);
  if (errors.length) {
    log('❌', `Validation errors: ${errors.length}`);
    errors.forEach(e => log('   ', `  ${e.title}: ${e.errs.join(', ')}`));
  }

  if (added === 0) {
    log('', '');
    log('✨', 'No new events to add. Done.');
    return;
  }

  if (FLAGS.dryRun) {
    log('', '');
    log('🧪', 'DRY RUN — would add the following events:');
    events.slice(-added).forEach((e) => {
      log('  +', `${e.date} | ${e.title} @ ${e.venue}, ${e.city} [${e.source}]`);
    });
    return;
  }

  // Save
  const sorted = sortEvents(dedupeEvents(events));
  saveJson(EVENTS_PATH, sorted);
  log('💾', `Saved ${sorted.length} events to data/events/events.json`);

  // Also append to pending.json
  const pending = loadJson(PENDING_PATH, []);
  const newPending = sorted.slice(-added);
  pending.push(...newPending);
  saveJson(PENDING_PATH, pending);
  log('📋', `Appended ${newPending.length} to data/events/pending.json for review`);

  log('', '');
  log('🎉', `Done! Review pending events:`);
  log('   ', `node scripts/curate-events.js list`);
  log('   ', `node scripts/curate-events.js approve <id>`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
