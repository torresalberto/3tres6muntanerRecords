const EventCalendar = {
  // Backend retired — using local fallback only
  events: [],
  monthlyEvents: [],

  MONTHS: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
  MONTHS_FULL: [
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
  ],
  DAYS: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'],
  WEEKDAY_EN: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  init: async function () {
    await this.fetchEvents();
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();
    this.renderCalendar();
    this.bindDayClicks();
    this.bindModalClose();
    this.bindNavButtons();
  },

  apiBase: function () {
    // GH Pages mirror is static — the live feed is read from the store host
    // (community events + markers). Falls back silently to events.json otherwise.
    return window.location.hostname.endsWith('github.io')
      ? 'https://3tres6records.albto.me'
      : window.location.origin;
  },

  fetchLive: async function () {
    try {
      const res = await fetch(`${this.apiBase()}/api/events.php?live=1&_=${Date.now()}`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return Array.isArray(data && data.events)
        ? data.events.filter((e) => e.status === 'approved')
        : [];
    } catch (e) {
      console.warn('[EventCalendar] Live feed unavailable:', e.message);
      return [];
    }
  },

  fetchEvents: async function () {
    const merged = [];
    try {
      const res = await fetch('data/events/events.json?_=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) merged.push(...data.filter((e) => e.status === 'approved'));
      }
    } catch (e) {
      console.warn('[EventCalendar] Could not load events.json:', e.message);
    }

    const live = await this.fetchLive();
    const seen = new Set(merged.map((e) => e.id));
    live.forEach((e) => {
      // The live feed merges static + community; keep community rows not already present.
      if (e.community && e.id && !seen.has(e.id)) {
        merged.push(e);
        seen.add(e.id);
      }
    });

    this.events = merged;
  },

  // Return all events that fall on a specific date string (YYYY-MM-DD)
  getEventsForDate(dateStr) {
    return this.events.filter((e) => {
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

  renderCalendar: function () {
    const container = document.getElementById('dynamicCalendar');
    if (!container) return;

    const year = this.currentYear;
    const month = this.currentMonth;

    // Compact event list for the month (plus recurring hits on any day).
    const isToday = new Date();
    const list = [];
    const seen = new Set();
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      for (const e of this.getEventsForDate(dateStr)) {
        const key = e.id || `${e.title}|${e.date || e.recurring}|${e.venue}`;
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({ e, dateStr, day });
      }
    }
    // Recurring events without a matching weekday still in this month's window
    for (const e of this.events) {
      if (!e.recurring) continue;
      const key = e.id || `${e.title}|recurring|${e.venue}`;
      if (seen.has(key)) continue;
      // include all recurring staples for the month header count
      seen.add(key);
      list.push({ e, dateStr: null, day: null });
    }
    list.sort((a, b) => {
      const da = a.dateStr || '9999-99-99';
      const db = b.dateStr || '9999-99-99';
      if (da !== db) return da < db ? -1 : 1;
      return (a.e.time || '') < (b.e.time || '') ? -1 : 1;
    });

    const countCity = (country) =>
      this.events.filter((e) => {
        if (!e.country || e.country !== country) return false;
        if (e.recurring) return false;
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length;
    const bcnCount = countCity('ES');
    const mxCount = countCity('MX');
    const recurringCount = this.events.filter((e) => e.recurring).length;
    const total = bcnCount + mxCount + recurringCount;

    const countLine =
      total === 0
        ? 'Aún no hay eventos este mes'
        : `${total} ${total === 1 ? 'evento' : 'eventos'}` +
          (bcnCount ? ` · ${bcnCount} BCN` : '') +
          (mxCount ? ` · ${mxCount} CDMX` : '') +
          (recurringCount ? ` · ${recurringCount} recurrentes` : '');

    const rows = list.length
      ? list
          .map(({ e, dateStr, day }) => {
            const isCom = e.source === 'submission';
            const badge = isCom
              ? '<span class="event-platform submission-tag">COMUNIDAD</span>'
              : e.recurring
                ? '<span class="event-platform event-tag">RECURRENTE</span>'
                : '';
            const when =
              dateStr && day ? `${day} ${this.MONTHS[month]}` : e.recurring ? 'Cada semana' : '';
            const time = e.time
              ? e.time + (e.endTime && e.endTime !== 'late' ? '–' + e.endTime : '')
              : '';
            const price =
              e.price && e.price.toLowerCase().includes('free')
                ? '<span class="price-tag free-tag">GRATIS</span>'
                : e.price && e.price !== 'TBA'
                  ? `<span class="price-tag paid-tag">${e.price}</span>`
                  : '';
            const openable = dateStr ? ' clickable' : '';
            return `
              <div class="calendar-list-row${openable}"${
                dateStr ? ` data-date="${dateStr}" role="button" tabindex="0"` : ''
              }>
                <span class="calendar-list-when">${when}</span>
                <span class="calendar-list-title">${e.title}</span>
                <span class="calendar-list-venue">${e.venue || ''}${
                  e.city ? (e.venue ? ' · ' : '') + e.city : ''
                }</span>
                ${time ? `<span class="calendar-list-time">${time}</span>` : ''}
                ${price}
                ${badge}
              </div>`;
          })
          .join('')
      : '<div class="calendar-list-empty">Sin eventos publicados todavía.</div>';

    container.innerHTML = `
      <div class="calendar-month-header">
        <button class="cal-nav cal-nav-prev" id="calPrevMonth" aria-label="Mes anterior">‹</button>
        <span class="cal-month-label">${this.MONTHS_FULL[month].toUpperCase()} ${year}</span>
        <button class="cal-nav cal-nav-next" id="calNextMonth" aria-label="Mes siguiente">›</button>
      </div>
      <div class="cal-event-count">${countLine}</div>
      <div class="calendar-list" role="list">
        ${rows}
      </div>
    `;
  },

  bindNavButtons: function () {
    const container = document.getElementById('dynamicCalendar');
    if (!container) return;
    // Use event delegation so nav buttons work after every re-render
    container.addEventListener('click', (ev) => {
      if (ev.target.id === 'calPrevMonth') this.navigateMonth(-1);
      else if (ev.target.id === 'calNextMonth') this.navigateMonth(1);
    });
  },

  navigateMonth: function (delta) {
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

  bindDayClicks: function () {
    const container = document.getElementById('dynamicCalendar');
    if (!container) return;
    container.addEventListener('click', (ev) => {
      const row = ev.target.closest('.calendar-list-row.clickable');
      if (!row) return;
      this.openDayModal(row.getAttribute('data-date'));
    });
    container.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const row = ev.target.closest('.calendar-list-row.clickable');
      if (!row) return;
      ev.preventDefault();
      this.openDayModal(row.getAttribute('data-date'));
    });
  },

  openDayModal: function (dateStr) {
    const modal = document.getElementById('dayEventsModal');
    const titleEl = document.getElementById('dayEventsTitle');
    const listEl = document.getElementById('dayEventsList');
    if (!modal || !titleEl || !listEl) return;

    const events = this.getEventsForDate(dateStr);
    if (events.length === 0) return;

    // Format date: "Lunes 16 de Junio, 2026"
    const d = new Date(dateStr + 'T00:00:00');
    const wd = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][
      d.getDay()
    ];
    const pretty = `${wd} ${d.getDate()} de ${this.MONTHS_FULL[d.getMonth()]}, ${d.getFullYear()}`;
    titleEl.textContent = pretty;

    listEl.innerHTML = events.map((e) => this.renderEventCard(e)).join('');

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  },

  renderEventCard: function (e) {
    const djList =
      e.djs && e.djs.length > 0
        ? e.djs.map((d) => `<span class="dj-pill">${d}</span>`).join('')
        : '<span class="dj-pill dj-pill-tba">TBA</span>';

    const timeStr = e.time
      ? `<span>${e.time}${e.endTime && e.endTime !== 'late' ? ' – ' + e.endTime : ''}</span>`
      : '';

    const priceStr =
      e.price && e.price.toLowerCase().includes('free')
        ? '<span class="price-tag free-tag">GRATIS</span>'
        : e.price && e.price !== 'TBA'
          ? `<span class="price-tag paid-tag">${e.price}</span>`
          : '';

    const recurringTag = e.recurring ? '<span class="recurring-tag">Evento recurrente</span>' : '';

    const communityTag =
      e.source === 'submission'
        ? '<span class="community-tag">Agregado por la comunidad</span>'
        : '';

    const onMap =
      e.coords && e.coords.lat && e.coords.lng
        ? `<a class="event-link-map" data-no-swup href="mapa.html#event:${encodeURIComponent(e.id)}">Ver en el mapa →</a>`
        : '';

    return `
      <article class="day-event-card">
        <div class="day-event-header">
          <h4>${e.title}</h4>
          ${priceStr}
        </div>
        <div class="day-event-meta">
          <span><strong>${e.venue}</strong>${e.address ? `, ${e.address}` : ''}</span>
          <span>${e.city}${e.country ? ', ' + e.country : ''}</span>
          ${timeStr}
          ${recurringTag}
        </div>
        ${djList ? `<div class="day-event-djs"><span class="djs-label">Lineup:</span> ${djList}</div>` : ''}
        ${communityTag}
        <div class="day-event-actions">
          ${e.url ? `<a href="${e.url}" target="_blank" rel="noopener" class="event-link-primary">Info / Tickets →</a>` : '<span class="no-link-msg">Sin link público</span>'}
          ${onMap}
        </div>
      </article>
    `;
  },

  closeDayModal: function () {
    const modal = document.getElementById('dayEventsModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  },

  bindModalClose: function () {
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
  },
};

document.addEventListener('DOMContentLoaded', () => EventCalendar.init());
