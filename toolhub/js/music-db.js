const MusicDB = {
  sources: [
    // ==================== VERIFIED FREE DOWNLOAD SOURCES ====================
    {
      id: "freemusicarchive",
      name: "Free Music Archive",
      url: "https://freemusicarchive.org",
      description: "One of the largest databases of free, legal music downloads. Extensive electronic section with direct downloads.",
      genres: ["electronic", "house", "techno", "progressive", "ambient", "experimental"],
      formats: ["MP3", "FLAC"],
      quality: "Varies (128-320kbps)",
      tier: 1,
      tierLabel: "Best",
      features: ["direct downloads", "huge catalog", "curated collections", "cc licenses"],
      color: "#0891b2"
    },
    {
      id: "jamendo",
      name: "Jamendo",
      url: "https://www.jamendo.com",
      description: "Independent music platform with thousands of electronic tracks. Free direct downloads available.",
      genres: ["electronic", "house", "techno", "progressive", "trance", "ambient"],
      formats: ["MP3"],
      quality: "128-320kbps",
      tier: 1,
      tierLabel: "Best",
      features: ["direct downloads", "large catalog", "free downloads", "artist profiles"],
      color: "#f59e0b"
    },
    {
      id: "ektoplazm",
      name: "Ektoplazm",
      url: "https://ektoplazm.com",
      description: "Legendary free music platform for psytrance and progressive electronic. Direct MP3/FLAC downloads.",
      genres: ["psytrance", "progressive psy", "progressive house", "electronic", "ambient"],
      formats: ["MP3", "FLAC", "WAV"],
      quality: "320kbps / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["direct downloads", "massive catalog", "free releases", "cc licenses"],
      color: "#059669"
    },
    {
      id: "bensound",
      name: "Bensound",
      url: "https://www.bensound.com",
      description: "Royalty-free electronic music for creators. Direct downloads with license options.",
      genres: ["electronic", "house", "techno", "progressive", "downtempo", "cinematic"],
      formats: ["MP3"],
      quality: "128-320kbps",
      tier: 2,
      tierLabel: "Good",
      features: ["direct downloads", "royalty free", "production ready", "clean sound"],
      color: "#8b5cf6"
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
