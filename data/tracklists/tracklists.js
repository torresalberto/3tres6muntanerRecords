// Tracklist data loader for DJ Sets and 3D Brain
// Loads tracklist data from JSON files and provides search/filter APIs

const TRACKLISTS = {
  "folamour": {
    artist: "Folamour",
    artist_id: "folamour",
    sets: [
      {
        id: "folamour-cercle-geneva-2023",
        title: "Cercle @ Cathédrale Saint-Pierre, Geneva",
        venue: "Cercle, St. Pierre Cathedral, Geneva, Switzerland",
        date: "2023-07-10",
        duration: "1:53:43",
        youtube: "YDJEo-rQrfw",
        views: 3000000,
        genre: ["House", "Nu Disco", "Disco"],
        tracks_identified: 22,
        tracks_total: 22,
        source: "YouTube description + 1001tracklists + MixesDB",
        tracklist: [
          { time: "00:00", artist: "September", title: "Ostavi Trag" },
          { time: "00:45", artist: "General Ehi Duncan, The Africa Army", title: "Express ft. The Ibibio Horns - Africa (My No. 1) (Captain Planet Remix)" },
          { time: "05:52", artist: "Mike Simonetti", title: "Midnight Or Late Afternoon" },
          { time: "09:20", artist: "Donna Washington", title: "You Can't Hide From The Boogie" },
          { time: "12:40", artist: "Crown Heights Affair", title: "I See The Light" },
          { time: "16:23", artist: "Folamour", title: "Fearless", label: "FHUO" },
          { time: "20:38", artist: "Cotonete, Dimitri From Paris", title: "The Hustle Parisian", label: "Heavenly Sweetness" },
          { time: "26:10", artist: "Ten City", title: "Be Free (Emmaculate & Shannon Chambers Mix)", label: "Ultra" },
          { time: "30:40", artist: "Folamour ft. Amadou & Mariam", title: "Voyage", label: "FHUO" },
          { time: "34:50", artist: "Easttown", title: "Breeze", label: "House Of Love" },
          { time: "38:20", artist: "Folamour", title: "Paradiso" },
          { time: "44:24", artist: "Folamour", title: "Poundland Anthem", label: "FHUO" },
          { time: "49:19", artist: "Udo Jürgens", title: "Peace Now (Folamour Remix)", label: "Sony" },
          { time: "53:20", artist: "Kathy Brown", title: "Get Another Love (Warren Clarke Dub Mix)", label: "Glitterbox" },
          { time: "57:36", artist: "Jamie Lewis ft. Michael Watford", title: "For You (Original Demo Mix)", label: "Purple Music" },
          { time: "01:02:45", artist: "Saison", title: "Man Of Soul", label: "No Fuss" },
          { time: "01:07:54", artist: "Ferry Ultra ft. Gwen McCrae", title: "Happy (Folamour Remix)", label: "Peppermint Jam" },
          { time: "01:12:17", artist: "Folamour", title: "Bonifacio" },
          { time: "01:18:02", artist: "Dasco", title: "Feel My Love" },
          { time: "01:22:46", artist: "Danny Snowden", title: "Energy" },
          { time: "01:26:32", artist: "Folamour", title: "Post Tenebras Lux" },
          { time: "01:31:08", artist: "Folamour", title: "When A Piano Saves The Day", label: "FHUO" }
        ]
      },
      {
        id: "folamour-br-sugar-mountain-2024",
        title: "Boiler Room x Sugar Mountain 2024",
        venue: "Sugar Mountain, Melbourne, Australia",
        date: "2024-01-20",
        duration: "59:45",
        youtube: "IC5EOU0vZjw",
        views: 3691617,
        genre: ["House", "Tech House"],
        tracks_identified: 12,
        tracks_total: 12,
        source: "1001tracklists + MixesDB",
        tracklist: [
          { time: "00:00", artist: "D Stone", title: "Total Unison", label: "Cécille" },
          { time: "00:00", artist: "Folamour", title: "Manifesto (Vocal)", note: "ID - Unreleased" },
          { time: "07:00", artist: "Urban Blues Project ft. Bobby Pruitt", title: "We Are One (Jazz-N-Groove Hands Up Vocal Remix)" },
          { time: "13:00", artist: "Da Lukas", title: "Satisfy Your Soul (Extended Mix)", label: "Groove Culture" },
          { time: "18:00", artist: "Dam Swindle", title: "That's Right", label: "Heist" },
          { time: "23:00", artist: "MoD, Luisen", title: "Small Town Boy (Supermini Mega Dub)" },
          { time: "28:00", artist: "Lone Dog", title: "Straight From The Underground", label: "Frappé" },
          { time: "32:00", artist: "Bongoloverz ft. An-Tonic", title: "Power Of Music", label: "Soulfuric Trax" },
          { time: "39:00", artist: "Folamour", title: "Pressure Makes Diamonds", note: "Unreleased" },
          { time: "44:00", artist: "Madonna", title: "Vogue (DJ Meme Remix)", label: "Sire" },
          { time: "50:00", artist: "Melon Bomb", title: "Fantazia", label: "Melon Bomb", note: "w/ Jayforce - When I Was Seventeen (ID Remix)" },
          { time: "55:00", artist: "Folamour", title: "Unreleased", note: "ID" }
        ]
      },
      {
        id: "folamour-dj-mag-hq-2019",
        title: "DJ Mag HQ Sessions",
        venue: "DJ Mag HQ, London, UK",
        date: "2019-04-18",
        duration: "1:03:51",
        youtube: "",
        views: 0,
        genre: ["Nu Disco", "Disco"],
        tracks_identified: 14,
        tracks_total: 14,
        source: "1001tracklists + MixesDB",
        tracklist: [
          { time: "00:00", artist: "Brian Auger's Oblivion Express", title: "Maiden Voyage" },
          { time: "00:22", artist: "Fingerman", title: "Your Love" },
          { time: "06:09", artist: "Kazuko Ishibashi", title: "Iyo", label: "INVITATION" },
          { time: "10:10", artist: "Sunlightsquare", title: "I Believe In Miracles (Broken Party Animal Mix)", label: "Sunlightsquare Records" },
          { time: "14:15", artist: "Lakeside", title: "Fantastic Voyage", label: "Unidisc" },
          { time: "18:03", artist: "Sharp Soul", title: "Another Brick (Edit)", label: "Groove Democracy" },
          { time: "22:03", artist: "Lee McDonald", title: "I'll Do Anything For You (Patchworks Remix)", label: "Favourite Recordings" },
          { time: "27:39", artist: "D.J. Rogers", title: "Reason To Dance (Aroop Roy Edit)" },
          { time: "32:22", artist: "The Disco Dog", title: "I'm Gonna Break Your Bones", label: "ZYX" },
          { time: "36:17", artist: "Light Of The World", title: "Time", label: "Mercury" },
          { time: "43:08", artist: "Yta Jourias", title: "Adome Nyueto", label: "Hot Casa" },
          { time: "49:19", artist: "Songhoi Band", title: "Africa Africa (Faze Action Edit)", label: "Z Records" },
          { time: "53:29", artist: "Voilaaa ft. Sir Jean", title: "Spies Are Watching Me", label: "Favorite" },
          { time: "1:00:15", artist: "Folamour ft. Elbi", title: "After Winter Must Come Spring", label: "FHUO" }
        ]
      },
      {
        id: "folamour-br-fly-edinburgh-2019",
        title: "Boiler Room x FLY Open Air Festival",
        venue: "FLY Open Air Festival, Edinburgh, UK",
        date: "2019-05-18",
        duration: "59:42",
        youtube: "",
        views: 0,
        genre: ["Nu Disco", "Disco", "House"],
        tracks_identified: 12,
        tracks_total: 12,
        source: "MixesDB",
        tracklist: [
          { time: "00:00", artist: "Odyssey", title: "Going Back To My Roots (Ziggy Phunk Re-Edit)" },
          { time: "07:00", artist: "Banda Black Rio", title: "Chega Mais (Imaginei Você Dançando) (Folamour Edit)" },
          { time: "10:00", artist: "Esa", title: "A Muto" },
          { time: "17:00", artist: "Elaine & Ellen", title: "Fill Me Up", label: "Funky Delicacies" },
          { time: "22:00", artist: "COEO", title: "Don't Oho", label: "Razor-N-Tape" },
          { time: "27:00", artist: "Fronzena Harris", title: "Lovetime Guarantee" },
          { time: "31:00", artist: "Mighty Mouse", title: "Midnight Mouse (Revised)", label: "Space Native" },
          { time: "34:00", artist: "Light Of The World", title: "Time (Koko Paradisco Re-Edit)", label: "Basic Fingers" },
          { time: "40:00", artist: "Sean Smith & MC Edits", title: "Funky Disco Music (Original Edit)", label: "Smooth Edits" },
          { time: "47:00", artist: "Di Melo", title: "A E I O U" },
          { time: "52:00", artist: "Cotonete & Dimitri From Paris", title: "Parribean Disco", label: "Heavenly Sweetness" },
          { time: "56:00", artist: "George Michael", title: "Freedom! '90 (Remastered)" }
        ]
      },
      {
        id: "folamour-polaris-verbier-2020",
        title: "Polaris Festival New Year's Eve",
        venue: "Polaris Festival, Verbier, Switzerland",
        date: "2019-12-31",
        duration: "",
        youtube: "",
        views: 0,
        genre: ["Disco", "House", "Nu Disco"],
        tracks_identified: 13,
        tracks_total: 13,
        source: "Decoded Magazine",
        tracklist: [
          { time: "", artist: "Father's Children", title: "Dance Do It" },
          { time: "", artist: "Rare Cuts", title: "Out To Get'cha" },
          { time: "", artist: "Veronique Sanson", title: "Bernard's Song (Young Pulse Edit)" },
          { time: "", artist: "Enchantment", title: "Give It Up" },
          { time: "", artist: "Gayle Adams", title: "Emergency" },
          { time: "", artist: "Folamour", title: "I Know It Has Been Done Before" },
          { time: "", artist: "Isaac Hayes", title: "Fever" },
          { time: "", artist: "Folamour", title: "Jazz Session For No Future People" },
          { time: "", artist: "Faze Action & Zeke Manyika", title: "Mangwana" },
          { time: "", artist: "Rhyze", title: "I Found Love In You" },
          { time: "", artist: "Mass Production", title: "Maybe, Maybe" },
          { time: "", artist: "Martin Solveig", title: "Jealousy" },
          { time: "", artist: "George Michael", title: "Fastlove" }
        ]
      },
      {
        id: "folamour-lost-paradise-2022",
        title: "Lost Paradise",
        venue: "Lost Paradise, Australia",
        date: "2022-12-30",
        duration: "1:28:50",
        youtube: "",
        views: 0,
        genre: ["House", "Nu Disco", "Disco"],
        tracks_identified: 16,
        tracks_total: 19,
        source: "1001tracklists",
        tracklist: [
          { time: "00:00", artist: "Lenny Williams", title: "When I'm Dancin' (Marc Green Edit)" },
          { time: "", artist: "Kaleta", title: "ID" },
          { time: "", artist: "Afshin & Kiss My Black Jazz", title: "The Seduction" },
          { time: "", artist: "Gaoulé Mizik", title: "A Ka Titine (Dam Swindle Edit)", label: "Heist" },
          { time: "25:00", artist: "Fixed Angles", title: "Anikana", label: "Bonfido Disques" },
          { time: "29:30", artist: "Kaz James", title: "Footprints", label: "Another Record Label" },
          { time: "35:30", artist: "Folamour", title: "ID", note: "Unreleased" },
          { time: "41:00", artist: "H20", title: "Nobody's Business", label: "AM:PM" },
          { time: "46:00", artist: "Marc Cotterell", title: "Make Me Feel", label: "Plastik People" },
          { time: "51:00", artist: "Ferry Ultra ft. Gwen McCrae", title: "Happy (Folamour Remix)", label: "Peppermint Jam" },
          { time: "55:00", artist: "Ten City", title: "Be Free (Emmaculate & Shannon Chambers Remix)", label: "Ultra" },
          { time: "59:30", artist: "Koko", title: "7 Days In The Hotel (M-High Remix)", label: "Surge" },
          { time: "1:02:30", artist: "Robbie Doherty & FOLEY (UK)", title: "Let The Bass", label: "Avenu" },
          { time: "1:07:00", artist: "Marsolo", title: "ID" },
          { time: "1:10:00", artist: "Folamour", title: "ID", note: "Unreleased" },
          { time: "1:15:30", artist: "Daan Steenman", title: "Djingoo" },
          { time: "1:20:00", artist: "Herbert Leonard", title: "Chante Avec Moi (Young Pulse Edit)" },
          { time: "1:24:00", artist: "Patrice Rushen", title: "Forget Me Nots", label: "Elektra" }
        ]
      },
      {
        id: "folamour-yuma-coachella-2024",
        title: "Yuma, Coachella 2024 (Weekend 2)",
        venue: "Yuma, Coachella, USA",
        date: "2024-04-21",
        duration: "",
        youtube: "",
        views: 0,
        genre: ["House", "Disco"],
        tracks_identified: 13,
        tracks_total: 19,
        source: "LiveTrackList",
        tracklist: [
          { time: "", artist: "D Stone", title: "Total Unison" },
          { time: "", artist: "Udo Juergens", title: "Peace Now (Folamour Remix)" },
          { time: "", artist: "Chevals", title: "Everybody Dance" },
          { time: "", artist: "Crown Heights Affair", title: "I See The Light" },
          { time: "", artist: "Born To Funk", title: "Souma Bana" },
          { time: "", artist: "Folamour ft. Amadou & Mariam", title: "Voyage" },
          { time: "", artist: "Jasper Street Company", title: "Another Day" },
          { time: "", artist: "The Trammps", title: "I've Gotta Stand Up (Brand New Man) (Dave Lee Garage City Mix)" },
          { time: "", artist: "People's Choice", title: "Here We Go Agin (Joey Negro Philly Stomp Mix)" },
          { time: "", artist: "Jackie Moore", title: "This Time Baby" },
          { time: "", artist: "Billy Paul", title: "Only The Strong Survive" }
        ]
      },
      {
        id: "folamour-complex-sessions-074-2023",
        title: "Complex Sessions 074",
        venue: "Radio/Podcast",
        date: "2023-07-26",
        duration: "1:25:32",
        youtube: "",
        views: 0,
        genre: ["House", "Tech House"],
        tracks_identified: 10,
        tracks_total: 11,
        source: "1001tracklists",
        tracklist: [
          { time: "", artist: "Dave Lee ZR & Joey Montenegro", title: "Make A Move On Me", label: "Z Records" },
          { time: "", artist: "Udo Jürgens", title: "Peace Now (Folamour Remix)", label: "Sony" },
          { time: "", artist: "Joï", title: "Akalelo" },
          { time: "", artist: "Easttown", title: "Breeze", label: "House Of Love" },
          { time: "", artist: "Robbie Doherty & FOLEY (UK)", title: "ID" },
          { time: "", artist: "Easttown", title: "Enchance" },
          { time: "", artist: "Duke", title: "So In Love With You (Full Intention Remix)", label: "Virgin" },
          { time: "", artist: "Ferry Ultra ft. Gwen McCrae", title: "Happy (Folamour Remix)", label: "Peppermint Jam" },
          { time: "", artist: "Jamie Lewis ft. Michael Watford", title: "For You", label: "Purple Music" },
          { time: "", artist: "Dub Syndicate Productions", title: "No Longer", label: "Nice N Ripe" },
          { time: "", artist: "Dasco", title: "Feel My Love" }
        ]
      },
      {
        id: "folamour-bbc-radio1-residency-2022",
        title: "BBC Radio 1 Residency",
        venue: "BBC Radio 1, UK",
        date: "2022-01-20",
        duration: "",
        youtube: "",
        views: 0,
        genre: ["House", "Nu Disco", "Disco"],
        tracks_identified: 12,
        tracks_total: 12,
        source: "MixesDB",
        tracklist: [
          { time: "", artist: "Folamour", title: "Simple Song" },
          { time: "", artist: "Demis Roussos", title: "L.O.V.E. (Folamour Edit)" },
          { time: "", artist: "Folamour", title: "I Know It Has Been Done Before", label: "Noire & Blanche" },
          { time: "", artist: "Doug Willis", title: "Doug's Disco Theme" },
          { time: "", artist: "Saraba", title: "Barlia (Kulandjagnho)" },
          { time: "", artist: "Folamour", title: "The Journey", label: "FHUO" },
          { time: "", artist: "Kleeer", title: "Open Your Mind (Joey Negro Seeekret Mix)", label: "Warner" },
          { time: "", artist: "Parviz", title: "The Widow's Lament In Springtime", label: "Kitsune Musique Singles" },
          { time: "", artist: "Underdog", title: "In Need Of That Phone" },
          { time: "", artist: "Jorge Ben Jor", title: "A Cegonha Me Deixou Em Madureira (Aroop Roy Edit)", label: "Som Livre" },
          { time: "", artist: "Pure Energy", title: "Party On" },
          { time: "", artist: "Folamour", title: "St Moskov", label: "FHUO" }
        ]
      }
    ]
  },
  "kettama": {
    artist: "KETTAMA",
    artist_id: "kettama",
    sets: [
      {
        id: "kettama-br-london-2025",
        title: "Boiler Room London 2025",
        venue: "Boiler Room, London, UK",
        date: "2025-07-31",
        duration: "57:23",
        youtube: "JUDUC87VuPU",
        views: 1300000,
        genre: ["House", "Bass", "Garage", "UKG"],
        tracks_identified: 12,
        tracks_total: 12,
        source: "set79.com + Boiler Room",
        tracklist: [
          { time: "00:24", artist: "Soul Mass Transit System", title: "Jump (Rushing Mix)" },
          { time: "06:00", artist: "Sidney Charles & BUGS", title: "Trip Advisor (Rhythm, Snare, Bass) [2025 Warp Mix]" },
          { time: "09:12", artist: "Calvin Harris & Clementine Douglas", title: "Blessings (KETTAMA Remix)" },
          { time: "14:12", artist: "FYAH", title: "RealSpill" },
          { time: "15:36", artist: "Sir Spyro", title: "Topper Top (Feat. Teddy Bruckshot, Lady Chann & Killa P)" },
          { time: "19:36", artist: "2 Unlimited", title: "No Limit" },
          { time: "22:48", artist: "KETTAMA, DJ HEARTSTRING & KLP", title: "If U Want My Heart (Ft. KLP)" },
          { time: "29:48", artist: "Unknown", title: "ID", note: "ID" },
          { time: "40:24", artist: "GlennRoy", title: "Carbon Spaghetti" },
          { time: "42:24", artist: "Paqué", title: "Are You Ready?" },
          { time: "45:24", artist: "KETTAMA & Interplanetary Criminal", title: "Yosemite" },
          { time: "51:36", artist: "KETTAMA & Clouds", title: "Sort It Out" }
        ]
      }
    ]
  }
};

