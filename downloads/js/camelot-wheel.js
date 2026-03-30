const CamelotWheel = {
  selectedKey: null,
  container: null,
  wheelSvg: null,

  // Configuration
  config: {
    size: 420,
    innerRadius: 100,
    outerRadius: 200,
    centerRadius: 70,
    gap: 2
  },

  // Colors
  colors: {
    // A keys (orange/energetic)
    a: {
      1: "#ff6b35", 2: "#ff8c42", 3: "#ffab4c", 4: "#ffc857",
      5: "#ffd166", 6: "#ffaa5b", 7: "#ff8a47", 8: "#ff6b35",
      9: "#e85d04", 10: "#dc2f02", 11: "#d00000", 12: "#9d0208"
    },
    // B keys (blue/atmospheric)
    b: {
      1: "#00d4ff", 2: "#00b4d8", 3: "#48cae4", 4: "#90e0ef",
      5: "#ade8f4", 6: "#023e8a", 7: "#0077b6", 8: "#00b4d8",
      9: "#0096c7", 10: "#0077b6", 11: "#023e8a", 12: "#03045e"
    },
    // Selected/hover
    selected: "#ffffff",
    hover: "rgba(255, 255, 255, 0.3)",
    compatiblePerfect: "#00c853",
    compatibleEnergyUp: "#2196f3",
    compatibleEnergyDown: "#f44336",
    compatibleEnergyShift: "#9c27b0",
    compatibleAdjacent: "#ff9800"
  },

  init: function() {
    this.container = document.getElementById('camelotWheel');
    if (!this.container) return;

    this.renderWheel();
    this.bindEvents();
    this.initBpmConverter();
  },

  renderWheel: function() {
    const { size, innerRadius, outerRadius, centerRadius, gap } = this.config;
    const center = size / 2;
    const keys = CamelotDB.getAllKeys();
    
    // Create SVG
    let svg = `<svg id="wheelSvg" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Defs for gradients and filters
    svg += `<defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>`;

    // Draw outer segments
    keys.forEach((key, index) => {
      const angle = (index * 15 - 90) * (Math.PI / 180);
      const nextAngle = ((index + 1) * 15 - 90) * (Math.PI / 180);
      
      const startX = center + innerRadius * Math.cos(angle);
      const startY = center + innerRadius * Math.sin(angle);
      const endX = center + outerRadius * Math.cos(angle);
      const endY = center + outerRadius * Math.sin(angle);
      const nextStartX = center + innerRadius * Math.cos(nextAngle);
      const nextStartY = center + innerRadius * Math.sin(nextAngle);
      const nextEndX = center + outerRadius * Math.cos(nextAngle);
      const nextEndY = center + outerRadius * Math.sin(nextAngle);

      const color = key.letter === "A" ? this.colors.a[key.number] : this.colors.b[key.number];
      
      const path = `
        <path 
          class="wheel-segment" 
          data-key="${key.id}"
          d="M ${startX} ${startY} L ${endX} ${endY} A ${outerRadius} ${outerRadius} 0 0 1 ${nextEndX} ${nextEndY} L ${nextStartX} ${nextStartY} A ${innerRadius} ${innerRadius} 0 0 0 ${startX} ${startY}"
          fill="${color}"
          stroke="rgba(0,0,0,0.3)"
          stroke-width="1"
        />
      `;
      svg += path;

      // Add key label
      const midAngle = (index * 15 + 7.5 - 90) * (Math.PI / 180);
      const labelRadius = (innerRadius + outerRadius) / 2;
      const labelX = center + labelRadius * Math.cos(midAngle);
      const labelY = center + labelRadius * Math.sin(midAngle);
      
      svg += `
        <text 
          x="${labelX}" 
          y="${labelY}" 
          class="wheel-label"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="white"
          font-weight="700"
          font-size="14"
        >${key.id}</text>
      `;
    });

    // Center circle background
    svg += `
      <circle 
        cx="${center}" 
        cy="${center}" 
        r="${centerRadius}" 
        fill="#141414"
        stroke="#333"
        stroke-width="2"
      />
    `;

    // Center text placeholder (will be updated on selection)
    svg += `
      <text 
        id="centerLabel" 
        x="${center}" 
        y="${center}" 
        text-anchor="middle" 
        dominant-baseline="middle"
        class="center-label"
        fill="#888"
        font-size="14"
      >Select a key</text>
    `;

    svg += '</svg>';
    this.container.innerHTML = svg;
    this.wheelSvg = document.getElementById('wheelSvg');
  },

  bindEvents: function() {
    const segments = document.querySelectorAll('.wheel-segment');
    
    segments.forEach(segment => {
      segment.addEventListener('click', (e) => {
        const keyId = e.target.dataset.key;
        this.selectKey(keyId);
      });

      segment.addEventListener('mouseenter', (e) => {
        if (!this.selectedKey) {
          e.target.style.filter = "brightness(1.2)";
        }
      });

      segment.addEventListener('mouseleave', (e) => {
        e.target.style.filter = "";
      });
    });
  },

  selectKey: function(keyId) {
    // Remove previous selection
    document.querySelectorAll('.wheel-segment').forEach(seg => {
      seg.classList.remove('selected', 'compatible-perfect', 'compatible-energy-up', 'compatible-energy-down', 'compatible-energy-shift', 'compatible-adjacent');
      seg.style.filter = "";
      seg.style.opacity = "1";
    });

    this.selectedKey = keyId;
    const key = CamelotDB.getKey(keyId);
    const compatible = CamelotDB.getCompatibleKeys(keyId);

    // Highlight selected key
    const selectedSegment = document.querySelector(`.wheel-segment[data-key="${keyId}"]`);
    if (selectedSegment) {
      selectedSegment.classList.add('selected');
      selectedSegment.style.filter = "url(#glow)";
    }

    // Dim incompatible keys, highlight compatible ones
    const compatibleIds = compatible.map(c => c.key.id);
    document.querySelectorAll('.wheel-segment').forEach(seg => {
      const segKey = seg.dataset.key;
      if (segKey !== keyId && !compatibleIds.includes(segKey)) {
        seg.style.opacity = "0.3";
      }
    });

    // Highlight compatible keys
    compatible.forEach(comp => {
      const compSegment = document.querySelector(`.wheel-segment[data-key="${comp.key.id}"]`);
      if (compSegment) {
        compSegment.classList.add(`compatible-${comp.type.replace('Up', '-up').replace('Down', '-down').replace('Shift', '-shift')}`);
        compSegment.style.opacity = "1";
        compSegment.style.filter = "url(#glow)";
      }
    });

    // Update center label
    this.updateCenterLabel(key);

    // Update info panel
    this.updateInfoPanel(key, compatible);
  },

  updateCenterLabel: function(key) {
    const centerLabel = document.getElementById('centerLabel');
    if (centerLabel && key) {
      centerLabel.textContent = key.id;
      centerLabel.setAttribute('fill', key.letter === 'A' ? this.colors.a[key.number] : this.colors.b[key.number]);
      centerLabel.style.fontSize = "28";
      centerLabel.style.fontWeight = "700";
    }
  },

  updateInfoPanel: function(key, compatible) {
    if (!key) return;

    // Update key info
    const keyInfo = document.getElementById('keyInfo');
    if (keyInfo) {
      const energyData = CamelotDB.energyLevels[key.energy];
      keyInfo.innerHTML = `
        <div class="selected-key-header">
          <span class="selected-key-id">${key.id}</span>
          <span class="selected-musical-key">${key.key}</span>
        </div>
        <div class="selected-key-meta">
          <span class="key-type">${key.letter === 'A' ? 'Minor (Energetic)' : 'Major (Atmospheric)'}</span>
          <span class="key-energy" style="color: ${energyData.color}">${energyData.icon} ${energyData.label}</span>
        </div>
      `;
    }

    // Update compatible keys
    const compatibleContainer = document.getElementById('compatibleKeys');
    if (compatibleContainer) {
      // Group by type
      const grouped = {
        perfect: compatible.filter(c => c.type === 'perfect'),
        energyUp: compatible.filter(c => c.type === 'energyUp'),
        energyDown: compatible.filter(c => c.type === 'energyDown'),
        energyShift: compatible.filter(c => c.type === 'energyShift'),
        adjacent: compatible.filter(c => c.type === 'adjacent')
      };

      let html = '';
      
      if (grouped.perfect.length) {
        html += this.renderCompatibleGroup('Perfect Match', grouped.perfect, '#00c853');
      }
      if (grouped.energyUp.length) {
        html += this.renderCompatibleGroup('Energy Up ↑', grouped.energyUp, '#2196f3');
      }
      if (grouped.energyDown.length) {
        html += this.renderCompatibleGroup('Energy Down ↓', grouped.energyDown, '#f44336');
      }
      if (grouped.energyShift.length) {
        html += this.renderCompatibleGroup('Energy Shift', grouped.energyShift, '#9c27b0');
      }
      if (grouped.adjacent.length) {
        html += this.renderCompatibleGroup('Adjacent', grouped.adjacent, '#ff9800');
      }

      compatibleContainer.innerHTML = html;

      // Add click handlers to compatible key buttons
      compatibleContainer.querySelectorAll('.compatible-key-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectKey(btn.dataset.key);
        });
      });
    }
  },

  renderCompatibleGroup: function(title, keys, color) {
    return `
      <div class="compatible-group">
        <div class="compatible-group-header" style="border-left-color: ${color}">
          ${title}
        </div>
        <div class="compatible-keys-list">
          ${keys.map(c => `
            <button class="compatible-key-btn" data-key="${c.key.id}" style="background: ${color}20; border-color: ${color}; color: ${color}">
              ${c.key.id}
              <span class="compatible-key-musical">${c.key.key}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  initBpmConverter: function() {
    const bpmInput = document.getElementById('bpmInput');
    const genreSuggestions = document.getElementById('genreSuggestions');
    
    if (bpmInput && genreSuggestions) {
      bpmInput.addEventListener('input', (e) => {
        const bpm = e.target.value;
        if (bpm && bpm >= 60 && bpm <= 200) {
          const genres = [
            { name: "Deep House", min: 100, max: 124 },
            { name: "House", min: 118, max: 128 },
            { name: "Tech House", min: 120, max: 130 },
            { name: "Progressive House", min: 125, max: 135 },
            { name: "Trance", min: 130, max: 145 },
            { name: "Psytrance", min: 138, max: 150 },
            { name: "Hard Techno", min: 138, max: 145 },
            { name: "Techno", min: 125, max: 150 },
            { name: "Dubstep", min: 140, max: 145 },
            { name: "Drum & Bass", min: 160, max: 180 },
            { name: "Hardstyle", min: 150, max: 165 }
          ];

          const matches = genres.filter(g => bpm >= g.min && bpm <= g.max);
          
          if (matches.length > 0) {
            genreSuggestions.innerHTML = `
              <div class="genre-matches">
                <span class="genre-label">Matching genres:</span>
                <div class="genre-tags">
                  ${matches.map(g => `<span class="genre-tag-bpm">${g.name}</span>`).join('')}
                </div>
              </div>
            `;
          } else {
            // Find closest genres
            const closest = genres.sort((a, b) => {
              const distA = Math.min(Math.abs(a.min - bpm), Math.abs(a.max - bpm));
              const distB = Math.min(Math.abs(b.min - bpm), Math.abs(b.max - bpm));
              return distA - distB;
            }).slice(0, 3);

            genreSuggestions.innerHTML = `
              <div class="genre-matches">
                <span class="genre-label">Nearby genres:</span>
                <div class="genre-tags">
                  ${closest.map(g => `<span class="genre-tag-bpm">${g.name} (${g.min}-${g.max})</span>`).join('')}
                </div>
              </div>
            `;
          }
        } else {
          genreSuggestions.innerHTML = '';
        }
      });
    }
  },

  // Clear selection
  clearSelection: function() {
    this.selectedKey = null;
    document.querySelectorAll('.wheel-segment').forEach(seg => {
      seg.classList.remove('selected', 'compatible-perfect', 'compatible-energy-up', 'compatible-energy-down', 'compatible-energy-shift', 'compatible-adjacent');
      seg.style.filter = "";
      seg.style.opacity = "1";
    });

    const centerLabel = document.getElementById('centerLabel');
    if (centerLabel) {
      centerLabel.textContent = "Select a key";
      centerLabel.setAttribute('fill', '#888');
      centerLabel.style.fontSize = "14";
      centerLabel.style.fontWeight = "400";
    }

    const keyInfo = document.getElementById('keyInfo');
    if (keyInfo) {
      keyInfo.innerHTML = '<p class="placeholder-text">Click on a key in the wheel to see compatible tracks</p>';
    }

    const compatibleContainer = document.getElementById('compatibleKeys');
    if (compatibleContainer) {
      compatibleContainer.innerHTML = '';
    }
  }
};
