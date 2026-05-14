const MusicDB = {
  sources: [
    // ==================== UNIVERSAL SOURCES ====================
    {
      id: "freemusicarchive",
      name: "Free Music Archive — House, Techno & Progressive",
      url: "https://freemusicarchive.org/genre/House",
      description: "La mayor base de datos de música gratuita legal con licencia Creative Commons. Miles de tracks de house, techno y progressive. Descarga directa MP3.",
      genres: ["house", "techno", "progressive house", "electronic", "ambient", "experimental"],
      formats: ["MP3"],
      quality: "Varies (128-320kbps)",
      tier: 1,
      tierLabel: "Best",
      features: ["direct downloads", "huge catalog", "cc licensed", "no account needed"],
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
      tierLabel: "Good",
      features: ["direct downloads", "large catalog", "free downloads", "artist profiles"],
      color: "#f59e0b"
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
    },

    // ==================== BARCELONA & SPANISH NETLABELS ====================
    {
      id: "soisloscerdos",
      name: "Soisloscerdos Netlabel",
      url: "https://soisloscerdos.bandcamp.com",
      description: "Netlabel de Barcelona. Acid, techno, electro e industrial bajo licencias Creative Commons. Name your price (gratis). M\u00e1s de 80 lanzamientos desde 2012.",
      genres: ["techno", "acid", "house", "minimal", "electronic", "industrial"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["barcelona", "creative commons", "name your price", "80+ releases", "spanish netlabel"],
      color: "#e91e63"
    },
    {
      id: "inoquo",
      name: "inoQuo Netlabel",
      url: "https://inoquo.bandcamp.com",
      description: "Netlabel barcelon\u00e9s de minimal techno y tech house. Todos los lanzamientos son gratis \u2014 descarga directa sin pagar. Activista de la cultura libre.",
      genres: ["minimal", "techno", "tech house", "acid", "electronic"],
      formats: ["MP3", "FLAC"],
      quality: "16-bit / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["barcelona", "completely free", "direct download", "free culture", "spanish netlabel"],
      color: "#ff6f00"
    },
    {
      id: "love-for-your-ears",
      name: "Love For Your Ears",
      url: "https://loveforyourears.bandcamp.com",
      description: "Netlabel gratuita espa\u00f1ola. Techno futurista, dark, post-punk, synthpop. Descarga completamente gratis \u2014 no es name your price, es realmente free download.",
      genres: ["techno", "electronic", "industrial", "minimal", "dark"],
      formats: ["MP3", "FLAC"],
      quality: "16-bit / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["spanish netlabel", "completely free", "free download", "no payment required"],
      color: "#00bcd4"
    },
    {
      id: "magnetic-netlabel",
      name: "Magnetic NetLabel",
      url: "https://magneticnetlabel.bandcamp.com",
      description: "Netlabel gallega (A Coru\u00f1a) especializada en techno, minimal y house. M\u00e1s de 40 lanzamientos. Name your price (gratis). Descarga directa MP3/FLAC.",
      genres: ["techno", "minimal", "house", "microhouse", "electronic"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps / 16-bit FLAC",
      tier: 1,
      tierLabel: "Best",
      features: ["spanish netlabel", "name your price", "direct download", "40+ releases"],
      color: "#7c4dff"
    },
    {
      id: "jm-articonetlabel",
      name: "JM \u2014 ArtiConetlabel",
      url: "https://jm-articonetlabel.bandcamp.com",
      description: "Netlabel de Madrid. Techno, acid, IDM, electro y ambient. Cultura libre y activismo creative commons. Descarga gratuita.",
      genres: ["techno", "acid", "idm", "electro", "ambient", "experimental"],
      formats: ["MP3", "FLAC"],
      quality: "16-bit / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["madrid", "free download", "creative commons", "spanish netlabel"],
      color: "#00c853"
    },
    {
      id: "nada-espacial",
      name: "Nada Espacial",
      url: "https://nadaespacial.bandcamp.com",
      description: "Netlabel underground de Mallorca. Minimal, techno y electr\u00f3nica balear con tintes oscuros. Name your price (gratis). Sello isle\u00f1o con vibra mediterr\u00e1nea.",
      genres: ["minimal", "techno", "balearic", "house", "electronic"],
      formats: ["MP3", "FLAC"],
      quality: "16-bit / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["mallorca", "balearic", "name your price", "spanish netlabel", "mediterranean"],
      color: "#0097a7"
    },
    {
      id: "subversive-media",
      name: "Subversive Media Netlabel",
      url: "https://www.subversivemedia.org",
      description: "Netlabel independiente de Barcelona (2007-2011). 17 EPs de minimal y techno, m\u00e1s de 110 tracks, m\u00e1s de 75,000 descargas. Archivo gratuito disponible.",
      genres: ["minimal", "techno", "house", "electronic"],
      formats: ["MP3"],
      quality: "320kbps",
      tier: 2,
      tierLabel: "Archive",
      features: ["barcelona", "archived", "direct download", "historical", "spanish netlabel"],
      color: "#546e7a"
    },
    {
      id: "retrofract",
      name: "Retrofract",
      url: "https://retrofract.bandcamp.com",
      description: "Productor de Granada con vibra balearica y house veraniego. Lanzamientos name your price (gratis). Mood Balearica EP y m\u00e1s.",
      genres: ["balearic", "house", "deep house", "electronic", "summer"],
      formats: ["MP3", "FLAC"],
      quality: "16-bit / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["granada", "balearic", "name your price", "summer vibes", "spanish producer"],
      color: "#ffab00"
    },

    // ==================== SPECIALIZED EUROPEAN NETLABELS ====================
    {
      id: "ektoplazm",
      name: "Ektoplazm \u2014 Free Music Portal",
      url: "https://ektoplazm.com/free-music",
      description: "Portal legendario de m\u00fasica gratuita. Tiene releases balearics, downtempo, progressive y psytrance. Descarga directa MP3/FLAC/WAV. Licencias Creative Commons.",
      genres: ["psytrance", "progressive psy", "progressive house", "balearic", "downtempo", "electronic", "ambient"],
      formats: ["MP3", "FLAC", "WAV"],
      quality: "320kbps / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["direct downloads", "massive catalog", "balearic releases", "cc licenses", "lossless"],
      color: "#059669"
    },
    {
      id: "monofonicos",
      name: "Monof\u00f3nicos Netlabel",
      url: "https://monofonicos.bandcamp.com",
      description: "Netlabel colombiana con 15+ a\u00f1os de trayectoria. House, techno, deep house, minimal y dub techno. Descarga directa MP3/FLAC/WAV en su sitio web.",
      genres: ["house", "techno", "deep house", "minimal", "dub techno", "progressive house"],
      formats: ["MP3", "FLAC", "WAV"],
      quality: "320kbps / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["direct download", "15+ years", "large catalog", "free downloads", "latin american"],
      color: "#d32f2f"
    },
    {
      id: "forward-music",
      name: "Forward Music",
      url: "https://forwardmusiclabel.bandcamp.com",
      description: "Sello belga especializado en progressive house y deep progressive. Compilaciones gratuitas masivas como 'The 100 Vol. 1'. Name your price (gratis).",
      genres: ["progressive house", "deep house", "melodic techno", "organic house", "electronic"],
      formats: ["MP3", "FLAC"],
      quality: "320kbps / Lossless",
      tier: 1,
      tierLabel: "Best",
      features: ["belgian label", "name your price", "free compilations", "progressive focus", "direct download"],
      color: "#aa00ff"
    }
  ],

  getGenres: function() {
    const genres = new Set();
    this.sources.forEach(source => {
      source.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  },

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
