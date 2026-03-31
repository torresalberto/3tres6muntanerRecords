const CamelotDB = {
  keys: [
    // A KEYS (Minor - Energetic/Driving)
    // Classic house/garage vibes
    { id: "1A", number: 1, letter: "A", key: "G# Minor", energy: "low", bpmRange: "80-100", bpmTypical: "90", genre: "Deep House, Garage, Lo-Fi" },
    // Warm, soulful deep house
    { id: "2A", number: 2, letter: "A", key: "D# Minor", energy: "low", bpmRange: "100-118", bpmTypical: "110", genre: "Deep House, Soulful House" },
    // Classic house territory
    { id: "3A", number: 3, letter: "A", key: "B Minor", energy: "medium", bpmRange: "118-124", bpmTypical: "122", genre: "Deep House, Classic House" },
    // Mainstream house
    { id: "4A", number: 4, letter: "A", key: "F# Minor", energy: "medium", bpmRange: "120-126", bpmTypical: "124", genre: "House, Future House" },
    // Tech house sweet spot
    { id: "5A", number: 5, letter: "A", key: "C# Minor", energy: "medium", bpmRange: "124-130", bpmTypical: "127", genre: "Tech House, House" },
    // Progressive/electro
    { id: "6A", number: 6, letter: "A", key: "G# Minor", energy: "high", bpmRange: "126-132", bpmTypical: "128", genre: "Progressive House, Electro House" },
    // Trance territory
    { id: "7A", number: 7, letter: "A", key: "D# Minor", energy: "high", bpmRange: "130-140", bpmTypical: "138", genre: "Trance, Uplifting" },
    // Psytrance
    { id: "8A", number: 8, letter: "A", key: "A# Minor", energy: "high", bpmRange: "138-146", bpmTypical: "142", genre: "Psytrance, Goa" },
    // Hard techno
    { id: "9A", number: 9, letter: "A", key: "F Minor", energy: "very high", bpmRange: "140-155", bpmTypical: "148", genre: "Hard Techno, Industrial" },
    // Hardcore
    { id: "10A", number: 10, letter: "A", key: "C Minor", energy: "very high", bpmRange: "150-175", bpmTypical: "160", genre: "Hardcore, Frenchcore" },
    // Hardstyle
    { id: "11A", number: 11, letter: "A", key: "G Minor", energy: "very high", bpmRange: "170-180", bpmTypical: "175", genre: "Hardstyle" },
    // Dubstep territory
    { id: "12A", number: 12, letter: "A", key: "D Minor", energy: "high", bpmRange: "138-145", bpmTypical: "140", genre: "Dubstep, Bass" },

    // B KEYS (Major - Atmospheric/Melodic)
    // Chill/ambient
    { id: "1B", number: 1, letter: "B", key: "G# Major", energy: "low", bpmRange: "80-100", bpmTypical: "90", genre: "Deep House, Chillout" },
    // Deep melodic
    { id: "2B", number: 2, letter: "B", key: "D# Major", energy: "low", bpmRange: "100-118", bpmTypical: "110", genre: "Deep House, Melodic House" },
    // Classic house
    { id: "3B", number: 3, letter: "B", key: "B Major", energy: "medium", bpmRange: "118-124", bpmTypical: "122", genre: "Deep House, Classic House" },
    // Mainstream house
    { id: "4B", number: 4, letter: "B", key: "F# Major", energy: "medium", bpmRange: "120-126", bpmTypical: "124", genre: "House, Future House" },
    // Tech house
    { id: "5B", number: 5, letter: "B", key: "C# Major", energy: "medium", bpmRange: "124-130", bpmTypical: "127", genre: "Tech House, House" },
    // Progressive
    { id: "6B", number: 6, letter: "B", key: "G# Major", energy: "high", bpmRange: "126-132", bpmTypical: "128", genre: "Progressive House, Melodic Techno" },
    // Trance
    { id: "7B", number: 7, letter: "B", key: "D# Major", energy: "high", bpmRange: "130-140", bpmTypical: "138", genre: "Trance, Uplifting" },
    // Psytrance
    { id: "8B", number: 8, letter: "B", key: "A# Major", energy: "high", bpmRange: "138-146", bpmTypical: "142", genre: "Psytrance, Goa" },
    // Hard techno
    { id: "9B", number: 9, letter: "B", key: "F Major", energy: "very high", bpmRange: "140-155", bpmTypical: "148", genre: "Hard Techno, Industrial" },
    // Hardcore
    { id: "10B", number: 10, letter: "B", key: "C Major", energy: "very high", bpmRange: "150-175", bpmTypical: "160", genre: "Hardcore, Frenchcore" },
    // Hardstyle
    { id: "11B", number: 11, letter: "B", key: "G Major", energy: "very high", bpmRange: "170-180", bpmTypical: "175", genre: "Hardstyle" },
    // Dubstep
    { id: "12B", number: 12, letter: "B", key: "D Major", energy: "high", bpmRange: "138-145", bpmTypical: "140", genre: "Dubstep, Bass" }
  ],

  // Energy levels for display
  energyLevels: {
    low: { label: "Low Energy", color: "#4ade80", icon: "🟢" },
    medium: { label: "Medium Energy", color: "#fbbf24", icon: "🟡" },
    high: { label: "High Energy", color: "#f97316", icon: "🟠" },
    "very high": { label: "Very High Energy", color: "#ef4444", icon: "🔴" }
  },

  // Compatibility types
  compatibilityTypes: {
    perfect: { label: "Perfect Match", description: "Same key, seamless mix", color: "#00c853" },
    energyUp: { label: "Energy Up", description: "Build energy for the drop", color: "#2196f3" },
    energyDown: { label: "Energy Down", description: "Cool down the crowd", color: "#f44336" },
    energyShift: { label: "Energy Shift", description: "Change vibe (A↔B)", color: "#9c27b0" },
    adjacent: { label: "Adjacent", description: "Compatible but different energy", color: "#ff9800" }
  },

  // Get key by ID
  getKey: function(id) {
    return this.keys.find(k => k.id === id);
  },

  // Get all compatible keys for a given key
  getCompatibleKeys: function(keyId) {
    const key = this.getKey(keyId);
    if (!key) return [];

    const compatible = [];
    const num = key.number;
    const letter = key.letter;

    this.keys.forEach(k => {
      if (k.id === keyId) return;

      let type = null;

      // Same number, same letter - Perfect
      if (k.number === num && k.letter === letter) {
        type = "perfect";
      }
      // Same number, different letter - Energy Shift
      else if (k.number === num && k.letter !== letter) {
        type = "energyShift";
      }
      // +1 number, same letter - Energy Up
      else if (k.number === ((num % 12) + 1) && k.letter === letter) {
        type = "energyUp";
      }
      // -1 number, same letter - Energy Down
      else if (k.number === ((num === 1 ? 12 : num) - 1) && k.letter === letter) {
        type = "energyDown";
      }
      // +1 number, different letter - Adjacent
      else if (k.number === ((num % 12) + 1) && k.letter !== letter) {
        type = "adjacent";
      }
      // -1 number, different letter - Adjacent
      else if (k.number === ((num === 1 ? 12 : num) - 1) && k.letter !== letter) {
        type = "adjacent";
      }

      if (type) {
        compatible.push({ key: k, type: type });
      }
    });

    return compatible;
  },

  // Get genre suggestions based on BPM
  getGenreSuggestions: function(bpm) {
    const bpmNum = parseInt(bpm);
    if (!bpmNum) return [];

    const genres = [];
    if (bpmNum >= 80 && bpmNum <= 100) genres.push({ name: "Deep House", bpm: "80-100" });
    if (bpmNum >= 100 && bpmNum <= 118) genres.push({ name: "Deep House", bpm: "100-118" });
    if (bpmNum >= 118 && bpmNum <= 124) genres.push({ name: "House", bpm: "118-124" });
    if (bpmNum >= 120 && bpmNum <= 126) genres.push({ name: "Future House", bpm: "120-126" });
    if (bpmNum >= 124 && bpmNum <= 130) genres.push({ name: "Tech House", bpm: "124-130" });
    if (bpmNum >= 126 && bpmNum <= 132) genres.push({ name: "Progressive House", bpm: "126-132" });
    if (bpmNum >= 130 && bpmNum <= 140) genres.push({ name: "Trance", bpm: "130-140" });
    if (bpmNum >= 138 && bpmNum <= 146) genres.push({ name: "Psytrance", bpm: "138-146" });
    if (bpmNum >= 140 && bpmNum <= 155) genres.push({ name: "Hard Techno", bpm: "140-155" });
    if (bpmNum >= 150 && bpmNum <= 175) genres.push({ name: "Hardcore", bpm: "150-175" });
    if (bpmNum >= 170 && bpmNum <= 180) genres.push({ name: "Hardstyle", bpm: "170-180" });
    if (bpmNum >= 138 && bpmNum <= 145) genres.push({ name: "Dubstep", bpm: "138-145" });

    return genres;
  },

  // Get all keys as sorted array
  getAllKeys: function() {
    return [...this.keys];
  },

  // Get A keys only
  getAKeys: function() {
    return this.keys.filter(k => k.letter === "A");
  },

  // Get B keys only
  getBKeys: function() {
    return this.keys.filter(k => k.letter === "B");
  }
};
