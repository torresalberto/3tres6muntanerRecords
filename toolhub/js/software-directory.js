const SoftwareDirectory = {
  state: {
    resources: [],
    filteredResources: [],
    activeCategory: 'all',
    activePricing: 'all',
    activePlatform: 'all',
    searchQuery: ''
  },

  init: function() {
    this.state.resources = SoftwareDB.resources;
    this.state.filteredResources = [...this.state.resources];
    this.renderCategoryFilters();
    this.renderResources();
    this.bindEvents();
  },

  bindEvents: function() {
    const searchInput = document.getElementById('softwareSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value.toLowerCase();
        this.filterResources();
      });
    }

    document.querySelectorAll('.software-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.software-category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.activeCategory = btn.dataset.category;
        this.filterResources();
      });
    });

    document.querySelectorAll('.pricing-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pricing-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.activePricing = btn.dataset.pricing;
        this.filterResources();
      });
    });

    document.querySelectorAll('.platform-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.platform-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.activePlatform = btn.dataset.platform;
        this.filterResources();
      });
    });
  },

  renderCategoryFilters: function() {
    const container = document.getElementById('softwareCategoryFilters');
    if (!container) return;

    const categories = SoftwareDB.getCategories();
    container.innerHTML = `
      <button class="software-category-btn active" data-category="all">Todos</button>
      ${categories.map(cat => `
        <button class="software-category-btn" data-category="${cat}">
          ${SoftwareDB.getCategoryLabel(cat)}
        </button>
      `).join('')}
    `;
  },

  filterResources: function() {
    let filtered = [...this.state.resources];

    if (this.state.activeCategory !== 'all') {
      filtered = filtered.filter(r => r.category === this.state.activeCategory);
    }

    if (this.state.activePricing !== 'all') {
      filtered = filtered.filter(r => r.pricing === this.state.activePricing);
    }

    if (this.state.activePlatform !== 'all') {
      filtered = filtered.filter(r => r.platforms.includes(this.state.activePlatform));
    }

    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.developer.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.description.es.toLowerCase().includes(q) ||
        r.description.en.toLowerCase().includes(q)
      );
    }

    this.state.filteredResources = filtered;
    this.renderResources();
    this.updateCount();
  },

  updateCount: function() {
    const countEl = document.getElementById('softwareCount');
    if (countEl) {
      countEl.textContent = this.state.filteredResources.length;
    }
  },

  renderResources: function() {
    const grid = document.getElementById('softwareGrid');
    if (!grid) return;

    if (this.state.filteredResources.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <span class="no-results-icon">🔍</span>
          <h3>No se encontraron recursos</h3>
          <p>Intenta con otros filtros o términos de búsqueda</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.state.filteredResources.map(r => {
      const pricing = SoftwareDB.getPricingBadge(r.pricing);
      const platformIcons = r.platforms.map(p => SoftwareDB.getPlatformIcon(p)).join(' ');
      const links = r.links || [];
      const mainLink = links[0] || {};
      const secondaryLinks = links.slice(1, 4) || [];

      return `
        <div class="software-card">
          <div class="software-card-header">
            <span class="software-icon">${r.icon || '📦'}</span>
            <div class="software-title-group">
              <h3 class="software-name">${r.name}</h3>
              <span class="software-developer">${r.developer}</span>
            </div>
          </div>

          <div class="software-meta">
            <span class="pricing-badge" style="background: ${pricing.color}22; color: ${pricing.color}; border-color: ${pricing.color}44;">
              ${pricing.text}
            </span>
            ${r.hasFreeTier ? `<span class="free-tier-badge" title="Tiene versión gratuita">✅ Free Tier</span>` : ''}
          </div>

          <div class="software-description">
            <p>${r.description.es}</p>
          </div>

          <div class="software-platforms">
            <span class="platform-label">Plataformas:</span>
            <span class="platform-icons">${platformIcons}</span>
          </div>

          ${r.recommendation ? `
            <div class="software-recommendation">
              💡 ${r.recommendation}
            </div>
          ` : ''}

          <div class="software-links">
            ${mainLink.label ? `<a href="${mainLink.url}" target="_blank" rel="noopener" class="software-btn primary">
              ${mainLink.label}
            </a>` : ''}
            ${secondaryLinks.map(link => `
              <a href="${link.url}" target="_blank" rel="noopener" class="software-btn secondary" title="${link.label}">
                ${link.type === 'source' ? '📝' : link.type === 'alternative' ? '🆓' : link.type === 'tutorial' ? '📺' : link.type === 'trial' ? '🎁' : link.type === 'info' ? 'ℹ️' : link.type === 'buy' ? '🛒' : link.type === 'guide' ? '📖' : link.type === 'webapp' ? '🌐' : '🔗'}
              </a>
            `).join('')}
          </div>

          <div class="software-tags">
            ${r.tags.slice(0, 4).map(tag => `<span class="software-tag">#${tag}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');
  }
};
