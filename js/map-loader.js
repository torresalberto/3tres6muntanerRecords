/**
 * Map Loader — renders the interactive venue map dynamically from JSON data.
 * Uses Leaflet.js + CartoDB Dark Matter tiles (no Google Cloud dependency).
 */
const VenueMap = {
  map: null,
  markers: [],
  markerLayer: null,
  activeCity: null,

  async init() {
    await this.loadData();
    this.renderMap();
    this.renderCityTabs();
    this.renderVenueList();
    setTimeout(() => this.fitAll(), 300);
  },

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

  renderMap() {
    const container = document.getElementById('venueMap');
    if (!container) return;

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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    this.addMarkers();
  },

  createMarkerIcon() {
    return L.divIcon({
      className: 'venue-marker-icon',
      html: `
        <div class="marker-pulse"></div>
        <div class="marker-pin">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
    this.markerLayer.clearLayers();
    this.markers = [];

    const icon = this.createMarkerIcon();

    this.venues.forEach((venue, index) => {
      const marker = L.marker(
        [venue.coordinates.lat, venue.coordinates.lng],
        { icon, riseOnHover: true }
      );

      const links = [];
      if (venue.links?.instagram) {
        links.push(`<a href="${venue.links.instagram}" target="_blank" rel="noopener" class="popup-link">Instagram</a>`);
      }
      if (venue.links?.ra) {
        links.push(`<a href="${venue.links.ra}" target="_blank" rel="noopener" class="popup-link">Resident Advisor</a>`);
      }
      if (venue.links?.website) {
        links.push(`<a href="${venue.links.website}" target="_blank" rel="noopener" class="popup-link">Sitio web</a>`);
      }

      const popupHtml = `
        <div class="venue-popup">
          <div class="popup-header">
            <h3 class="popup-name">${venue.name}</h3>
            <span class="popup-city-badge">${venue.city}</span>
          </div>
          <p class="popup-address">${venue.address}</p>
          <div class="popup-genres">
            ${(venue.genres || []).map((g) => `<span class="genre-tag">${g}</span>`).join('')}
          </div>
          ${venue.notes ? `<p class="popup-notes">${venue.notes}</p>` : ''}
          ${venue.soundsystem ? `<div class="popup-sound"><span class="sound-icon">🔊</span> ${venue.soundsystem}</div>` : ''}
          ${links.length ? `<div class="popup-links">${links.join('')}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 300,
        minWidth: 240,
        className: 'venue-popup-wrapper',
        closeButton: true,
      });

      marker.venueData = venue;
      marker._index = index;
      this.markers.push(marker);
      this.markerLayer.addLayer(marker);
    });
  },

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
        (v) => `
      <div class="venue-card" data-venue-id="${v.id}" data-city="${v.city}">
        <div class="venue-card-dot"></div>
        <div class="venue-card-body">
          <div class="venue-card-header">
            <h3 class="venue-card-name">${v.name}</h3>
          </div>
          <p class="venue-card-address">${v.address}</p>
          <div class="venue-card-genres">
            ${(v.genres || []).map((g) => `<span class="genre-tag">${g}</span>`).join('')}
          </div>
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

  goToVenue(venueId) {
    const marker = this.markers.find((m) => m.venueData.id === venueId);
    if (!marker) return;

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
    if (this.markers.length === 0) return;
    this.markers.forEach((m) => this.markerLayer.addLayer(m));

    if (this.markers.length === 1) {
      this.map.setView([this.markers[0].getLatLng().lat, this.markers[0].getLatLng().lng], 15);
      return;
    }

    const group = L.featureGroup(this.markers);
    this.map.fitBounds(group.getBounds().pad(0.15), { duration: 1 });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  VenueMap.init();
});
