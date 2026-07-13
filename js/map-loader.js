/**
 * Map Loader — renders the interactive venue map dynamically from JSON data.
 * Uses Leaflet.js + OpenStreetMap (no Google Cloud dependency).
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
    this.fitAll();
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
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    this.addMarkers();
  },

  addMarkers() {
    this.markerLayer.clearLayers();
    this.markers = [];

    const icon = L.divIcon({
      className: 'venue-marker',
      html: '<div class="marker-dot"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    this.venues.forEach((venue) => {
      const marker = L.marker(
        [venue.coordinates.lat, venue.coordinates.lng],
        { icon }
      );

      const popupHtml = `
        <div class="venue-popup">
          <h3 class="popup-name">${venue.name}</h3>
          <p class="popup-city">${venue.city}, ${venue.country}</p>
          <p class="popup-address">${venue.address}</p>
          <div class="popup-genres">
            ${(venue.genres || []).map((g) => `<span class="genre-tag">${g}</span>`).join('')}
          </div>
          ${venue.notes ? `<p class="popup-notes">${venue.notes}</p>` : ''}
          ${venue.soundsystem ? `<p class="popup-sound">🔊 ${venue.soundsystem}</p>` : ''}
          <div class="popup-links">
            ${venue.links?.instagram ? `<a href="${venue.links.instagram}" target="_blank" rel="noopener">Instagram</a>` : ''}
            ${venue.links?.ra ? `<a href="${venue.links.ra}" target="_blank" rel="noopener">RA</a>` : ''}
            ${venue.links?.website ? `<a href="${venue.links.website}" target="_blank" rel="noopener">Web</a>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 280,
        className: 'venue-popup-wrapper',
      });

      marker.venueData = venue;
      this.markers.push(marker);
      this.markerLayer.addLayer(marker);
    });
  },

  renderCityTabs() {
    const container = document.getElementById('cityTabs');
    if (!container) return;

    const allTab = `<button class="city-tab active" data-city="all">All Cities</button>`;
    const cityTabs = this.cities
      .map(
        (city) =>
          `<button class="city-tab" data-city="${city.name}">${city.name}</button>`
      )
      .join('');

    container.innerHTML = allTab + cityTabs;

    container.querySelectorAll('.city-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.city-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const city = tab.dataset.city;
        this.filterByCity(city);
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
        <div class="venue-card-header">
          <h3 class="venue-card-name">${v.name}</h3>
          <span class="venue-card-city">${v.city}</span>
        </div>
        <p class="venue-card-address">${v.address}</p>
        <div class="venue-card-genres">
          ${(v.genres || []).map((g) => `<span class="genre-tag">${g}</span>`).join('')}
        </div>
        ${v.soundsystem ? `<p class="venue-card-sound">🔊 ${v.soundsystem}</p>` : ''}
      </div>
    `
      )
      .join('');

    container.querySelectorAll('.venue-card').forEach((card) => {
      card.addEventListener('click', () => {
        const venueId = card.dataset.venueId;
        const marker = this.markers.find((m) => m.venueData.id === venueId);
        if (marker) {
          this.map.setView(marker.getLatLng(), 16);
          marker.openPopup();
        }
      });
    });
  },

  filterByCity(city) {
    const cards = document.querySelectorAll('.venue-card');
    cards.forEach((card) => {
      if (city === 'all' || card.dataset.city === city) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    if (city === 'all') {
      this.fitAll();
    } else {
      const cityData = this.cities.find((c) => c.name === city);
      if (cityData) {
        this.map.setView([cityData.center.lat, cityData.center.lng], cityData.zoom);
      }

      this.markers.forEach((m) => {
        if (m.venueData.city === city) {
          this.markerLayer.addLayer(m);
        } else {
          this.markerLayer.removeLayer(m);
        }
      });
    }

    this.activeCity = city;
  },

  fitAll() {
    if (this.markers.length === 0) return;

    this.markers.forEach((m) => this.markerLayer.addLayer(m));

    const group = L.featureGroup(this.markers);
    this.map.fitBounds(group.getBounds().pad(0.1));
  },
};

document.addEventListener('DOMContentLoaded', () => {
  VenueMap.init();
});
