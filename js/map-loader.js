/**
 * Map Loader — renders the interactive venue map dynamically from JSON data.
 * Leaflet 1.9.4 + OpenFreeMap "dark" vector tiles via maplibre-gl-leaflet
 * (keyless, no account). Falls back to CartoDB Dark Matter if the GL layer
 * or library is unavailable.
 *
 * Features: venue markers with pulse pins, rich popups (channel links + the
 * DJ Library network: "DJs que tocaron aquí" / "Sets en este club"), city
 * filter chips, sidebar rail with catalog numbers, fly-to navigation and
 * deep links (mapa.html#venue:<id>).
 *
 * Top-level const (not on window) — guard with `typeof`, never `window.X`.
 */
const VenueMap = {
  map: null,
  markerLayer: null,
  markers: [],
  activeCity: 'all',
  venues: [],
  cities: [],

  networks: {},
  djNames: {},
  _containerEl: null,
  _networksPending: false,

  // Tokens that never make a venue "distinctive" for network matching.
  _stop: new Set([
    'studio',
    'club',
    'sala',
    'room',
    'rooms',
    'bar',
    'radio',
    'festival',
    'stage',
    'space',
    'music',
    'house',
    'techno',
    'disco',
    'werks',
    'bcn',
    'barcelona',
    'mexico',
    'madrid',
    'spain',
    'mexico city',
    'cdmx',
    'city',
    'island',
    'villa',
    'floor',
    'main',
    'beach',
  ]),

  init() {
    if (this._active) return this._active;
    this._active = (async () => {
      // Teardown a previous map instance (swup re-entry / re-init).
      if (this.map) {
        this.map.remove();
        this.map = null;
        this.markerLayer = null;
        this.markers = [];
      }

      await this.loadData();
      this.loadNetworks();

      const container = document.getElementById('venueMap');
      if (!container) return;
      this._containerEl = container;

      this.renderStats();
      this.renderMap();
      this.renderCityTabs();
      this.renderVenueList();
      this.wireHash();

      setTimeout(() => this.fitAll(), 300);
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
        this.openHash();
      }, 420);
    })();
    return this._active;
  },

  // ---------------------------------------------------------------- data

  async loadData() {
    try {
      const res = await fetch('data/venues/index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.venues = data.venues || [];
      this.cities = data.cities || [];
    } catch (e) {
      console.error('Venue map load error:', e);
      this.venues = [];
      this.cities = [];
    }
  },

  // DJ Library network data, loaded in parallel so it never blocks the map.
  // Popups render these rows only when a curated venue actually matches a
  // venue_networks entry (best-effort, forward-safe).
  loadNetworks() {
    this._networksPending = true;
    Promise.all([
      fetch('data/djs/cross-references.json')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch('data/djs/index.json')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]).then(([cross, djs]) => {
      this._networksPending = false;
      if (cross && cross.venue_networks) this.networks = cross.venue_networks;
      const list = djs && (djs.djs || (Array.isArray(djs) ? djs : null));
      if (Array.isArray(list)) {
        this.djNames = {};
        list.forEach((d) => {
          if (d && d.id && d.name) this.djNames[d.id] = d.name;
        });
      }
      // If a popup is already open, refresh it with the network rows.
      const open = this.markers.find((m) => this.map && m.getPopup && m.getPopup().isOpen());
      if (open) this._renderPopup(open);
    });
  },

  // ---------------------------------------------------------------- stats

  renderStats() {
    const venuesEl = document.getElementById('statVenues');
    const citiesEl = document.getElementById('statCities');
    if (venuesEl) venuesEl.textContent = this.venues.length;
    if (citiesEl) citiesEl.textContent = this.cities.length;
  },

  // ---------------------------------------------------------------- map

  renderMap() {
    const container = document.getElementById('venueMap');
    if (!container) return;
    if (!this.map) {
      this.map = L.map('venueMap', {
        center: [41.3851, 2.1734],
        zoom: 12,
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    }

    const basemap = this.createBasemap();
    basemap.addTo(this.map);
    // Surface MapLibre runtime errors (tile fetch failures, style issues) so
    // a blank basemap is never silent.
    if (typeof basemap.getMaplibreMap === 'function') {
      try {
        basemap.getMaplibreMap().on('error', (e) => {
          console.warn('[VenueMap] MapLibre error:', e && (e.error || e.message));
        });
      } catch (err) {
        /* noop */
      }
    }
    this.markerLayer = L.layerGroup().addTo(this.map);
    this.addMarkers();
  },

  // OpenFreeMap "dark" (keyless community tiles); CartoDB as a fallback.
  createBasemap() {
    if (typeof L.maplibreGL === 'function') {
      try {
        return L.maplibreGL({
          style: 'https://tiles.openfreemap.org/styles/dark',
          attributionControl: {
            customAttribution:
              '<a href="https://openfreemap.org/">OpenFreeMap</a> © ' +
              '<a href="https://openmaptiles.org/">OpenMapTiles</a> © ' +
              '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        });
      } catch (e) {
        console.warn('[VenueMap] maplibreGL init failed — using CartoDB fallback.', e);
      }
    }
    return L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; ' +
        '<a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    });
  },

  // ---------------------------------------------------------------- markers

  createMarkerIcon() {
    return L.divIcon({
      className: 'venue-marker-icon',
      html: `
        <div class="marker-pulse"></div>
        <div class="marker-pin">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -44],
    });
  },

  addMarkers() {
    if (this.markerLayer) this.markerLayer.clearLayers();
    this.markers = [];

    const icon = this.createMarkerIcon();

    this.venues.forEach((venue, index) => {
      const marker = L.marker([venue.coordinates.lat, venue.coordinates.lng], {
        icon,
        riseOnHover: true,
      });

      marker.venueData = venue;
      marker._index = index;
      marker.bindPopup('<div class="venue-popup loading">Cargando…</div>', {
        maxWidth: 320,
        minWidth: 260,
        className: 'venue-popup-wrapper',
      });
      marker.on('popupopen', () => this._renderPopup(marker));
      marker.on('click', () => this._syncHash(venue.id));

      this.markers.push(marker);
      this.markerLayer.addLayer(marker);
    });
  },

  _renderPopup(marker) {
    const venue = marker.venueData;
    if (!venue) return;

    const links = [];
    if (venue.links?.ra) {
      links.push(this._popupLink(venue.links.ra, 'Resident Advisor', 'external'));
    }
    if (venue.links?.website) {
      links.push(this._popupLink(venue.links.website, 'Sitio web', 'external'));
    }
    if (venue.links?.instagram) {
      links.push(this._popupLink(venue.links.instagram, 'Instagram', 'external'));
    }

    const net = this._venueNetwork(venue);
    const netHtml = net
      ? `
        <div class="popup-net">
          ${
            net.djs.length
              ? `<div class="popup-net-block">
                <div class="popup-net-label">DJs que tocaron aquí</div>
                <div class="popup-net-djs">${net.djs.map((id) => this._djLink(id)).join('')}</div>
              </div>`
              : ''
          }
          ${
            net.sets.length
              ? `<div class="popup-net-block">
                <div class="popup-net-label">Sets en este club</div>
                <div class="popup-net-sets">${net.sets
                  .map((id) =>
                    this._popupLink(
                      `/3tres6muntanerRecords/dj-library.html#set:${encodeURIComponent(id)}`,
                      '↳ ' + id,
                      'set'
                    )
                  )
                  .join('')}</div>
              </div>`
              : ''
          }
        </div>`
      : '';

    const html = `
      <div class="venue-popup">
        <div class="popup-head">
          <div class="popup-head-main">
            <span class="popup-cat">Nº ${String(venue._cat || marker._index + 1).padStart(3, '0')}</span>
            <h3 class="popup-name">${venue.name}</h3>
          </div>
          ${venue.city ? `<span class="popup-city-badge">${venue.city}</span>` : ''}
        </div>
        ${venue.address ? `<p class="popup-address">${venue.address}</p>` : ''}
        ${venue.notes ? `<p class="popup-notes">${venue.notes}</p>` : ''}
        ${venue.soundsystem ? `<div class="popup-sound"><span class="sound-icon">🔊</span> ${venue.soundsystem}</div>` : ''}
        ${netHtml}
        ${links.length ? `<div class="popup-links">${links.join('')}</div>` : ''}
      </div>`;

    marker.setPopupContent(html);
  },

  _popupLink(href, label, kind) {
    const external = kind === 'external';
    return `<a class="popup-link${kind === 'set' ? ' popup-link-set' : ''}" href="${href}"${external ? ' target="_blank" rel="noopener"' : ' data-no-swup'}>${label}</a>`;
  },

  _djLink(djId) {
    const name = this.djNames[djId] || djId;
    return `<a class="popup-dj" data-no-swup href="/3tres6muntanerRecords/dj-library.html#dj:${encodeURIComponent(djId)}">${name}</a>`;
  },

  // Match a curated venue name against venue_networks keys using distinctive
  // tokens (quote-stopwords removed) so "Studio Stereo" never matches a
  // generic "Mixmag Studio" key but "Nitsa" does match "Nitsa, Barcelona".
  _venueNetwork(venue) {
    const tokens = this.distinctiveTokens(venue.name);
    if (!tokens.length) return null;

    let best = null;
    for (const [key, net] of Object.entries(this.networks)) {
      const kk = this.normalKey(key);
      const shared = tokens.filter((t) => kk.split(/[^a-z0-9]+/).indexOf(t) !== -1).length;
      if (shared > 0 && (!best || shared > best.shared)) {
        best = { shared, net, key };
      }
    }
    return best && best.net ? best.net : null;
  },

  distinctiveTokens(name) {
    if (!name) return [];
    const words = this.normalKey(name)
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
    return words.filter((w) => w.length > 3 && !this._stop.has(w));
  },

  normalKey(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' and ');
  },

  // ---------------------------------------------------------------- rail

  renderCityTabs() {
    const container = document.getElementById('cityTabs');
    if (!container) return;

    const allTab = `<button class="city-tab active" data-city="all">
      <span class="tab-dot"></span> Todas
    </button>`;
    const cityTabs = this.cities
      .map(
        (city) =>
          `<button class="city-tab" data-city="${city.name}">
            <span class="tab-dot"></span> ${city.name}
          </button>`
      )
      .join('');

    container.innerHTML = allTab + cityTabs;

    container.querySelectorAll('.city-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.city-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.filterByCity(tab.dataset.city);
      });
    });
  },

  renderVenueList() {
    const container = document.getElementById('venueList');
    if (!container) return;

    container.innerHTML = this.venues
      .map(
        (v, i) => `
      <div class="venue-card" data-venue-id="${v.id}" data-city="${v.city}">
        <div class="venue-index">Nº ${String(i + 1).padStart(3, '0')}</div>
        <div class="venue-card-body">
          <div class="venue-card-header">
            <h3 class="venue-card-name">${v.name}</h3>
            <span class="venue-card-city">${v.city}</span>
          </div>
          <p class="venue-card-address">${v.address}</p>
          ${v.soundsystem ? `<div class="venue-card-chip">${v.soundsystem}</div>` : ''}
        </div>
      </div>
    `
      )
      .join('');

    container.querySelectorAll('.venue-card').forEach((card) => {
      card.addEventListener('click', () => {
        const venueId = card.dataset.venueId;
        this.goToVenue(venueId);
      });
    });
  },

  // ---------------------------------------------------------------- navigation

  // Deep-link support: mapa.html#venue:<id> flies to + opens a venue.
  wireHash() {
    window.addEventListener('hashchange', () => this.openHash());
  },

  openHash() {
    const m = window.location.hash.match(/^#venue:(.+)$/);
    if (!m) return;
    const venueId = decodeURIComponent(m[1]);
    const index = this.venues.findIndex((v) => v.id === venueId);
    if (index === -1 || !this.map) return;

    if (this.activeCity !== 'all') {
      const tab = document.querySelector(`.city-tab[data-city="${this.venues[index].city}"]`);
      if (tab) tab.click();
    }
    this.goToVenue(venueId);
  },

  goToVenue(venueId) {
    const marker = this.markers.find((m) => m.venueData.id === venueId);
    if (!marker || !this.map) return;

    this.map.flyTo(marker.getLatLng(), 16, {
      duration: 1.5,
      easeLinearity: 0.25,
    });

    setTimeout(() => marker.openPopup(), 600);

    document.querySelectorAll('.venue-card').forEach((c) => c.classList.remove('active'));
    const card = document.querySelector(`.venue-card[data-venue-id="${venueId}"]`);
    if (card) {
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    this._syncHash(venueId);
  },

  _syncHash(venueId) {
    if (window.location.hash !== `#venue:${venueId}`) {
      try {
        history.replaceState(null, '', `#venue:${venueId}`);
      } catch (e) {
        /* noop */
      }
    }
  },

  filterByCity(city) {
    document.querySelectorAll('.venue-card').forEach((card) => {
      const show = city === 'all' || card.dataset.city === city;
      card.style.display = show ? '' : 'none';
    });

    this.markerLayer.clearLayers();

    if (city === 'all') {
      this.markers.forEach((m) => this.markerLayer.addLayer(m));
      this.fitAll();
    } else {
      const filtered = this.markers.filter((m) => m.venueData.city === city);
      filtered.forEach((m) => this.markerLayer.addLayer(m));

      const cityData = this.cities.find((c) => c.name === city);
      if (cityData) {
        this.map.flyTo([cityData.center.lat, cityData.center.lng], cityData.zoom, {
          duration: 1.5,
        });
      }
    }

    this.activeCity = city;
  },

  fitAll() {
    if (!this.map || this.markers.length === 0) return;
    this.markers.forEach((m) => this.markerLayer.addLayer(m));

    if (this.markers.length === 1) {
      this.map.setView([this.markers[0].getLatLng().lat, this.markers[0].getLatLng().lng], 15);
      return;
    }

    const group = L.featureGroup(this.markers);
    this.map.fitBounds(group.getBounds().pad(0.15), { duration: 1 });
  },
};

// Initial boot (direct loads). Mapa is a full-load section (links into it
// carry data-no-swup), so a plain DOMContentLoaded init is sufficient.
document.addEventListener('DOMContentLoaded', () => {
  VenueMap.init();
});
