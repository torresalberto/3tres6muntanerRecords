const CamelotDB = {
  keys: [
    // A KEYS (Minor - Energetic/Driving)
    { id: "1A", number: 1, letter: "A", key: "G# Minor", energy: "low", bpmRange: "70-90" },
    { id: "2A", number: 2, letter: "A", key: "D# Minor", energy: "low", bpmRange: "85-100" },
    { id: "3A", number: 3, letter: "A", key: "B Minor", energy: "medium", bpmRange: "95-115" },
    { id: "4A", number: 4, letter: "A", key: "F# Minor", energy: "medium", bpmRange: "110-125" },
    { id: "5A", number: 5, letter: "A", key: "C# Minor", energy: "medium", bpmRange: "120-128" },
    { id: "6A", number: 6, letter: "A", key: "G# Minor", energy: "high", bpmRange: "125-135" },
    { id: "7A", number: 7, letter: "A", key: "D# Minor", energy: "high", bpmRange: "130-145" },
    { id: "8A", number: 8, letter: "A", key: "A# Minor", energy: "high", bpmRange: "140-150" },
    { id: "9A", number: 9, letter: "A", key: "F Minor", energy: "very high", bpmRange: "145-160" },
    { id: "10A", number: 10, letter: "A", key: "C Minor", energy: "very high", bpmRange: "155-175" },
    { id: "11A", number: 11, letter: "A", key: "G Minor", energy: "very high", bpmRange: "170-180" },
    { id: "12A", number: 12, letter: "A", key: "D Minor", energy: "high", bpmRange: "140-155" },

    // B KEYS (Major - Atmospheric/Melodic)
    { id: "1B", number: 1, letter: "B", key: "G# Major", energy: "low", bpmRange: "70-90" },
    { id: "2B", number: 2, letter: "B", key: "D# Major", energy: "low", bpmRange: "85-100" },
    { id: "3B", number: 3, letter: "B", key: "B Major", energy: "medium", bpmRange: "95-115" },
    { id: "4B", number: 4, letter: "B", key: "F# Major", energy: "medium", bpmRange: "110-125" },
    { id: "5B", number: 5, letter: "B", key: "C# Major", energy: "medium", bpmRange: "120-128" },
    { id: "6B", number: 6, letter: "B", key: "G# Major", energy: "high", bpmRange: "125-135" },
    { id: "7B", number: 7, letter: "B", key: "D# Major", energy: "high", bpmRange: "130-145" },
    { id: "8B", number: 8, letter: "B", key: "A# Major", energy: "high", bpmRange: "140-150" },
    { id: "9B", number: 9, letter: "B", key: "F Major", energy: "very high", bpmRange: "145-160" },
    { id: "10B", number: 10, letter: "B", key: "C Major", energy: "very high", bpmRange: "155-175" },
    { id: "11B", number: 11, letter: "B", key: "G Major", energy: "very high", bpmRange: "170-180" },
    { id: "12B", number: 12, letter: "B", key: "D Major", energy: "high", bpmRange: "140-155" }
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
    if (bpmNum >= 60 && bpmNum <= 100) genres.push({ name: "Deep House", bpm: "100-124" });
    if (bpmNum >= 118 && bpmNum <= 128) genres.push({ name: "House", bpm: "120-128" });
    if (bpmNum >= 120 && bpmNum <= 130) genres.push({ name: "Tech House", bpm: "125-130" });
    if (bpmNum >= 125 && bpmNum <= 135) genres.push({ name: "Progressive House", bpm: "125-135" });
    if (bpmNum >= 130 && bpmNum <= 145) genres.push({ name: "Trance", bpm: "130-145" });
    if (bpmNum >= 135 && bpmNum <= 150) genres.push({ name: "Psytrance", bpm: "140-150" });
    if (bpmNum >= 138 && bpmNum <= 145) genres.push({ name: "Hard Techno", bpm: "138-145" });
    if (bpmNum >= 140 && bpmRange <= 155) genres.push({ name: "Techno", bpm: "140-150" });
    if (bpmNum >= 170 && bpmNum <= 180) genres.push({ name: "Hardstyle", bpm: "170-180" });

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
