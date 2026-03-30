const MusicDB = {
  sources: [
    // ==================== TIER 1 - BEST SOURCES ====================
    {
      id: "musicvibez",
      name: "MusicVibez",
      url: "https://musicvibez.com",
      description: "Premier destination for free electronic music. Curated releases from top labels with excellent quality.",
      genres: ["house", "techno", "deep house", "progressive", "melodic techno"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["curated", "label releases", "high quality"],
      color: "#7c3aed"
    },
    {
      id: "ektoplasm",
      name: "Ektoplazm",
      url: "https://ektoplazm.com",
      description: "Legendary free music platform. Massive collection of electronic, psytrance, and experimental.",
      genres: ["psytrance", "progressive psy", "electronic", "ambient", "experimental"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["massive catalog", "community", "free releases"],
      color: "#059669"
    },
    {
      id: "free-music-archive",
      name: "Free Music Archive",
      url: "https://freemusicarchive.org",
      description: "One of the largest databases of free, legal music downloads. Extensive electronic section.",
      genres: ["electronic", "ambient", "experimental", "house", "techno"],
      formats: ["MP3", "FLAC"],
      quality: "Varies",
      tier: 1,
      tierLabel: "Best",
      features: ["huge catalog", "curated collections", "cc licenses"],
      color: "#0891b2"
    },
    {
      id: "cctrrax",
      name: "CCTrax",
      url: "https://cctrax.com",
      description: "Creative Commons electronic music. Quality over quantity with expert curation.",
      genres: ["electronic", "house", "techno", "minimal", "deep house"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["cc music", "curated", "electronic focused"],
      color: "#dc2626"
    },
    {
      id: "bandcamp",
      name: "Bandcamp",
      url: "https://bandcamp.com",
      description: "Support artists directly. Many offer free downloads with purchase or as free releases.",
      genres: ["all electronic"],
      formats: ["MP3", "FLAC", "WAV"],
      quality: "Artist choice",
      tier: 1,
      tierLabel: "Best",
      features: ["support artists", "free releases", "name your price"],
      color: "#629aa9"
    },

    // ==================== TIER 2 - GOOD SOURCES ====================
    {
      id: "jamendo",
      name: "Jamendo",
      url: "https://www.jamendo.com",
      description: "Independent music platform with thousands of electronic tracks. Free streaming and downloads.",
      genres: ["electronic", "house", "techno", "trance", "ambient"],
      formats: ["MP3"],
      quality: "128-320kbps",
      tier: 2,
      tierLabel: "Good",
      features: ["large catalog", "free downloads", "artist profiles"],
      color: "#f59e0b"
    },
    {
      id: "bensound",
      name: "Bensound",
      url: "https://www.bensound.com",
      description: "Royalty-free electronic music for creators. Clean, production-ready tracks.",
      genres: ["electronic", "house", "techno", "downtempo", "cinematic"],
      formats: ["MP3"],
      quality: "128-320kbps",
      tier: 2,
      tierLabel: "Good",
      features: ["royalty free", "production ready", "clean sound"],
      color: "#8b5cf6"
    },
    {
      id: "world-of-house",
      name: "World of House",
      url: "https://worldofhouse.io",
      description: "Dedicated to house music. Regular free releases from emerging artists.",
      genres: ["house", "deep house", "tech house", "lo-fi house"],
      formats: ["MP3", "WAV"],
      quality: "320kbps",
      tier: 2,
      tierLabel: "Good",
      features: ["house focused", "fresh releases", "emerging artists"],
      color: "#ec4899"
    },
    {
      id: "minimalfreaks",
      name: "MinimalFreaks",
      url: "https://minimalfreaks.net",
      description: "Underground electronic music. Techno, minimal, and experimental.",
      genres: ["techno", "minimal", "tech house", "experimental"],
      formats: ["MP3"],
      quality: "Varies",
      tier: 2,
      tierLabel: "Good",
      features: ["underground", "techno focused", "free downloads"],
      color: "#0d9488"
    },
    {
      id: "techno-raw",
      name: "Techno Raw",
      url: "https://technoraw.net",
      description: "Raw, industrial, and dark techno. Harder styles for the underground scene.",
      genres: ["techno", "industrial", "hard techno", "dark techno"],
      formats: ["MP3"],
      quality: "Varies",
      tier: 2,
      tierLabel: "Good",
      features: ["raw techno", "industrial", "underground"],
      color: "#1e1e1e"
    },

    // ==================== TIER 3 - SPECIALTY SOURCES ====================
    {
      id: "zenon-records",
      name: "Zenon Records",
      url: "https://zenonrecords.bandcamp.com",
      description: "Psychedelic trance and electronic. High-quality releases on Bandcamp.",
      genres: ["psytrance", "progressive psy", "dark psy"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps / Lossless",
      tier: 3,
      tierLabel: "Specialty",
      features: ["psytrance", "quality releases", "bandcamp"],
      color: "#7c2d12"
    },
    {
      id: "anjunadeep",
      name: "Anjunadeep",
      url: "https://anjunadeep.bandcamp.com",
      description: "Melodic house and progressive. Beautiful, emotional electronic music.",
      genres: ["melodic house", "progressive", "deep house", "melodic techno"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps / Lossless",
      tier: 3,
      tierLabel: "Specialty",
      features: ["melodic", "emotional", "quality label"],
      color: "#3b82f6"
    },
    {
      id: "defected-records",
      name: "Defected Records",
      url: "https://defected.bandcamp.com",
      description: "Classic house and disco. Legendary label with free releases.",
      genres: ["house", "disco", "soulful house", "deep house"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Specialty",
      features: ["classic house", "legendary label", "disco vibes"],
      color: "#f43f5e"
    },
    {
      id: "moachin",
      name: "Moachin",
      url: "https://moachin.bandcamp.com",
      description: "Latin electronic and house. Unique fusion sounds.",
      genres: ["latin house", "electronic", "afrobeat"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 3,
      tierLabel: "Specialty",
      features: ["latin flavor", "unique", "emerging"],
      color: "#ea580c"
    },
    {
      id: "beatport",
      name: "Beatport",
      url: "https://www.beatport.com",
      description: "The pro audio marketplace. Free downloads section with weekly picks.",
      genres: ["all electronic"],
      formats: ["MP3", "WAV", "FLAC"],
      quality: "320kbps+",
      tier: 3,
      tierLabel: "Specialty",
      features: ["pro marketplace", "free section", "new releases"],
      color: "#000000"
    },

    // ==================== YOUTUBE CHANNELS (Legal to rip) ====================
    {
      id: "spinnin-records",
      name: "Spinnin' Records",
      url: "https://www.youtube.com/c/SpinninRecords",
      description: "One of the biggest EDM labels. Legal to rip for personal use in most jurisdictions.",
      genres: ["edm", "house", "progressive", "electro"],
      formats: ["YouTube"],
      quality: "YouTube Quality",
      tier: 3,
      tierLabel: "YouTube",
      features: ["huge catalog", "mainstream edm", "legal to rip"],
      color: "#1ca0f2"
    },
    {
      id: "majestic-casual",
      name: "Majestic Casual",
      url: "https://www.youtube.com/c/MajesticCasual",
      description: "Curated deep house and future bass. Excellent production quality.",
      genres: ["deep house", "future bass", "chill electronic"],
      formats: ["YouTube"],
      quality: "YouTube Quality",
      tier: 3,
      tierLabel: "YouTube",
      features: ["curated", "chill vibes", "high quality"],
      color: "#8b5cf6"
    },
    {
      id: "tasty-records",
      name: "Tasty Records",
      url: "https://www.youtube.com/c/OfficialTasty",
      description: "Electronic and house music. Part of the Spinnin' network.",
      genres: ["house", "electronic", "progressive"],
      formats: ["YouTube"],
      quality: "YouTube Quality",
      tier: 3,
      tierLabel: "YouTube",
      features: ["edm", "house", "regular uploads"],
      color: "#f472b6"
    },
    {
      id: "edm-nation",
      name: "EDM Nation",
      url: "https://www.youtube.com/c/EDMNation",
      description: "Electronic dance music curation. High-energy tracks.",
      genres: ["edm", "house", "dubstep", "electro"],
      formats: ["YouTube"],
      quality: "YouTube Quality",
      tier: 3,
      tierLabel: "YouTube",
      features: ["edm", "high energy", "varied genres"],
      color: "#ef4444"
    },
    {
      id: "selected",
      name: "Selected",
      url: "https://www.youtube.com/c/SelectedVEVO",
      description: "Curated electronic music. Deep house and melodic techno focus.",
      genres: ["deep house", "melodic techno", "electronic"],
      formats: ["YouTube"],
      quality: "YouTube Quality",
      tier: 3,
      tierLabel: "YouTube",
      features: ["curated", "melodic focus", "quality mixes"],
      color: "#6366f1"
    },

    // ==================== ADDITIONAL SPECIALTY SOURCES ====================
    {
      id: "traxsource",
      name: "Traxsource",
      url: "https://www.traxsource.com",
      description: "Premier house and techno source. Free tracks available daily.",
      genres: ["house", "techno", "deep house", "tech house"],
      formats: ["MP3", "WAV"],
      quality: "320kbps",
      tier: 2,
      tierLabel: "Good",
      features: ["pro source", "daily free", "house & techno"],
      color: "#0f172a"
    },
    {
      id: "soundcloud",
      name: "SoundCloud",
      url: "https://soundcloud.com/discover",
      description: "Massive artist uploads. Use filters to find free downloadable tracks.",
      genres: ["all electronic"],
      formats: ["MP3 (varies)"],
      quality: "Varies",
      tier: 2,
      tierLabel: "Good",
      features: ["artist uploads", "free downloads filter", "huge catalog"],
      color: "#ff5500"
    },
    {
      id: "archive",
      name: "Internet Archive",
      url: "https://archive.org/details/audio",
      description: "Non-profit library. Extensive electronic music collections and radio shows.",
      genres: ["electronic", "experimental", "ambient", "radio shows"],
      formats: ["MP3", "FLAC"],
      quality: "Varies",
      tier: 2,
      tierLabel: "Good",
      features: ["non-profit", "radio shows", "historical"],
      color: "#000000"
    },
    {
      id: "audiomack",
      name: "AudioMack",
      url: "https://audiomack.com",
      description: "Music streaming and downloads. Many free electronic releases.",
      genres: ["electronic", "hip-hop", "afrobeats"],
      formats: ["MP3"],
      quality: "128-320kbps",
      tier: 2,
      tierLabel: "Good",
      features: ["streaming", "free downloads", "curated"],
      color: "#f59e0b"
    },
    {
      id: "record-union",
      name: "Record Union",
      url: "https://www.recordunion.com",
      description: "Independent distribution. Artists offer free downloads to build fanbase.",
      genres: ["all electronic"],
      formats: ["MP3", "FLAC"],
      quality: "Artist choice",
      tier: 3,
      tierLabel: "Specialty",
      features: ["independent", "artist direct", "free promos"],
      color: "#06b6d4"
    }
  ],

  getGenres: function() {
    const genres = new Set();
    this.sources.forEach(source => {
      source.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  },

  getTierLabel: function(tier) {
    switch(tier) {
      case 1: return 'Best';
      case 2: return 'Good';
      case 3: return 'Specialty';
      default: return '';
    }
  },

  getQualityBadges: function(quality) {
    const badges = [];
    if (quality.includes('Lossless') || quality.includes('FLAC')) {
      badges.push({ text: 'Lossless', color: '#00c853' });
    }
    if (quality.includes('320')) {
      badges.push({ text: '320kbps', color: '#2196f3' });
    }
    if (quality.includes('YouTube')) {
      badges.push({ text: 'YouTube', color: '#ff0000' });
    }
    return badges;
  }
};
