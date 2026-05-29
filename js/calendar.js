const EventCalendar = {
  // Backend retired — using local fallback only
  events: [],
  monthlyEvents: [],

  MONTHS: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
  DAYS: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'],

  init: async function() {
    await this.fetchEvents();
    this.renderUpcoming();
    this.renderCalendar();
  },

  fetchEvents: async function() {
    // Backend retired — no live events API available
    this.events = [];
  },

  getUpcomingEvents: function() {
    const today = new Date();
    return this.events
      .filter(e => {
        if (e.recurring) return true;
        return new Date(e.date) >= new Date(today.toDateString());
      })
      .sort((a, b) => {
        if (a.recurring && b.recurring) return 0;
        if (a.recurring) return 1;
        if (b.recurring) return -1;
        return new Date(a.date) - new Date(b.date);
      })
      .slice(0, 6);
  },

  renderUpcoming: function() {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;

    const events = this.getUpcomingEvents();
    if (events.length === 0) {
      container.innerHTML = '<div class="no-events-msg">No upcoming events yet</div>';
      return;
    }

    container.innerHTML = events.map(e => {
      const djList = e.djs && e.djs.length > 0
        ? e.djs.slice(0, 3).join(', ') + (e.djs.length > 3 ? ' +' + (e.djs.length - 3) : '')
        : 'TBA';

      let dateStr = '';
      if (e.recurring) {
        dateStr = '<span class="event-badge weekly-badge">C/ DOM</span>';
      } else {
        const d = new Date(e.date);
        dateStr = `<span class="event-date-num">${d.getDate()}</span><span class="event-date-month">${this.MONTHS[d.getMonth()]}</span>`;
      }

      const priceTag = e.price && e.price.toLowerCase().includes('free')
        ? '<span class="price-tag free-tag">GRATIS</span>'
        : e.price !== 'TBA' ? `<span class="price-tag paid-tag">${e.price}</span>` : '';

      return `
        <div class="upcoming-event-card">
          <div class="event-date-badge">${dateStr}</div>
          <div class="event-info">
            <div class="event-card-header">
              <h4>${e.title}</h4>
              ${priceTag}
            </div>
            <div class="event-meta">
              <span>📍 ${e.venue}, ${e.city}</span>
              <span>🎧 ${djList}</span>
              ${e.time ? `<span>⏱ ${e.time}${e.endTime && e.endTime !== 'late' ? ' - ' + e.endTime : ''}</span>` : ''}
            </div>
            ${e.url ? `<a href="${e.url}" target="_blank" rel="noopener" class="event-link">Info / Tickets →</a>` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  renderCalendar: function() {
    const container = document.getElementById('dynamicCalendar');
    if (!container) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
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
      const dayEvents = this.events.filter(e => {
        if (e.recurring) return true;
        return e.date === dateStr;
      });
      const hasEvents = dayEvents.length > 0;
      const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
      const todayClass = isToday ? 'today' : '';
      const eventClass = hasEvents ? 'has-events' : '';

      let eventHtml = '';
      if (hasEvents) {
        eventHtml = dayEvents.slice(0, 2).map(e => {
          const type = e.genres && e.genres.length > 0 ? e.genres[0].toLowerCase() : 'house';
          const platformClass = e.source === 'submission' ? 'submission-tag' : `${type}-tag`;
          return `
            <div class="calendar-event ${type}-event" title="${e.title}">
              <span class="event-platform ${platformClass}">${e.recurring ? '🔄 C/DOM' : type}</span>
              <span class="event-name">${e.title.length > 20 ? e.title.slice(0, 18) + '...' : e.title}</span>
              ${e.url ? `<a href="${e.url}" target="_blank" class="event-watch-link">→</a>` : ''}
            </div>
          `;
        }).join('');
      }

      cells += `
        <div class="calendar-day ${todayClass} ${eventClass}">
          <span class="day-number">${day}</span>
          ${eventHtml}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="calendar-month-header">
        <span>${this.MONTHS[month]} ${year}</span>
      </div>
      ${header}
      <div class="calendar-body">${cells}</div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => EventCalendar.init());
