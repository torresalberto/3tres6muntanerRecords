const MusicDB = {
  sources: [
    // ==================== TIER 1 - DIRECT DOWNLOADS ====================
    {
      id: "bandcamp",
      name: "Bandcamp",
      url: "https://bandcamp.com",
      description: "Direct downloads from artists. Many offer free downloads with purchase or as free releases. Best for House, Microhouse, Progressive.",
      genres: ["house", "microhouse", "progressive house", "deep house", "melodic techno", "tech house"],
      formats: ["MP3", "FLAC", "WAV"],
      quality: "Artist choice (often 320kbps+)",
      tier: 1,
      tierLabel: "Best",
      features: ["direct downloads", "free releases", "support artists", "name your price"],
      color: "#629aa9"
    },
    {
      id: "ektoplazm",
      name: "Ektoplazm",
      url: "https://ektoplazm.com",
      description: "Direct MP3/FLAC downloads. Legendary platform for psytrance and progressive electronic.",
      genres: ["psytrance", "progressive psy", "progressive house", "electronic", "ambient"],
      formats: ["MP3", "FLAC", "WAV"],
      quality: "320kbps / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["direct downloads", "massive catalog", "free releases", "cc licenses"],
      color: "#059669"
    },
    {
      id: "free-music-archive",
      name: "Free Music Archive",
      url: "https://freemusicarchive.org",
      description: "Direct downloads. One of the largest legal free music databases with extensive electronic section.",
      genres: ["electronic", "house", "techno", "progressive", "ambient", "experimental"],
      formats: ["MP3", "FLAC"],
      quality: "Varies",
      tier: 1,
      tierLabel: "Best",
      features: ["direct downloads", "huge catalog", "curated collections", "cc licenses"],
      color: "#0891b2"
    },

    // ==================== TIER 2 - GOOD DOWNLOADS ====================
    {
      id: "jamendo",
      name: "Jamendo",
      url: "https://www.jamendo.com",
      description: "Direct downloads. Thousands of electronic tracks available for free download.",
      genres: ["electronic", "house", "techno", "progressive", "trance", "ambient"],
      formats: ["MP3"],
      quality: "128-320kbps",
      tier: 2,
      tierLabel: "Good",
      features: ["direct downloads", "large catalog", "free downloads", "artist profiles"],
      color: "#f59e0b"
    },
    {
      id: "bensound",
      name: "Bensound",
      url: "https://www.bensound.com",
      description: "Direct downloads. Royalty-free electronic music for creators. Great for House and Progressive.",
      genres: ["electronic", "house", "techno", "progressive", "downtempo", "cinematic"],
      formats: ["MP3"],
      quality: "128-320kbps",
      tier: 2,
      tierLabel: "Good",
      features: ["direct downloads", "royalty free", "production ready", "clean sound"],
      color: "#8b5cf6"
    },
    {
      id: "beatport",
      name: "Beatport",
      url: "https://www.beatport.com",
      description: "Free downloads section. Professional marketplace with weekly free tracks.",
      genres: ["house", "progressive house", "tech house", "deep house", "melodic techno"],
      formats: ["MP3", "WAV", "FLAC"],
      quality: "320kbps+",
      tier: 2,
      tierLabel: "Good",
      features: ["free section", "pro marketplace", "new releases", "electronic focused"],
      color: "#000000"
    },
    {
      id: "traxsource",
      name: "Traxsource",
      url: "https://www.traxsource.com",
      description: "Free tracks daily. Premier house and techno source with direct downloads.",
      genres: ["house", "techno", "deep house", "tech house", "progressive house"],
      formats: ["MP3", "WAV"],
      quality: "320kbps",
      tier: 2,
      tierLabel: "Good",
      features: ["direct downloads", "free tracks", "house focused", "daily freebies"],
      color: "#0ea5e9"
    },

    // ==================== TIER 3 - LABEL STORES (Direct Download) ====================
    {
      id: "anjunadeep",
      name: "Anjunadeep",
      url: "https://anjunadeep.bandcamp.com",
      description: "Direct Bandcamp downloads. Melodic house and progressive. Beautiful, emotional electronic music.",
      genres: ["melodic house", "progressive house", "deep house", "melodic techno"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps / Lossless",
      tier: 3,
      tierLabel: "Labels",
      features: ["direct downloads", "melodic", "emotional", "quality label"],
      color: "#3b82f6"
    },
    {
      id: "defected-records",
      name: "Defected Records",
      url: "https://defected.bandcamp.com",
      description: "Direct Bandcamp downloads. Classic house and disco. Legendary label.",
      genres: ["house", "disco", "soulful house", "deep house", "progressive house"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Labels",
      features: ["direct downloads", "classic house", "legendary label", "disco vibes"],
      color: "#f43f5e"
    },
    {
      id: "armada",
      name: "Armada Music",
      url: "https://armadamusic.bandcamp.com",
      description: "Direct Bandcamp downloads. One of the world's biggest electronic music labels.",
      genres: ["house", "progressive", "trance", "electro", "big room"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Labels",
      features: ["direct downloads", "major label", "varied genres", "high quality"],
      color: "#0066cc"
    },
    {
      id: "stereohype",
      name: "Stereohype",
      url: "https://stereohype.bandcamp.com",
      description: "Direct Bandcamp downloads. Forward-thinking electronic music label.",
      genres: ["house", "techno", "electro", "experimental", "bass"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Labels",
      features: ["direct downloads", "experimental", "fresh sounds", "affordable"],
      color: "#e11d48"
    },
    {
      id: "hot creations",
      name: "Hot Creations",
      url: "https://hotcreations.bandcamp.com",
      description: "Direct Bandcamp downloads. techno, house and more from Fisher's label.",
      genres: ["house", "techno", "tech house", "deep house"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Labels",
      features: ["direct downloads", "techno", "house", "popular label"],
      color: "#f97316"
    },
    {
      id: "dirtybird",
      name: "Dirtybird",
      url: "https://dirtybird.bandcamp.com",
      description: "Direct Bandcamp downloads. West coast house and techno.",
      genres: ["house", "tech house", "funky house", " techno"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Labels",
      features: ["direct downloads", "funky house", "west coast", "iconic label"],
      color: "#84cc16"
    },
    {
      id: "toolroom",
      name: "Toolroom",
      url: "https://toolroom.bandcamp.com",
      description: "Direct Bandcamp downloads. Premium house and techno label.",
      genres: ["house", "tech house", "techno", "progressive"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Labels",
      features: ["direct downloads", "professional", "house focused", "quality releases"],
      color: "#a855f7"
    },
    {
      id: "spinnin-sessions",
      name: "Spinnin' Sessions",
      url: "https://spinninsessions.bandcamp.com",
      description: "Direct Bandcamp downloads. House and progressive from Spinnin'.",
      genres: ["house", "progressive house", "electro", "edm"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Labels",
      features: ["direct downloads", "major label", "house", "progressive"],
      color: "#1ca0f2"
    },
    {
      id: "crazy-k",
      name: "Crazy K",
      url: "https://crazyk.bandcamp.com",
      description: "Direct Bandcamp downloads. Techno and house from Berlin.",
      genres: ["techno", "house", "minimal", "tech house"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Labels",
      features: ["direct downloads", "berlin", "techno", "underground"],
      color: "#ef4444"
    },
    {
      id: "mord",
      name: "MORD",
      url: "https://mord.bandcamp.com",
      description: "Direct Bandcamp downloads. Dark techno and experimental.",
      genres: ["techno", "dark techno", "experimental", "industrial"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Labels",
      features: ["direct downloads", "dark techno", "experimental", "berlin"],
      color: "#18181b"
    },
    {
      id: "afterhours",
      name: "Afterhours",
      url: "https://afterhours.bandcamp.com",
      description: "Direct Bandcamp downloads. Italian techno and house.",
      genres: ["techno", "house", "progressive", "melodic"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Labels",
      features: ["direct downloads", "italian", "techno", "quality"],
      color: "#dc2626"
    }
  ],

  // Get all unique genres
  getGenres: function() {
    const genres = new Set();
    this.sources.forEach(source => {
      source.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  },

  // Get quality badges
  getQualityBadges: function(quality) {
    const badges = [];
    const qualityLower = quality.toLowerCase();
    
    if (qualityLower.includes('320') || qualityLower.includes('lossless')) {
      badges.push({ text: 'High Quality', color: '#00c853' });
    }
    if (qualityLower.includes('flac') || qualityLower.includes('wav')) {
      badges.push({ text: 'Lossless', color: '#2196f3' });
    }
    
    return badges;
  }
};
