const MusicDirectory = {
  state: {
    sources: [],
    filteredSources: [],
    activeGenre: 'all',
    searchQuery: ''
  },

  init: function() {
    this.state.sources = MusicDB.sources;
    this.state.filteredSources = [...this.state.sources];
    
    this.renderGenreFilters();
    this.renderSources();
    this.bindEvents();
  },

  bindEvents: function() {
    const searchInput = document.getElementById('musicSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value.toLowerCase();
        this.filterSources();
      });
    }

    document.querySelectorAll('.genre-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.genre-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.activeGenre = btn.dataset.genre;
        this.filterSources();
      });
    });
  },

  renderGenreFilters: function() {
    const container = document.getElementById('genreFilters');
    if (!container) return;

    const genres = MusicDB.getGenres();
    
    const popularGenres = ['all', 'house', 'techno', 'deep house', 'melodic techno', 'psytrance', 'edm', 'progressive'];
    const availableGenres = popularGenres.filter(g => g === 'all' || genres.includes(g));

    container.innerHTML = availableGenres.map(genre => `
      <button class="genre-filter-btn ${genre === 'all' ? 'active' : ''}" data-genre="${genre}">
        ${this.formatGenre(genre)}
      </button>
    `).join('');
  },

  formatGenre: function(genre) {
    return genre.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  },

  filterSources: function() {
    let filtered = [...this.state.sources];

    if (this.state.activeGenre !== 'all') {
      filtered = filtered.filter(source => 
        source.genres.some(g => g.toLowerCase().includes(this.state.activeGenre.toLowerCase()))
      );
    }

    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(source =>
        source.name.toLowerCase().includes(query) ||
        source.description.toLowerCase().includes(query) ||
        source.genres.some(g => g.toLowerCase().includes(query))
      );
    }

    this.state.filteredSources = filtered;
    this.renderSources();
    this.updateCount();
  },

  updateCount: function() {
    const countEl = document.getElementById('sourceCount');
    if (countEl) {
      countEl.textContent = this.state.filteredSources.length;
    }
  },

  renderSources: function() {
    const grid = document.getElementById('musicGrid');
    if (!grid) return;

    if (this.state.filteredSources.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <span class="no-results-icon">🔍</span>
          <h3>No se encontraron fuentes</h3>
          <p>Intenta con otros filtros o términos de búsqueda</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.state.filteredSources.map(source => this.renderSourceCard(source)).join('');
  },

  renderSourceCard: function(source) {
    const qualityBadges = MusicDB.getQualityBadges(source.quality);
    const tierColors = {
      1: '#00c853',
      2: '#ff9800', 
      3: '#9e9e9e'
    };

    return `
      <div class="music-card" data-source-id="${source.id}">
        <div class="music-card-header">
          <div class="source-brand" style="background: ${source.color}">
            ${this.getInitial(source.name)}
          </div>
          <div class="tier-badge" style="background: ${tierColors[source.tier]}20; color: ${tierColors[source.tier]}">
            ${source.tierLabel}
          </div>
        </div>
        
        <div class="music-card-body">
          <h3 class="source-name">${source.name}</h3>
          <p class="source-description">${source.description}</p>
          
          <div class="source-genres">
            ${source.genres.slice(0, 3).map(genre => `
              <span class="genre-tag">${this.formatGenre(genre)}</span>
            `).join('')}
          </div>
          
          <div class="source-meta">
            <div class="quality-badges">
              ${qualityBadges.map(badge => `
                <span class="quality-badge" style="background: ${badge.color}20; color: ${badge.color}">
                  ${badge.text}
                </span>
              `).join('')}
            </div>
            <span class="format-info">${source.formats.join(' • ')}</span>
          </div>
        </div>
        
        <div class="music-card-footer">
          <a href="${source.url}" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="visit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Visitar
          </a>
        </div>
      </div>
    `;
  },

  getInitial: function(name) {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  }
};
