const MusicDB = {
  sources: [
    // ==================== BEST SOURCES ====================
    {
      id: "ektoplazm",
      name: "Ektoplazm",
      url: "https://ektoplazm.com",
      description: "Legendary free music platform. Massive collection of psytrance, techno, and experimental. 28M+ releases served.",
      genres: ["psytrance", "progressive psy", "techno", "electronic", "ambient", "downtempo"],
      formats: ["MP3", "FLAC", "WAV"],
      quality: "320kbps / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["massive catalog", "cc licensed", "free downloads", "verified"],
      color: "#059669",
      status: "verified"
    },
    {
      id: "free-music-archive",
      name: "Free Music Archive",
      url: "https://freemusicarchive.org",
      description: "One of the largest databases of free, legal music downloads. Extensive electronic section powered by Tribe of Noise.",
      genres: ["electronic", "ambient", "experimental", "house", "techno", "psytrance"],
      formats: ["MP3", "FLAC"],
      quality: "Varies",
      tier: 1,
      tierLabel: "Best",
      features: ["huge catalog", "curated collections", "cc licenses", "verified"],
      color: "#0891b2",
      status: "verified"
    },
    {
      id: "bandcamp",
      name: "Bandcamp",
      url: "https://bandcamp.com",
      description: "Support artists directly. Many offer free downloads with purchase or as free releases. Best for quality.",
      genres: ["all electronic"],
      formats: ["MP3", "FLAC", "WAV"],
      quality: "Artist choice",
      tier: 1,
      tierLabel: "Best",
      features: ["support artists", "free releases", "name your price", "verified"],
      color: "#629aa9",
      status: "verified"
    },
    {
      id: "bensound",
      name: "Bensound",
      url: "https://www.bensound.com",
      description: "Royalty-free electronic music for creators. Clean, production-ready tracks. Great for YouTube/streaming.",
      genres: ["electronic", "house", "techno", "downtempo", "cinematic"],
      formats: ["MP3"],
      quality: "128-320kbps",
      tier: 1,
      tierLabel: "Best",
      features: ["royalty free", "production ready", "clean sound", "verified"],
      color: "#8b5cf6",
      status: "verified"
    },

    // ==================== LABELS ON BANDCAMP ====================
    {
      id: "zenon-records",
      name: "Zenon Records",
      url: "https://zenonrecords.bandcamp.com",
      description: "Premier psytrance and electronic label on Bandcamp. High-quality releases with free tracks regularly.",
      genres: ["psytrance", "progressive psy", "dark psy", "electronic"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps / Lossless",
      tier: 2,
      tierLabel: "Label",
      features: ["psytrance", "quality releases", "bandcamp", "verified"],
      color: "#7c2d12",
      status: "verified"
    },
    {
      id: "anjunadeep",
      name: "Anjunadeep",
      url: "https://anjunadeep.bandcamp.com",
      description: "Melodic house and progressive from Anjunadeep. Beautiful, emotional electronic music with free releases.",
      genres: ["melodic house", "progressive", "deep house", "melodic techno"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps / Lossless",
      tier: 2,
      tierLabel: "Label",
      features: ["melodic", "emotional", "quality label", "verified"],
      color: "#3b82f6",
      status: "verified"
    },
    {
      id: "defected-records",
      name: "Defected Records",
      url: "https://defected.bandcamp.com",
      description: "Classic house and disco. Legendary label with free releases. The foundation of modern house music.",
      genres: ["house", "disco", "soulful house", "deep house"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps",
      tier: 2,
      tierLabel: "Label",
      features: ["classic house", "legendary label", "disco vibes", "verified"],
      color: "#f43f5e",
      status: "verified"
    },

    // ==================== MARKETPLACES ====================
    {
      id: "beatport",
      name: "Beatport",
      url: "https://www.beatport.com",
      description: "The pro audio marketplace. Premier source for electronic music with free tracks in their free section.",
      genres: ["all electronic"],
      formats: ["MP3", "WAV", "FLAC"],
      quality: "320kbps+",
      tier: 2,
      tierLabel: "Market",
      features: ["pro marketplace", "free section", "new releases", "verified"],
      color: "#000000",
      status: "verified"
    },
    {
      id: "traxsource",
      name: "Traxsource",
      url: "https://www.traxsource.com",
      description: "Premier house and techno source. Daily free tracks available. The underground alternative to Beatport.",
      genres: ["house", "techno", "deep house", "tech house", "lo-fi"],
      formats: ["MP3", "WAV"],
      quality: "320kbps",
      tier: 2,
      tierLabel: "Market",
      features: ["pro source", "daily free", "house & techno", "verified"],
      color: "#0f172a",
      status: "verified"
    },

    // ==================== STREAMING PLATFORMS ====================
    {
      id: "soundcloud",
      name: "SoundCloud",
      url: "https://soundcloud.com/discover",
      description: "Massive artist uploads. Use filters to find free downloadable tracks. Great for discovering new artists.",
      genres: ["all electronic"],
      formats: ["MP3 (varies)"],
      quality: "Varies",
      tier: 2,
      tierLabel: "Stream",
      features: ["artist uploads", "free downloads filter", "huge catalog", "verified"],
      color: "#ff5500",
      status: "verified"
    },
    {
      id: "audiomack",
      name: "AudioMack",
      url: "https://audiomack.com",
      description: "Music streaming and downloads. Many free electronic releases. Growing platform with fresh talent.",
      genres: ["electronic", "hip-hop", "afrobeats", "trap"],
      formats: ["MP3"],
      quality: "128-320kbps",
      tier: 3,
      tierLabel: "Stream",
      features: ["streaming", "free downloads", "curated", "verified"],
      color: "#f59e0b",
      status: "verified"
    },

    // ==================== ARCHIVES & DISTRIBUTION ====================
    {
      id: "archive",
      name: "Internet Archive",
      url: "https://archive.org/details/audio",
      description: "Non-profit library. Extensive electronic music collections, radio shows, DJ sets, and live recordings.",
      genres: ["electronic", "experimental", "ambient", "radio shows", "dj sets"],
      formats: ["MP3", "FLAC"],
      quality: "Varies",
      tier: 2,
      tierLabel: "Archive",
      features: ["non-profit", "radio shows", "historical", "verified"],
      color: "#000000",
      status: "verified"
    },
    {
      id: "record-union",
      name: "Record Union",
      url: "https://www.recordunion.com",
      description: "Independent distribution platform. Artists often offer free downloads to build fanbase.",
      genres: ["all electronic"],
      formats: ["MP3", "FLAC"],
      quality: "Artist choice",
      tier: 3,
      tierLabel: "Distro",
      features: ["independent", "artist direct", "free promos", "verified"],
      color: "#06b6d4",
      status: "verified"
    },

    // ==================== YOUTUBE (Legal to rip) ====================
    {
      id: "spinnin-records",
      name: "Spinnin' Records",
      url: "https://www.youtube.com/c/SpinninRecords",
      description: "One of the biggest EDM labels. Legal to rip for personal use. Mainstream electronic at its finest.",
      genres: ["edm", "house", "progressive", "electro", "big room"],
      formats: ["YouTube"],
      quality: "YouTube Quality",
      tier: 3,
      tierLabel: "YouTube",
      features: ["huge catalog", "mainstream edm", "legal to rip", "verified"],
      color: "#1ca0f2"
    },
    {
      id: "majestic-casual",
      name: "Majestic Casual",
      url: "https://www.youtube.com/c/MajesticCasual",
      description: "Curated deep house and future bass. Excellent production quality. The gold standard for chill electronic.",
      genres: ["deep house", "future bass", "chill electronic", "indie dance"],
      formats: ["YouTube"],
      quality: "YouTube Quality",
      tier: 3,
      tierLabel: "YouTube",
      features: ["curated", "chill vibes", "high quality", "verified"],
      color: "#8b5cf6"
    },
    {
      id: "selected",
      name: "Selected",
      url: "https://www.youtube.com/c/SelectedVEVO",
      description: "Curated electronic music. Deep house and melodic techno focus. Quality over quantity.",
      genres: ["deep house", "melodic techno", "electronic", "progressive"],
      formats: ["YouTube"],
      quality: "YouTube Quality",
      tier: 3,
      tierLabel: "YouTube",
      features: ["curated", "melodic focus", "quality mixes", "verified"],
      color: "#6366f1"
    },
    {
      id: "edm-nation",
      name: "EDM Nation",
      url: "https://www.youtube.com/c/EDMNation",
      description: "Electronic dance music curation. High-energy tracks from established and upcoming artists.",
      genres: ["edm", "house", "dubstep", "electro", "hardstyle"],
      formats: ["YouTube"],
      quality: "YouTube Quality",
      tier: 3,
      tierLabel: "YouTube",
      features: ["edm", "high energy", "varied genres", "verified"],
      color: "#ef4444"
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
