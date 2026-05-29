/**
 * DJ Data Compiler
 * 
 * Usage: node scripts/build-dj-data.js
 * 
 * Reads individual set JSON files from data/djs/sets/
 * and generates compiled outputs for the 3D Brain and DJ Library.
 * 
 * Generated files:
 *   - data/tracklists/tracklists.js     (inline load for 3D Brain)
 *   - data/djs/cross-references.json    (shared tracks, artists, venues, labels)
 *   - data/djs/tracks/track-registry.json (track → DJ mappings for graph)
 *   - data/djs/index.json               (auto-synced stats and set lists)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SETS_DIR = path.join(ROOT, 'data', 'djs', 'sets');
const OUT_DIR = path.join(ROOT, 'data');

// Known aliases for filename → DJ ID mapping
const ALIASES = {
  'blessed': 'blessed-madonna',
  'mallgrab': 'mall-grab',
  'chaos': 'chaos-in-the-cbd',
  'peggy': 'peggy-gou',
  'hunee': 'hunee',
  'maw': 'masters-at-work',
  'mcde': 'motor-city-drum-ensemble',
};

// Venue/event suffixes to strip for DJ ID extraction
const VENUE_PATTERNS = [
  '-br-', '-cercle-', '-dekmantel-', '-ibiza-', '-session-', '-mix-',
  '-weather-', '-rbma-', '-various-', '-dj-mag-', '-complex-', '-bbc-',
  '-lost-', '-polaris-', '-yuma-', '-ballantines-', '-glitch-', '-nyc-',
  '-paris-', '-lyon-', '-berlin-', '-london-', '-moscow-', '-mexico-',
  '-chicago-', '-bogota-', '-geneva-', '-lille-', '-melbourne-', '-sugar-',
  '-fly-', '-edinburgh-', '-verbier-', '-coachella-', '-ade-', '-epizode-',
  '-lot-', '-5hr-', '-136-', '-305-', '-2022-', '-2023-', '-2024-', '-2025-',
  '-2010-', '-2012-', '-2013-', '-2014-', '-2015-', '-2017-', '-2019-',
  '-2020-', '-074-', '-ten-', '-2021-', '-2016-', '-2018-', '-2011-',
  '-2009-', '-2008-'
];

function resolveDJId(fileId, knownDJs) {
  // Direct match against known set IDs
  for (const dj of knownDJs) {
    if ((dj.sets || []).includes(fileId)) return dj.id;
  }

  // Try exact prefix match against DJ IDs
  for (const dj of knownDJs) {
    if (fileId === dj.id || fileId.startsWith(dj.id + '-')) return dj.id;
  }

  // Try aliases
  const aliasBase = Object.keys(ALIASES).find(a => fileId === a || fileId.startsWith(a + '-'));
  if (aliasBase) return ALIASES[aliasBase];

  // Try stripping venue patterns to extract DJ ID
  let stripped = fileId;
  for (const pat of VENUE_PATTERNS) {
    const idx = stripped.indexOf(pat);
    if (idx > 0) {
      stripped = stripped.slice(0, idx);
      break;
    }
  }

  // Check if stripped matches a known DJ ID
  for (const dj of knownDJs) {
    if (stripped === dj.id) return dj.id;
  }

  // Fallback: use stripped as new DJ ID
  return stripped;
}

function normalizeArtist(artist) {
  if (!artist) return '';
  return artist
    .replace(/\s+(ft\.?|feat\.?|featuring|&|and|pres\.?|presenting|vs\.?|x\s)\s+.*/i, '')
    .replace(/\s*\(.*\)\s*/g, '')
    .trim()
    .toLowerCase();
}

function normalizeTrackKey(artist, title) {
  if (!artist || !title) return '';
  const a = artist.toLowerCase().replace(/\s+/g, ' ').trim();
  const t = title.toLowerCase().replace(/\s+/g, ' ').trim();
  return `${a} — ${t}`;
}

function isValidTrack(artist, title) {
  if (!artist || !title) return false;
  const a = artist.toLowerCase().trim();
  const t = title.toLowerCase().trim();
  const invalidArtists = ['id', '?', 'unknown', 'unreleased', 'unreleased id', 'id unreleased', 'unidentified', ' unreleased'];
  const invalidTitles = ['id', '?', 'unknown', 'unreleased', 'unreleased id', 'id unreleased', 'unidentified', ' unreleased', 'unreleased ', 'id remix'];
  if (invalidArtists.includes(a)) return false;
  if (invalidTitles.includes(t)) return false;
  return true;
}

function toTitleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function loadSets() {
  const files = fs.readdirSync(SETS_DIR).filter(f => f.endsWith('.json'));
  const sets = {};
  for (const file of files) {
    const fileId = file.replace('.json', '');
    try {
      const data = JSON.parse(fs.readFileSync(path.join(SETS_DIR, file), 'utf-8'));
      sets[fileId] = data;
    } catch (e) {
      console.warn(`  ⚠️  Skipping invalid JSON: ${file}`);
    }
  }
  return sets;
}

function buildTracklistsOutput(djsById, djSets) {
  const tracklists = {};

  for (const [djId, dj] of Object.entries(djsById)) {
    const sets = djSets[djId] || [];
    if (sets.length === 0) continue;

    tracklists[djId] = {
      artist: dj.name || toTitleCase(djId.replace(/-/g, ' ')),
      artist_id: djId,
      sets: sets.map(set => ({
        id: set.id,
        title: set.title || set.id,
        venue: set.venue || '',
        date: set.date || '',
        duration: set.duration || '',
        youtube: set.youtube_embed_id || '',
        views: set.view_count || 0,
        genre: set.genre || [],
        tracks_identified: set.tracks_identified || (set.tracklist || []).length,
        tracks_total: set.tracks_total || (set.tracklist || []).length,
        source: set.source || 'Compiled from DJ Library',
        tracklist: (set.tracklist || []).map(t => ({
          time: t.time || '',
          artist: t.artist || '',
          title: t.title || '',
          label: t.label || undefined,
          note: t.note || undefined
        }))
      }))
    };
  }

  return tracklists;
}

function buildCrossReferences(djsById, djSets) {
  const trackIndex = {}; // normalized key → [{djId, setId, setTitle, time, label}]
  const artistIndex = {}; // normalized artist → [{djId, track, setId}]
  const venueIndex = {}; // venue → {djs: Set, sets: []}
  const labelIndex = {}; // label → {djs: Set, tracks: []}
  const genreIndex = {}; // genre → {djs: Set}

  for (const [djId, sets] of Object.entries(djSets)) {
    for (const set of sets) {
      // Genre index
      for (const g of (set.genre || [])) {
        if (!genreIndex[g]) genreIndex[g] = { djs: new Set(), sets: [] };
        genreIndex[g].djs.add(djId);
        genreIndex[g].sets.push(set.id);
      }

      // Venue index
      if (set.venue) {
        if (!venueIndex[set.venue]) venueIndex[set.venue] = { djs: new Set(), sets: [] };
        venueIndex[set.venue].djs.add(djId);
        venueIndex[set.venue].sets.push(set.id);
      }

      for (const track of (set.tracklist || [])) {
        const valid = isValidTrack(track.artist, track.title);

        const trackKey = normalizeTrackKey(track.artist, track.title);
        if (trackKey && valid) {
          if (!trackIndex[trackKey]) trackIndex[trackKey] = [];
          trackIndex[trackKey].push({
            djId,
            setId: set.id,
            setTitle: set.title,
            time: track.time,
            label: track.label
          });
        }

        const normArtist = normalizeArtist(track.artist);
        if (normArtist && valid) {
          if (!artistIndex[normArtist]) artistIndex[normArtist] = [];
          artistIndex[normArtist].push({
            djId,
            track: track.title,
            setId: set.id
          });
        }

        if (track.label && valid) {
          if (!labelIndex[track.label]) labelIndex[track.label] = { djs: new Set(), tracks: [] };
          labelIndex[track.label].djs.add(djId);
          labelIndex[track.label].tracks.push({
            artist: track.artist,
            title: track.title,
            djId,
            setId: set.id
          });
        }
      }
    }
  }

  // Shared tracks (2+ DJs)
  const sharedTracks = [];
  for (const [key, plays] of Object.entries(trackIndex)) {
    const uniqueDJs = [...new Set(plays.map(p => p.djId))];
    if (uniqueDJs.length >= 2) {
      const displayTrack = key.replace(/\s*—\s*/g, ' - ');
      // Deduplicate sets per DJ
      const seen = new Set();
      const sets = [];
      for (const p of plays) {
        const setKey = p.djId + '::' + p.setId;
        if (!seen.has(setKey)) {
          seen.add(setKey);
          sets.push({ id: p.setId, title: p.setTitle, artist: p.djId });
        }
      }
      sharedTracks.push({ track: displayTrack, djs: uniqueDJs, sets });
    }
  }

  // Shared artists (2+ DJs, different tracks)
  const sharedArtists = [];
  for (const [artist, plays] of Object.entries(artistIndex)) {
    const uniqueDJs = [...new Set(plays.map(p => p.djId))];
    if (uniqueDJs.length >= 2) {
      const tracks = [...new Set(plays.map(p => p.track))];
      const sets = [...new Set(plays.map(p => p.setId))];
      sharedArtists.push({ artist: toTitleCase(artist), djs: uniqueDJs, tracks, sets });
    }
  }

  // Venue networks (2+ DJs)
  const venueNetworks = {};
  for (const [venue, data] of Object.entries(venueIndex)) {
    if (data.djs.size >= 2) {
      venueNetworks[venue] = {
        djs: [...data.djs],
        sets: data.sets
      };
    }
  }

  // Label affinity (2+ DJs)
  const labelAffinity = {};
  for (const [label, data] of Object.entries(labelIndex)) {
    if (data.djs.size >= 2) {
      labelAffinity[label] = {
        djs: [...data.djs],
        tracks: data.tracks
      };
    }
  }

  // Genre bridges (2+ DJs)
  const genreBridges = {};
  for (const [genre, data] of Object.entries(genreIndex)) {
    if (data.djs.size >= 2) {
      genreBridges[genre] = {
        djs: [...data.djs],
        sets: data.sets
      };
    }
  }

  // Super connectors (DJs with most cross-connections)
  const connectionCounts = {};
  for (const st of sharedTracks) {
    for (const dj of st.djs) {
      if (!connectionCounts[dj]) connectionCounts[dj] = { count: 0, shared_with: new Set() };
      connectionCounts[dj].count++;
      for (const other of st.djs) {
        if (other !== dj) connectionCounts[dj].shared_with.add(other);
      }
    }
  }
  for (const sa of sharedArtists) {
    for (const dj of sa.djs) {
      if (!connectionCounts[dj]) connectionCounts[dj] = { count: 0, shared_with: new Set() };
      connectionCounts[dj].count++;
      for (const other of sa.djs) {
        if (other !== dj) connectionCounts[dj].shared_with.add(other);
      }
    }
  }

  const superConnectors = Object.entries(connectionCounts)
    .map(([djId, data]) => ({
      dj_id: djId,
      name: djsById[djId]?.name || toTitleCase(djId.replace(/-/g, ' ')),
      connection_count: data.count,
      shared_with: [...data.shared_with]
    }))
    .sort((a, b) => b.connection_count - a.connection_count);

  return {
    shared_tracks: sharedTracks.sort((a, b) => b.djs.length - a.djs.length),
    shared_artists: sharedArtists.sort((a, b) => b.djs.length - a.djs.length),
    venue_networks: venueNetworks,
    label_affinity: labelAffinity,
    genre_bridges: genreBridges,
    super_connectors: superConnectors,
    total_shared_tracks: sharedTracks.length,
    total_shared_artists: sharedArtists.length,
    total_connections: sharedTracks.length + sharedArtists.length,
    generated_at: new Date().toISOString()
  };
}