// Tracklist API functions
const TracklistAPI = {
  /**
   * Get all sets for a specific DJ
   */
  getSetsByArtist(artistId) {
    const data = TRACKLISTS[artistId];
    return data ? data.sets : [];
  },

  /**
   * Get a specific set by ID
   */
  getSet(setId) {
    for (const artistId in TRACKLISTS) {
      const set = TRACKLISTS[artistId].sets.find(s => s.id === setId);
      if (set) return set;
    }
    return null;
  },

  /**
   * Search tracks across all sets
   */
  searchTracks(query) {
    const results = [];
    const q = query.toLowerCase();

    for (const artistId in TRACKLISTS) {
      TRACKLISTS[artistId].sets.forEach(set => {
        set.tracklist.forEach(track => {
          if (
            track.artist.toLowerCase().includes(q) ||
            track.title.toLowerCase().includes(q) ||
            (track.label && track.label.toLowerCase().includes(q))
          ) {
            results.push({
              ...track,
              set_id: set.id,
              set_title: set.title,
              set_date: set.date,
              set_youtube: set.youtube,
              dj: TRACKLISTS[artistId].artist
            });
          }
        });
      });
    }

    return results;
  },

  /**
   * Find all sets where a specific track was played
   */
  findTrackAcrossSets(artist, title) {
    const results = [];
    const artistLower = artist.toLowerCase();
    const titleLower = title.toLowerCase();

    for (const artistId in TRACKLISTS) {
      TRACKLISTS[artistId].sets.forEach(set => {
        set.tracklist.forEach(track => {
          if (
            track.artist.toLowerCase().includes(artistLower) &&
            track.title.toLowerCase().includes(titleLower)
          ) {
            results.push({
              ...track,
              set_id: set.id,
              set_title: set.title,
              set_date: set.date,
              set_venue: set.venue,
              set_youtube: set.youtube,
              dj: TRACKLISTS[artistId].artist
            });
          }
        });
      });
    }

    return results;
  },

  /**
   * Get all unique artists across all tracklists
   */
  getAllArtists() {
    const artists = new Set();
    for (const artistId in TRACKLISTS) {
      TRACKLISTS[artistId].sets.forEach(set => {
        set.tracklist.forEach(track => {
          // Extract main artist (before "ft." or "&")
          const mainArtist = track.artist.split(/\s*(?:ft\.|&|,)/i)[0].trim();
          if (mainArtist) artists.add(mainArtist);
        });
      });
    }
    return Array.from(artists).sort();
  },

  /**
   * Get all unique labels across all tracklists
   */
  getAllLabels() {
    const labels = new Set();
    for (const artistId in TRACKLISTS) {
      TRACKLISTS[artistId].sets.forEach(set => {
        set.tracklist.forEach(track => {
          if (track.label) labels.add(track.label);
        });
      });
    }
    return Array.from(labels).sort();
  },

  /**
   * Get statistics across all tracklists
   */
  getStats() {
    let totalSets = 0;
    let totalTracks = 0;
    let totalIdentified = 0;

    for (const artistId in TRACKLISTS) {
      const sets = TRACKLISTS[artistId].sets;
      totalSets += sets.length;
      sets.forEach(set => {
        totalTracks += set.tracks_total;
        totalIdentified += set.tracks_identified;
      });
    }

    return {
      totalSets,
      totalTracks,
      totalIdentified,
      identificationRate: totalTracks > 0 ? Math.round((totalIdentified / totalTracks) * 100) : 0
    };
  }
};
