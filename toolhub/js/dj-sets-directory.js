// Taller — "Sets del Archivo" tool.
// Searches the generated DJ_SETS / DJ_ARTISTS data (see js/dj-sets-db.js) and
// deep-links each result to the set sheet in the Discoteca (dj-library.html#set:<id>).
const SetsDirectory = {
  state: {
    sets: [],
    filtered: [],
    searchQuery: '',
  },

  init: function () {
    if (typeof DJ_SETS === 'undefined') return;
    this.state.sets = DJ_SETS.map((s) => {
      const artist =
        typeof DJ_ARTISTS !== 'undefined' ? DJ_ARTISTS.find((a) => a.id === s.dj_id) : undefined;
      return Object.assign({}, s, {
        genreChips: artist ? (artist.genres || []).slice(0, 3) : [],
      });
    });
    this.state.filtered = [...this.state.sets];
    this.bindEvents();
    this.updateCount();
    this.render();
  },

  bindEvents: function () {
    const input = document.getElementById('setsSearch');
    if (input) {
      input.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value.toLowerCase();
        this.filter();
      });
    }
  },

  filter: function () {
    const q = this.state.searchQuery;
    let filtered = this.state.sets;
    if (q) {
      filtered = filtered.filter(
        (s) =>
          (s.dj_name || '').toLowerCase().includes(q) ||
          (s.title || '').toLowerCase().includes(q) ||
          (s.venue || '').toLowerCase().includes(q) ||
          (s.date || '').toLowerCase().includes(q) ||
          s.genreChips.some((g) => g.toLowerCase().includes(q))
      );
    }
    this.state.filtered = filtered;
    this.updateCount();
    this.render();
  },

  updateCount: function () {
    const el = document.getElementById('setsCount');
    if (el) el.textContent = this.state.filtered.length;
  },

  render: function () {
    const grid = document.getElementById('setsGrid');
    if (!grid) return;

    if (!this.state.filtered.length) {
      grid.innerHTML = `
        <div class="no-results">
          <span class="no-results-icon">🔍</span>
          <h3>No se encontraron sets</h3>
          <p>Intenta con otro DJ, set o venue</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.state.filtered
      .map(
        (s) => `
        <div class="set-card" data-set-id="${s.id}">
          <div class="set-card-index">${String(s.id.split('-')[0]).slice(0, 2).toUpperCase()}</div>
          <div class="set-card-body">
            <div class="set-card-head">
              <h3 class="set-title">${this.esc(s.title || s.id)}</h3>
              <a class="set-open" data-no-swup href="../dj-library.html#set:${encodeURIComponent(s.id)}">
                Abrir en la Discoteca
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div class="set-card-meta">
              <span class="set-dj">${this.esc(s.dj_name || '')}</span>
              <span class="set-venue">${this.esc(s.venue || '')}</span>
              <span class="set-date">${s.date || ''}</span>
            </div>
            <div class="set-card-specs">
              <span><strong>${s.tracks}</strong> tracks</span>
              <span><strong>${s.confirmed}</strong> confirmados</span>
              <span>${s.duration || '—'}</span>
              ${s.views ? `<span>${Number(s.views).toLocaleString()} views</span>` : ''}
            </div>
            ${s.genreChips.length ? `<div class="set-genres">${s.genreChips.map((g) => `<span class="genre-tag">${this.esc(g)}</span>`).join('')}</div>` : ''}
          </div>
        </div>
      `
      )
      .join('');
  },

  esc: function (str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
};

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('setsGrid')) {
    SetsDirectory.init();
  }
});