function buildTrackRegistry(djSets) {
  const tracks = {};
  let trackCounter = 0;

  for (const [djId, sets] of Object.entries(djSets)) {
    for (const set of sets) {
      for (const track of (set.tracklist || [])) {
        if (!isValidTrack(track.artist, track.title)) continue;
        const key = normalizeTrackKey(track.artist, track.title);
        if (!key) continue;

        if (!tracks[key]) {
          trackCounter++;
          tracks[key] = {
            id: 'tr_' + trackCounter,
            title: track.title,
            artist: track.artist,
            played_by: new Set(),
            sets: []
          };
        }
        tracks[key].played_by.add(djId);
        tracks[key].sets.push(set.id);
      }
    }
  }

  return {
    tracks: Object.values(tracks).map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      played_by: [...t.played_by],
      sets: t.sets
    })),
    generated_at: new Date().toISOString()
  };
}

function updateIndexJson(index, djsById, djSets) {
  const djs = index.djs || [];
  const updated = [];

  for (const dj of djs) {
    const sets = djSets[dj.id] || [];
    const setIds = sets.map(s => s.id).sort();
    const trackCount = sets.reduce((sum, s) => sum + (s.tracklist || []).length, 0);
    const knownCount = sets.reduce((sum, s) => sum + (s.tracks_identified || (s.tracklist || []).length), 0);
    const totalTracks = sets.reduce((sum, s) => sum + (s.tracks_total || (s.tracklist || []).length), 0);
    // Backfill empty image from first set's youtube_embed_id
    let image = dj.image;
    if (!image && sets.length > 0 && sets[0].youtube_embed_id) {
      image = `https://i.ytimg.com/vi/${sets[0].youtube_embed_id}/hqdefault.jpg`;
    }

    updated.push({
      ...dj,
      image,
      sets: setIds,
      stats: {
        sets: setIds.length,
        tracks: totalTracks,
        known: knownCount,
        completion_rate: totalTracks > 0 ? Math.round((knownCount / totalTracks) * 100) : 100
      }
    });
  }

  // Add new DJs not in index
  const knownIds = new Set(djs.map(d => d.id));
  for (const djId of Object.keys(djSets)) {
    if (knownIds.has(djId)) continue;

    const sets = djSets[djId];
    const setIds = sets.map(s => s.id).sort();
    const trackCount = sets.reduce((sum, s) => sum + (s.tracklist || []).length, 0);
    const firstYt = sets[0]?.youtube_embed_id;
    const image = firstYt ? `https://i.ytimg.com/vi/${firstYt}/hqdefault.jpg` : '';

    updated.push({
      id: djId,
      name: toTitleCase(djId.replace(/-/g, ' ')),
      origin: '',
      active_since: '',
      genres: (sets[0]?.genre || []),
      bio: '',
      image: image,
      sets: setIds,
      stats: {
        sets: setIds.length,
        tracks: trackCount,
        known: trackCount,
        completion_rate: 100
      }
    });
  }

  return { djs: updated.sort((a, b) => a.name.localeCompare(b.name)) };
}

