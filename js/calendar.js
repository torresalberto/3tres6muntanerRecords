const EventCalendar = {
  // Backend retired — using local fallback only
  events: [],
  monthlyEvents: [],

  MONTHS: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
  MONTHS_FULL: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  DAYS: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'],
  WEEKDAY_EN: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  init: async function() {
    await this.fetchEvents();
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();
    this.renderCalendar();
    this.bindDayClicks();
    this.bindModalClose();
    this.bindNavButtons();
  },

  fetchEvents: async function() {
    // Load events from local JSON manifest (populated by scripts/scrape-events.js)
    try {
      const res = await fetch('data/events/events.json?_=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      this.events = Array.isArray(data) ? data.filter(e => e.status === 'approved') : [];
    } catch (e) {
      console.warn('[EventCalendar] Could not load events.json:', e.message);
      this.events = [];
    }
  },

  // Return all events that fall on a specific date string (YYYY-MM-DD) in the current month
  getEventsForDate: function(dateStr) {
    return this.events.filter(e => {
      if (e.recurring) {
        if (Array.isArray(e.recurringDays) && e.recurringDays.length) {
          const d = new Date(dateStr + 'T00:00:00');
          const dayName = this.WEEKDAY_EN[d.getDay()];
          return e.recurringDays.includes(dayName);
        }
        return false;
      }
      return e.date === dateStr;
    });
  },

  renderCalendar: function() {
    const container = document.getElementById('dynamicCalendar');
    if (!container) return;

    const year = this.currentYear;
    const month = this.currentMonth;
    const now = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const header = `
      <div class="calendar-header-row">
        ${this.DAYS.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
      </div>
    `;

    let cells = '';
    for (let i = 0; i < firstDay; i++) {
      cells += '<div class="calendar-day empty"></div>';
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = this.getEventsForDate(dateStr);
      const hasEvents = dayEvents.length > 0;
      const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
      const todayClass = isToday ? 'today' : '';
      const eventClass = hasEvents ? 'has-events' : '';
      const clickable = hasEvents ? 'clickable' : '';

      let eventHtml = '';
      if (hasEvents) {
        eventHtml = dayEvents.slice(0, 2).map(e => {
          const type = e.genres && e.genres.length > 0 ? e.genres[0].toLowerCase() : 'house';
          const platformClass = e.source === 'submission' ? 'submission-tag' : `${type}-tag`;
          return `
            <div class="calendar-event ${type}-event" title="${e.title}">
              <span class="event-platform ${platformClass}">${e.recurring ? '🔄 C/DOM' : type}</span>
              <span class="event-name">${e.title.length > 20 ? e.title.slice(0, 18) + '...' : e.title}</span>
            </div>
          `;
        }).join('');
        if (dayEvents.length > 2) {
          eventHtml += `<div class="calendar-more-events">+${dayEvents.length - 2} más</div>`;
        }
      }

      cells += `
        <div class="calendar-day ${todayClass} ${eventClass} ${clickable}" data-date="${dateStr}">
          <span class="day-number">${day}</span>
          ${eventHtml}
        </div>
      `;
    }

    // Count BCN events in this view for the subtitle
    const bcnCount = this.events.filter(e => {
      if (!e.country || e.country !== 'ES') return false;
      if (e.recurring) return false; // recurring is CDMX
      if (!e.date) return false;
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;

    container.innerHTML = `
      <div class="calendar-month-header">
        <button class="cal-nav cal-nav-prev" id="calPrevMonth" aria-label="Mes anterior">‹</button>
        <span class="cal-month-label">${this.MONTHS_FULL[month].toUpperCase()} ${year}</span>
        <button class="cal-nav cal-nav-next" id="calNextMonth" aria-label="Mes siguiente">›</button>
      </div>
      <div class="cal-event-count">${bcnCount} ${bcnCount === 1 ? 'evento BCN' : 'eventos BCN'} este mes</div>
      ${header}
      <div class="calendar-body">${cells}</div>
    `;
  },

  bindNavButtons: function() {
    const container = document.getElementById('dynamicCalendar');
    if (!container) return;
    // Use event delegation so nav buttons work after every re-render
    container.addEventListener('click', (ev) => {
      if (ev.target.id === 'calPrevMonth') this.navigateMonth(-1);
      else if (ev.target.id === 'calNextMonth') this.navigateMonth(1);
    });
  },

  navigateMonth: function(delta) {
    this.currentMonth += delta;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear -= 1;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    }
    this.renderCalendar();
  },

  bindDayClicks: function() {
    const container = document.getElementById('dynamicCalendar');
    if (!container) return;
    container.addEventListener('click', (ev) => {
      const day = ev.target.closest('.calendar-day.clickable');
      if (!day) return;
      const dateStr = day.getAttribute('data-date');
      this.openDayModal(dateStr);
    });
  },

  openDayModal: function(dateStr) {
    const modal = document.getElementById('dayEventsModal');
    const titleEl = document.getElementById('dayEventsTitle');
    const listEl = document.getElementById('dayEventsList');
    if (!modal || !titleEl || !listEl) return;

    const events = this.getEventsForDate(dateStr);
    if (events.length === 0) return;

    // Format date: "Lunes 16 de Junio, 2026"
    const d = new Date(dateStr + 'T00:00:00');
    const wd = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()];
    const pretty = `${wd} ${d.getDate()} de ${this.MONTHS_FULL[d.getMonth()]}, ${d.getFullYear()}`;
    titleEl.textContent = pretty;

    listEl.innerHTML = events.map(e => this.renderEventCard(e)).join('');

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  },

  renderEventCard: function(e) {
    const djList = e.djs && e.djs.length > 0
      ? e.djs.map(d => `<span class="dj-pill">${d}</span>`).join('')
      : '<span class="dj-pill dj-pill-tba">TBA</span>';

    const timeStr = e.time
      ? `<span>⏱ ${e.time}${e.endTime && e.endTime !== 'late' ? ' – ' + e.endTime : ''}</span>`
      : '';

    const genresStr = e.genres && e.genres.length > 0
      ? e.genres.map(g => `<span class="genre-pill">${g}</span>`).join(' ')
      : '';

    const priceStr = e.price && e.price.toLowerCase().includes('free')
      ? '<span class="price-tag free-tag">GRATIS</span>'
      : e.price && e.price !== 'TBA' ? `<span class="price-tag paid-tag">${e.price}</span>` : '';

    const recurringTag = e.recurring
      ? '<span class="recurring-tag">🔄 Evento recurrente</span>'
      : '';

    return `
      <article class="day-event-card">
        <div class="day-event-header">
          <h4>${e.title}</h4>
          ${priceStr}
        </div>
        <div class="day-event-meta">
          <span>📍 <strong>${e.venue}</strong>${e.address ? `, ${e.address}` : ''}</span>
          <span>🏙 ${e.city}${e.country ? ', ' + e.country : ''}</span>
          ${timeStr}
          ${recurringTag}
        </div>
        ${genresStr ? `<div class="day-event-genres">${genresStr}</div>` : ''}
        ${djList ? `<div class="day-event-djs"><span class="djs-label">🎧 Lineup:</span> ${djList}</div>` : ''}
        <div class="day-event-actions">
          ${e.url ? `<a href="${e.url}" target="_blank" rel="noopener" class="event-link-primary">Info / Tickets →</a>` : '<span class="no-link-msg">Sin link público</span>'}
        </div>
      </article>
    `;
  },

  closeDayModal: function() {
    const modal = document.getElementById('dayEventsModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  },

  bindModalClose: function() {
    const modal = document.getElementById('dayEventsModal');
    const closeBtn = document.getElementById('closeDayEvents');
    if (!modal) return;
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDayModal());
    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) this.closeDayModal();
    });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') this.closeDayModal();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => EventCalendar.init());
