const HardwareGuide = {
  state: {
    devices: [],
    filteredDevices: [],
    selectedForCompare: [],
    expandedCard: null,
    activeBrandFilter: 'all',
    activeTypeFilter: 'all'
  },

  init() {
    this.state.devices = HardwareDB.devices;
    this.state.filteredDevices = [...this.state.devices];
    this.bindEvents();
    this.render();
    this.updateCompareBar();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('hardwareSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Brand filters
    document.querySelectorAll('.brand-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => this.filterByBrand(btn.dataset.brand));
    });

    // Type filters
    document.querySelectorAll('.type-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => this.filterByType(btn.dataset.type));
    });

    // Compare bar close
    const closeCompare = document.getElementById('closeCompareBar');
    if (closeCompare) {
      closeCompare.addEventListener('click', () => this.clearCompare());
    }

    // Modal close
    const closeModal = document.getElementById('closeCompareModal');
    if (closeModal) {
      closeModal.addEventListener('click', () => this.closeCompareModal());
    }

    // Click outside modal
    const modal = document.getElementById('compareModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeCompareModal();
      });
    }
  },

  handleSearch(query) {
    this.applyFilters(query);
  },

  filterByBrand(brand) {
    this.state.activeBrandFilter = brand;
    
    // Update active button
    document.querySelectorAll('.brand-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.brand === brand);
    });

    this.applyFilters();
  },

  filterByType(type) {
    this.state.activeTypeFilter = type;

    document.querySelectorAll('.type-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });

    this.applyFilters();
  },

  applyFilters(searchQuery = '') {
    let devices = [...this.state.devices];

    // Apply search
    if (searchQuery || document.getElementById('hardwareSearch')?.value) {
      const query = (searchQuery || document.getElementById('hardwareSearch').value).toLowerCase();
      if (query) {
        devices = HardwareDB.search(query);
      }
    }

    // Apply brand filter
    if (this.state.activeBrandFilter !== 'all') {
      devices = devices.filter(d => d.brandSlug === this.state.activeBrandFilter);
    }

    // Apply type filter
    if (this.state.activeTypeFilter !== 'all') {
      devices = devices.filter(d => d.type === this.state.activeTypeFilter);
    }

    this.state.filteredDevices = devices;
    this.render();
  },

  render() {
    const grid = document.getElementById('hardwareGrid');
    if (!grid) return;

    if (this.state.filteredDevices.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <span class="no-results-icon">🔍</span>
          <h3>No se encontraron dispositivos</h3>
          <p>Intenta con otros filtros o términos de búsqueda</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.state.filteredDevices.map(device => this.renderCard(device)).join('');

    // Bind card events
    this.bindCardEvents();
  },

  renderCard(device) {
    const isExpanded = this.state.expandedCard === device.id;
    const isSelected = this.state.selectedForCompare.includes(device.id);
    const canCompare = this.state.selectedForCompare.length < 2 || isSelected;

    const usbBadge = device.usb.format 
      ? `<span class="badge badge-usb">💾 ${device.usb.format}</span>`
      : `<span class="badge badge-analog">⚡ Analógico</span>`;

    const typeIcon = this.getTypeIcon(device.type);

    return `
      <div class="hardware-card ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''}" data-id="${device.id}">
        <div class="card-header" onclick="HardwareGuide.toggleCard('${device.id}')">
          <div class="card-icon">${typeIcon}</div>
          <div class="card-info">
            <h3 class="card-title">${device.name}</h3>
            <p class="card-brand">${device.brand}</p>
          </div>
          <div class="card-meta">
            ${usbBadge}
            <span class="card-year">${device.releaseYear}</span>
          </div>
          <div class="card-expand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="${isExpanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}"></polyline>
            </svg>
          </div>
        </div>

        ${isExpanded ? this.renderExpandedContent(device) : ''}

        ${isExpanded ? `
          <div class="card-actions">
            <button class="btn-compare ${!canCompare ? 'disabled' : ''}" 
              onclick="event.stopPropagation(); HardwareGuide.toggleCompare('${device.id}')"
              ${!canCompare ? 'disabled' : ''}>
              ${isSelected ? '✓ Comparando' : '+ Comparar'}
            </button>
          </div>
        ` : ''}
      </div>
    `;
  },

  renderExpandedContent(device) {
    return `
      <div class="card-content">
        <!-- USB Settings -->
        ${device.usb.format ? `
          <div class="detail-section">
            <h4 class="section-title">💾 USB Settings</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Format</span>
                <span class="detail-value">${device.usb.format}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Max Partition</span>
                <span class="detail-value">${device.usb.maxPartition}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Max Files</span>
                <span class="detail-value">${device.usb.maxFiles?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
            ${device.usb.recommendedDrives?.length ? `
              <div class="detail-item full-width">
                <span class="detail-label">Recommended Drives</span>
                <div class="drive-list">
                  ${device.usb.recommendedDrives.map(d => `<span class="drive-tag">${d}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            <p class="detail-tip">${device.usb.tips}</p>
          </div>
        ` : `
          <div class="detail-section no-usb">
            <h4 class="section-title">⚠️ No USB Export</h4>
            <p class="detail-tip">${device.usb.tips}</p>
          </div>
        `}

        <!-- Software -->
        ${device.software.name ? `
          <div class="detail-section">
            <h4 class="section-title">🖥️ Software</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Software</span>
                <span class="detail-value">${device.software.name}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Version</span>
                <span class="detail-value">${device.software.version || 'Latest'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Export Mode</span>
                <span class="detail-value">${device.software.exportMode}</span>
              </div>
            </div>
            ${device.software.versionWarning ? `
              <p class="detail-warning">⚠️ ${device.software.versionWarning}</p>
            ` : ''}
          </div>
        ` : ''}

        <!-- Export Steps -->
        <div class="detail-section">
          <h4 class="section-title">📋 Export Steps</h4>
          <ol class="export-steps">
            ${device.exportSteps.map((step, i) => `<li>${step}</li>`).join('')}
          </ol>
        </div>

        <!-- Pro Tips -->
        ${device.proTips?.length ? `
          <div class="detail-section">
            <h4 class="section-title">⭐ Pro Tips</h4>
            <div class="tips-list">
              ${device.proTips.map(tip => `
                <div class="tip-item badge-${tip.badge}">
                  ${this.getBadgeLabel(tip.badge)} ${tip.text}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Known Issues -->
        ${device.knownIssues?.length ? `
          <div class="detail-section">
            <h4 class="section-title">⚠️ Known Issues</h4>
            <div class="issues-list">
              ${device.knownIssues.map(issue => `
                <div class="issue-item severity-${issue.severity}">
                  ${issue.text}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Specifications -->
        ${device.specifications ? `
          <div class="detail-section">
            <h4 class="section-title">📊 Specifications</h4>
            <div class="detail-grid">
              ${Object.entries(device.specifications).map(([key, value]) => `
                <div class="detail-item">
                  <span class="detail-label">${this.formatLabel(key)}</span>
                  <span class="detail-value">${value}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  getTypeIcon(type) {
    const icons = {
      'cdj': '🎧',
      'controller': '🎛️',
      'all-in-one': '🎚️',
      'turntable': '📀'
    };
    return icons[type] || '🎵';
  },

  getBadgeLabel(badge) {
    const labels = {
      'essential': '🔴 Essential',
      'pro': '🟡 Pro Tip',
      'warning': '🟠 Warning',
      'tip': '🟢 Tip'
    };
    return labels[badge] || '';
  },

  formatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  },

  bindCardEvents() {
    // Cards already have onclick handlers
  },

  toggleCard(id) {
    if (this.state.expandedCard === id) {
      this.state.expandedCard = null;
    } else {
      this.state.expandedCard = id;
    }
    this.render();
  },

  toggleCompare(id) {
    const index = this.state.selectedForCompare.indexOf(id);
    
    if (index > -1) {
      // Remove
      this.state.selectedForCompare.splice(index, 1);
    } else {
      // Add (max 2)
      if (this.state.selectedForCompare.length < 2) {
        this.state.selectedForCompare.push(id);
      }
    }

    this.updateCompareBar();
    this.render();
  },

  updateCompareBar() {
    const bar = document.getElementById('compareBar');
    const count = this.state.selectedForCompare.length;

    if (!bar) return;

    if (count > 0) {
      bar.style.display = 'flex';
      document.getElementById('compareCount').textContent = count;
      
      const deviceNames = this.state.selectedForCompare
        .map(id => HardwareDB.getById(id)?.name)
        .join(' vs ');
      
      document.getElementById('compareText').textContent = deviceNames;
    } else {
      bar.style.display = 'none';
    }
  },

  clearCompare() {
    this.state.selectedForCompare = [];
    this.updateCompareBar();
    this.render();
  },

  showCompareModal() {
    if (this.state.selectedForCompare.length !== 2) return;

    const modal = document.getElementById('compareModal');
    if (!modal) return;

    const device1 = HardwareDB.getById(this.state.selectedForCompare[0]);
    const device2 = HardwareDB.getById(this.state.selectedForCompare[1]);

    const comparisonFields = [
      { key: 'brand', label: 'Brand' },
      { key: 'typeLabel', label: 'Type' },
      { key: 'usb', subKey: 'format', label: 'USB Format' },
      { key: 'usb', subKey: 'maxPartition', label: 'Max Partition' },
      { key: 'usb', subKey: 'maxFiles', label: 'Max Files', format: 'number' },
      { key: 'software', subKey: 'name', label: 'Software' },
      { key: 'software', subKey: 'version', label: 'Software Version' },
      { key: 'releaseYear', label: 'Release Year' }
    ];

    let tableRows = '';

    comparisonFields.forEach(field => {
      let val1 = '', val2 = '';

      if (field.subKey) {
        val1 = device1[field.key]?.[field.subKey] || '—';
        val2 = device2[field.key]?.[field.subKey] || '—';
      } else {
        val1 = device1[field.key] || '—';
        val2 = device2[field.key] || '—';
      }

      if (field.format === 'number' && val1) {
        val1 = parseInt(val1).toLocaleString();
        val2 = parseInt(val2).toLocaleString();
      }

      const match = val1 === val2;
      
      tableRows += `
        <tr class="${match ? 'match' : ''}">
          <td>${field.label}</td>
          <td>${val1}</td>
          <td>${val2}</td>
        </tr>
      `;
    });

    // Add playable formats
    const formats1 = device1.specifications?.playableFormats?.join(', ') || '—';
    const formats2 = device2.specifications?.playableFormats?.join(', ') || '—';

    tableRows += `
      <tr>
        <td>Playable Formats</td>
        <td>${formats1}</td>
        <td>${formats2}</td>
      </tr>
    `;

    document.getElementById('compareTableBody').innerHTML = tableRows;
    document.getElementById('compareDevice1Name').textContent = device1.name;
    document.getElementById('compareDevice2Name').textContent = device2.name;

    modal.style.display = 'flex';
  },

  closeCompareModal() {
    document.getElementById('compareModal').style.display = 'none';
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('hardwareGrid')) {
    HardwareGuide.init();
  }
});

// Global function for onclick handlers
window.HardwareGuide = HardwareGuide;
