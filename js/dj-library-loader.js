/**
 * DJ Library Loader — renders the DJ Library page dynamically from JSON files.
 * Eliminates hardcoded HTML. Just add JSON files and refresh.
 */
const DJLibrary = {
  BASE: '',

  async init() {
    await this.loadAll();
    this.render();
  },

  async loadAll() {
    try {
      const idx = await this.fetchJSON('/data/djs/index.json');
      this.djs = idx.djs || [];
      this.sets = {};
      for (const dj of this.djs) {
        for (const setId of (dj.sets || [])) {
          const set = await this.fetchJSON(`/data/djs/sets/${setId}.json`);
          if (set) this.sets[setId] = set;
        }
      }
      try {
        const cr = await this.fetchJSON('/data/djs/cross-references.json');
        this.crossRefs = cr || { shared_artists: [], shared_tracks: [], shared_labels: [] };
      } catch { this.crossRefs = { shared_artists: [], shared_tracks: [], shared_labels: [] }; }
    } catch(e) {
      console.error('DJ Library load error:', e);
    }
  },

  async fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  },

  render() {
    const container = document.getElementById('djLibraryContainer');
    if (!container) return;
    container.innerHTML = this.djs.map(dj => {
      const sets = (dj.sets || []).map(id => this.sets[id]).filter(Boolean);
      const setCount = sets.length;
      const tracks = sets.reduce((sum, s) => sum + (s.tracklist || []).length, 0);
      return `
        <section class="dj-profile-section">
          <div class="dj-profile-card">
            <div class="dj-profile-header">
              <img src="${dj.image || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect fill=\'%23111\' width=\'100\' height=\'100\'/%3E%3Ctext fill=\'%23ff4d00\' x=\'50\' y=\'55\' text-anchor=\'middle\' font-size=\'40\'%3E🎧%3C/text%3E%3C/svg%3E'}" alt="${dj.name}" class="dj-avatar" loading="lazy" onerror="this.src='data:image/svg+xml,%253Csvg xmlns=%2527http://www.w3.org/2000/svg%2527 viewBox=%25270 0 100 100%2527%253E%253Crect fill=%2527%2523111%2527 width=%2527100%2527 height=%2527100%2527/%253E%253Ctext fill=%2527%2523ff4d00%2527 x=%252750%2527 y=%252755%2527 text-anchor=%2527middle%2527 font-size=%252740%2527%253E🎧%253C/text%253E%253C/svg%253E'" />
              <div class="dj-info">
                <h2>${dj.name}</h2>
                <div class="dj-meta"><span>${dj.origin || ''}</span>${dj.active_since ? `<span>•</span><span>Since ${dj.active_since}</span>` : ''}<span>•</span><span>${setCount} set${setCount !== 1 ? 's' : ''}</span></div>
                <p class="dj-bio">${dj.bio || ''}</p>
              </div>
            </div>
            ${sets.map(set => `
              <div class="set-player-section">
                <div class="set-info-header">
                  <div>
                    <div class="section-label">▶ Set</div>
                    <h3 class="set-title">${set.title}</h3>
                    <div class="set-meta">
                      ${set.venue ? `<span>📍 ${set.venue}</span>` : ''}
                      ${set.date ? `<span>📅 ${set.date}</span>` : ''}
                      <span>⏱️ ${set.duration_formatted || set.duration_minutes + ' min'}</span>
                      ${set.view_count ? `<span>👁️ ${(set.view_count / 1000).toFixed(1)}K views</span>` : ''}
                    </div>
                  </div>
                </div>
                ${set.youtube_embed_id ? `<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${set.youtube_embed_id}" title="${set.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : ''}
              </div>
              <div class="tracklist-section">
                <div class="section-label">🎵 Tracklist (${(set.tracklist || []).length} tracks)</div>
                ${(set.tracklist || []).length ? `<table class="tracklist-table"><thead><tr><th>#</th><th>Time</th><th>Artist</th><th>Title</th><th>Status</th></tr></thead><tbody>${set.tracklist.map((t, i) => `<tr><td>${t.position || (i+1)}</td><td><span class="track-time">${t.timestamp || '--:--'}</span></td><td>${t.artist}</td><td>${t.title}</td><td><span class="track-status status-${t.status || 'unidentified'}">${t.status === 'confirmed' ? '✓ confirmed' : '? unidentified'}</span></td></tr>`).join('')}</tbody></table>` : '<p style="color:rgba(255,255,255,0.3);font-size:0.9rem;padding:1rem 0">Tracklist being sourced...</p>'}
              </div>
              ${(set.curious_facts && Object.keys(set.curious_facts).length) ? `<div class="facts-section"><div class="section-label">📊 Datos</div><div class="facts-grid">${Object.entries(set.curious_facts).map(([k,v]) => `<div class="fact-card"><div class="fact-number">${v}</div><div class="fact-label">${k.replace(/_/g,' ')}</div></div>`).join('')}</div></div>` : ''}
            `).join('')}
          </div>
        </section>`;
    }).join('');

    this.renderCrossReferences();
    this.renderStats();
  },

  renderCrossReferences() {
    const container = document.getElementById('djGraphContainer');
    if (!container || !this.crossRefs) return;
    const arts = this.crossRefs.shared_artists || [];
    const tracks = this.crossRefs.shared_tracks || [];
    const total = arts.length + tracks.length;
    const el = container.querySelector('.graph-connections');
    if (el) {
      el.innerHTML = total ? `
        <div style="padding:0.5rem 0;color:rgba(255,255,255,0.5);font-size:0.85rem">
          <strong style="color:#ff9100">${arts.length}</strong> shared artists
          <strong style="color:#00bcd4;margin-left:1rem">${tracks.length}</strong> shared tracks
        </div>
        ${arts.slice(0,5).map(a => `<div style="display:flex;gap:0.5rem;padding:0.3rem 0;font-size:0.8rem;color:rgba(255,255,255,0.6)"><span style="color:#ff9100">●</span><span>${a.artist}</span><span style="color:rgba(255,255,255,0.3)">→</span><span style="color:#ff4d00">${a.djs.join(' & ')}</span></div>`).join('')}
        ${tracks.slice(0,3).map(t => `<div style="display:flex;gap:0.5rem;padding:0.3rem 0;font-size:0.8rem;color:rgba(255,255,255,0.6)"><span style="color:#00bcd4">●</span><span>${t.track}</span><span style="color:rgba(255,255,255,0.3)">→</span><span style="color:#ff4d00">${t.djs.join(' & ')}</span></div>`).join('')}
      ` : '';
    }
  },

  renderStats() {
    const statEl = document.getElementById('djLibraryStats');
    if (!statEl) return;
    const setCount = Object.keys(this.sets).length;
    const trackCount = Object.values(this.sets).reduce((sum, s) => sum + (s.tracklist || []).length, 0);
    const crossCount = (this.crossRefs?.shared_artists?.length || 0) + (this.crossRefs?.shared_tracks?.length || 0);
    statEl.innerHTML = `
      <span class="stat-pill"><strong>${this.djs.length}</strong> DJs</span>
      <span class="stat-pill"><strong>${setCount}</strong> Sets</span>
      <span class="stat-pill"><strong>${trackCount}</strong> Tracks</span>
      <span class="stat-pill"><strong>${crossCount}</strong> Connections</span>`;
  }
};
document.addEventListener('DOMContentLoaded', () => DJLibrary.init());