function main() {
  console.log('🎧 DJ Data Compiler');
  console.log('====================\n');

  // Load index.json
  const indexPath = path.join(OUT_DIR, 'djs', 'index.json');
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const knownDJs = index.djs || [];
  console.log(`📋 Loaded index.json with ${knownDJs.length} DJs`);

  // Load all set files
  const allSets = loadSets();
  console.log(`📁 Found ${Object.keys(allSets).length} set files`);

  // Group sets by DJ
  const djSets = {};
  for (const [fileId, setData] of Object.entries(allSets)) {
    const djId = resolveDJId(fileId, knownDJs);
    if (!djSets[djId]) djSets[djId] = [];
    // Ensure set data has an ID
    if (!setData.id) setData.id = fileId;
    djSets[djId].push(setData);
  }

  const djCount = Object.keys(djSets).length;
  console.log(`🔗 Grouped into ${djCount} DJs`);

  // Build djsById map
  const djsById = {};
  for (const dj of knownDJs) djsById[dj.id] = dj;
  for (const djId of Object.keys(djSets)) {
    if (!djsById[djId]) {
      djsById[djId] = { id: djId, name: toTitleCase(djId.replace(/-/g, ' ')) };
    }
  }

  // Generate outputs
  console.log('\n🏗️  Generating outputs...\n');

  // 1. tracklists.js
  const tracklists = buildTracklistsOutput(djsById, djSets);
  const tracklistsJs = `// Auto-generated by scripts/build-dj-data.js
// Do NOT edit manually. Run: node scripts/build-dj-data.js

const TRACKLISTS = ${JSON.stringify(tracklists, null, 2)};
`;
  fs.writeFileSync(path.join(OUT_DIR, 'tracklists', 'tracklists.js'), tracklistsJs);
  const totalSets = Object.values(tracklists).reduce((sum, dj) => sum + dj.sets.length, 0);
  console.log(`✅ data/tracklists/tracklists.js — ${Object.keys(tracklists).length} DJs, ${totalSets} sets`);

  // 2. cross-references.json
  const crossRefs = buildCrossReferences(djsById, djSets);
  fs.writeFileSync(path.join(OUT_DIR, 'djs', 'cross-references.json'), JSON.stringify(crossRefs, null, 2));
  console.log(`✅ data/djs/cross-references.json`);
  console.log(`   • ${crossRefs.total_shared_tracks} shared tracks`);
  console.log(`   • ${crossRefs.total_shared_artists} shared artists`);
  console.log(`   • ${Object.keys(crossRefs.venue_networks).length} venue networks`);
  console.log(`   • ${Object.keys(crossRefs.label_affinity).length} label affinities`);
  console.log(`   • ${crossRefs.super_connectors.length} super connectors`);
  if (crossRefs.super_connectors.length > 0) {
    console.log(`   🏆 Top: ${crossRefs.super_connectors[0].name} (${crossRefs.super_connectors[0].connection_count} connections)`);
  }

  // 3. track-registry.json
  const registry = buildTrackRegistry(djSets);
  const tracksDir = path.join(OUT_DIR, 'djs', 'tracks');
  if (!fs.existsSync(tracksDir)) fs.mkdirSync(tracksDir, { recursive: true });
  fs.writeFileSync(path.join(tracksDir, 'track-registry.json'), JSON.stringify(registry, null, 2));
  console.log(`✅ data/djs/tracks/track-registry.json — ${registry.tracks.length} unique tracks`);

  // 4. Update index.json
  const updatedIndex = updateIndexJson(index, djsById, djSets);
  fs.writeFileSync(indexPath, JSON.stringify(updatedIndex, null, 2));
  console.log(`✅ data/djs/index.json — ${updatedIndex.djs.length} DJs`);

  console.log('\n🎉 Build complete!');
  console.log('   Next: open dj-library.html or 3d-brain.html to see the enriched data.');
}

main();
