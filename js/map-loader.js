/**
 * Map Loader — renders one interactive Leaflet map per curated city
 * (Barcelona, Mexico City) from data/venues/index.json. Each map shows only
 * its own city's venues on an OpenFreeMap "dark" vector basemap via
 * maplibre-gl-leaflet (keyless, no account). Falls back to CartoDB Dark
 * Matter if the GL layer or library is unavailable.
 *
 * Features: venue markers with pulse pins, rich popups (channel links + the
 * DJ Library network: "DJs que tocaron aquí" / "Sets en este club"),
 * a per-city club list beneath each map, fly-to navigation and deep links
 * (mapa.html#venue:<id>) that route to the venue's own city map.
 *
 * Top-level const (not on window) — guard with `typeof`, never `window.X`.
 */
const VenueMap = {
  cities: [],
  venues: [],
  maps: {},

  networks: {},
  djNames: {},
  _networksPending: false,

  // Community events (live feed) rendered as an overlay layer per city.
  events: [],
  _showEvents: true,

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
      // Teardown previous map instances (swup re-entry / re-init).
      Object.values(this.maps).forEach((rec) => {
        if (rec.map) rec.map.remove();
      });
      this.maps = {};

      await this.loadData();
      this.loadNetworks();
      await this.loadEvents();
      this.renderPanels();
      this.wireHash();

      setTimeout(() => this.openHash(), 500);
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

  apiBase() {
    // GH Pages mirror is static — the live feed is read from the store host.
    return window.location.hostname.endsWith('github.io')
      ? 'https://3tres6records.albto.me'
      : window.location.origin;
  },

  cityKey(name) {
    const n = this.normalKey(name);
    if (n.startsWith('ciudad de mexico') || /^mexico/.test(n)) return 'Mexico City';
    return n.startsWith('barcelona') ? 'Barcelona' : name;
  },

  async loadEvents() {
    this.events = [];
    try {
      const res = await fetch(`${this.apiBase()}/api/events.php?live=1&_=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = data && Array.isArray(data.events) ? data.events : [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.events = list.filter((e) => {
        if (!e.community || !e.id) return false;
        if (!(e.coords && e.coords.lat && e.coords.lng)) return false;
        if (!this.cities.some((c) => c.name === this.cityKey(e.city))) return false;
        if (e.recurring) return true;
        if (!e.date) return false;
        const d = new Date(e.date + 'T00:00:00');
        if (Number.isNaN(d.getTime())) return false;
        return d >= today;
      });
    } catch (e) {
      console.warn('[VenueMap] No live events feed:', e.message);
      this.events = [];
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
      Object.values(this.maps).forEach((rec) => {
        const open = rec.markers.find((m) => m.getPopup && m.getPopup().isOpen());
        if (open) this._renderPopup(open);
      });
    });
  },

  // ---------------------------------------------------------------- panels

  renderPanels() {
    this.cities.forEach((city) => {
      const slug = this._citySlug(city.name);
      const mapEl = document.getElementById(`venueMap-${slug}`);
      if (!mapEl) return;

      const venues = this.venues.filter((v) => v.city === city.name);
      const metaEl = document.getElementById(`cityMeta-${slug}`);
      if (metaEl) {
        metaEl.textContent = `${venues.length} clubes · ${this._cityLabel(city.country)}`;
      }

      const rec = {
        city,
        map: null,
        markerLayer: null,
        eventLayer: null,
        markers: [],
        eventMarkers: [],
        elId: `venueMap-${slug}`,
      };
      this.maps[city.name] = rec;
      this.createCityMap(rec, venues);

      const listEl = document.getElementById(`venueList-${slug}`);
      if (listEl) this.renderVenueList(listEl, venues);

      this.renderEventLayer(rec, city);
    });
    this.bindEventsToggle();
  },

  _citySlug(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  },

  _cityLabel(country) {
    return country === 'Spain' ? 'España' : country === 'Mexico' ? 'México' : country || '';
  },

  createCityMap(rec, venues) {
    const map = L.map(rec.elId, {
      center: [rec.city.center.lat, rec.city.center.lng],
      zoom: rec.city.zoom,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const basemap = this.createBasemap();
    basemap.addTo(map);
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

    const markerLayer = L.layerGroup().addTo(map);
    rec.map = map;
    rec.markerLayer = markerLayer;
    rec.eventLayer = L.layerGroup().addTo(map);

    const icon = this.createMarkerIcon();
    const globalIndex = this.venues.findIndex((v) => v.id === (venues[0] && venues[0].id));

    rec.markers = venues.map((venue, i) => {
      const marker = L.marker([venue.coordinates.lat, venue.coordinates.lng], {
        icon,
        riseOnHover: true,
      });
      marker.venueData = venue;
      marker._index = globalIndex === -1 ? i : globalIndex + i;
      marker.venueData._cat = marker._index + 1;
      marker.bindPopup('<div class="venue-popup loading">Cargando…</div>', {
        maxWidth: 320,
        minWidth: 260,
        className: 'venue-popup-wrapper',
      });
      marker.on('popupopen', () => this._renderPopup(marker));
      marker.on('click', () => this._syncHash(venue.id));

      markerLayer.addLayer(marker);
      return marker;
    });

    this.fitCity(rec);
    setTimeout(() => map.invalidateSize(), 350);
  },

  fitCity(rec) {
    if (!rec || !rec.map) return;
    if (rec.markers.length === 1) {
      rec.map.setView([rec.markers[0].getLatLng().lat, rec.markers[0].getLatLng().lng], 15);
      return;
    }
    if (rec.markers.length > 1) {
      const group = L.featureGroup(rec.markers);
      rec.map.fitBounds(group.getBounds().pad(0.2));
      return;
    }
    rec.map.setView([rec.city.center.lat, rec.city.center.lng], rec.city.zoom || 12);
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
      const shared = tokens.filter((t) => kk.split(/[^a-z0-9]+/).includes(t)).length;
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

  renderVenueList(el, venues) {
    const startIndex = this.venues.findIndex((v) => v.id === (venues[0] && venues[0].id));

    el.innerHTML = venues
      .map((v, i) => {
        const cat = startIndex === -1 ? i : startIndex + i;
        return `
      <div class="venue-card" data-venue-id="${v.id}" data-city="${v.city}">
        <div class="venue-index">Nº ${String(cat + 1).padStart(3, '0')}</div>
        <div class="venue-card-body">
          <div class="venue-card-header">
            <h3 class="venue-card-name">${v.name}</h3>
            <span class="venue-card-city">${v.city}</span>
          </div>
          <p class="venue-card-address">${v.address}</p>
        </div>
      </div>
    `;
      })
      .join('');

    el.querySelectorAll('.venue-card').forEach((card) => {
      card.addEventListener('click', () => {
        const venueId = card.dataset.venueId;
        this.goToVenue(venueId);
      });
    });
  },

  // ---------------------------------------------------------------- events layer

  // Overlay markers for community events (live feed). Curated club pins are
  // untouched; this layer is the "calendario vivo" on top of the territorio.
  renderEventLayer(rec, city) {
    const slug = this._citySlug(city.name);
    const cityEvents = this.events.filter((e) => this.cityKey(e.city) === city.name);
    rec.eventMarkers = cityEvents.map((ev) => this._makeEventMarker(rec, ev));

    const badgeEl = document.getElementById(`cityEvents-${slug}`);
    if (badgeEl) badgeEl.textContent = cityEvents.length > 0 ? `📅 ${cityEvents.length}` : '';
    this.updateToggleCount();
  },

  _makeEventMarker(rec, ev) {
    const marker = L.marker([ev.coords.lat, ev.coords.lng], {
      icon: this.createEventMarkerIcon(),
      riseOnHover: true,
    });
    marker.eventData = ev;
    marker.bindPopup(this._renderEventPopupHTML(ev), {
      maxWidth: 320,
      minWidth: 260,
      className: 'event-popup-wrapper',
    });
    marker.on('click', () => this._syncEventHash(ev.id));
    if (this._showEvents) rec.eventLayer.addLayer(marker);
    return marker;
  },

  createEventMarkerIcon() {
    return L.divIcon({
      className: 'event-marker-icon',
      html: `
        <div class="event-marker-pulse"></div>
        <div class="event-marker-pin">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
      `,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -44],
    });
  },

  bindEventsToggle() {
    const btn = document.getElementById('btnToggleEvents');
    if (!btn) return;
    btn.addEventListener('click', () => {
      this._showEvents = !this._showEvents;
      this.applyEventsVisibility();
    });
    btn.classList.toggle('active', this._showEvents);
    this.updateToggleCount();
  },

  applyEventsVisibility() {
    Object.values(this.maps).forEach((rec) => {
      (rec.eventMarkers || []).forEach((m) => {
        if (this._showEvents && !rec.eventLayer.hasLayer(m)) rec.eventLayer.addLayer(m);
        else if (!this._showEvents && rec.eventLayer.hasLayer(m)) rec.eventLayer.removeLayer(m);
      });
    });
    const btn = document.getElementById('btnToggleEvents');
    if (btn) btn.classList.toggle('active', this._showEvents);
  },

  updateToggleCount() {
    const total = this.events.length;
    const el = document.getElementById('eventsCountTotal');
    if (el) el.textContent = ` ${total} ${total === 1 ? 'evento' : 'eventos'} próximos`;
  },

  _renderEventPopupHTML(ev) {
    const esc = (s) => this._esc(s);
    const djs =
      ev.djs && ev.djs.length
        ? ev.djs.map((d) => `<span class="event-popup-dj">${esc(d)}</span>`).join('')
        : '<span class="event-popup-dj event-popup-dj-tba">TBA</span>';
    const price =
      ev.price && ev.price !== 'TBA'
        ? `<span class="event-popup-price">${esc(ev.price)}</span>`
        : '';
    const time = ev.time && ev.time !== 'TBA' ? ` · ${esc(ev.time)}` : '';
    const desc = ev.description ? `<p class="event-popup-desc">${esc(ev.description)}</p>` : '';
    return `
      <div class="event-popup">
        <div class="event-popup-head">
          <div class="event-popup-badge">COMUNIDAD</div>
          <h3 class="event-popup-name">${esc(ev.title)}</h3>
          ${price}
        </div>
        <p class="event-popup-meta">📅 ${this.esDate(ev.date)}${time}</p>
        <p class="event-popup-venue">📍 ${esc(ev.venue)}${ev.address ? ` · ${esc(ev.address)}` : ''}</p>
        <div class="event-popup-djs"><span class="event-popup-djs-label">🎧</span> ${djs}</div>
        ${desc}
        <div class="event-popup-actions">
          ${ev.url ? `<a href="${esc(ev.url)}" target="_blank" rel="noopener" class="popup-link">Info / Tickets →</a>` : ''}
          <a href="/3tres6muntanerRecords/#calendario" data-no-swup class="popup-link">Ver en el calendario →</a>
        </div>
      </div>
    `;
  },

  _esc(str) {
    return String(str === null || str === undefined ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  esDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return dateStr;
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return `${d.getDate()} de ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  // ---------------------------------------------------------------- navigation

  // Deep-link support: mapa.html#venue:<id> flies to + opens the venue on its
  // own city map.
  wireHash() {
    window.addEventListener('hashchange', () => this.openHash());
  },

  openHash() {
    const em = window.location.hash.match(/^#event:(.+)$/);
    if (em) {
      this.goToEvent(decodeURIComponent(em[1]));
      return;
    }
    const m = window.location.hash.match(/^#venue:(.+)$/);
    if (m) this.goToVenue(decodeURIComponent(m[1]));
  },

  goToEvent(eventId) {
    const ev = this.events.find((e) => e.id === eventId);
    if (!ev) return;
    const rec = this.maps[this.cityKey(ev.city)];
    if (!rec || !rec.map) return;
    if (!this._showEvents) {
      this._showEvents = true;
      this.applyEventsVisibility();
    }
    const marker = (rec.eventMarkers || []).find((m) => m.eventData.id === eventId);
    if (!marker) return;

    rec.map.flyTo(marker.getLatLng(), 16, { duration: 1.5, easeLinearity: 0.25 });
    setTimeout(() => marker.openPopup(), 600);
    this._syncEventHash(eventId);
  },

  _syncEventHash(hashId) {
    if (window.location.hash !== `#event:${hashId}`) {
      try {
        history.replaceState(null, '', `#event:${hashId}`);
      } catch (e) {
        /* noop */
      }
    }
  },

  goToVenue(venueId) {
    const venue = this.venues.find((v) => v.id === venueId);
    if (!venue) return;
    const rec = this.maps[venue.city];
    if (!rec || !rec.map) return;
    const marker = rec.markers.find((m) => m.venueData.id === venueId);
    if (!marker) return;

    rec.map.flyTo(marker.getLatLng(), 16, {
      duration: 1.5,
      easeLinearity: 0.25,
    });

    setTimeout(() => marker.openPopup(), 600);

    const listEl = document.getElementById(`venueList-${this._citySlug(venue.city)}`);
    document.querySelectorAll('.venue-card').forEach((c) => c.classList.remove('active'));
    if (listEl) {
      const card = listEl.querySelector(`.venue-card[data-venue-id="${venueId}"]`);
      if (card) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
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
};

// Initial boot (direct loads). Mapa is a full-load section (links into it
// carry data-no-swup), so a plain DOMContentLoaded init is sufficient.
document.addEventListener('DOMContentLoaded', () => {
  VenueMap.init();
});
