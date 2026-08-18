const EventSubmission = {
  init: function () {
    this.bindEvents();
  },

  apiBase: function () {
    // GH Pages mirror is static — it reads/posts to the store host via CORS.
    return window.location.hostname.endsWith('github.io')
      ? 'https://3tres6records.albto.me'
      : window.location.origin;
  },

  bindEvents: function () {
    const openBtn = document.getElementById('openEventSubmit');
    const modal = document.getElementById('eventSubmitModal');
    const closeBtn = document.getElementById('closeEventSubmit');
    const form = document.getElementById('eventSubmitForm');
    const addDjBtn = document.getElementById('addDjField');
    const djContainer = document.getElementById('djFields');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    if (addDjBtn && djContainer) {
      addDjBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'submit-input dj-input';
        input.placeholder = 'DJ name...';
        djContainer.appendChild(input);
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  },

  closeModal: function () {
    const modal = document.getElementById('eventSubmitModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  getDjList: function () {
    const inputs = document.querySelectorAll('.dj-input');
    return Array.from(inputs)
      .map((i) => i.value.trim())
      .filter((v) => v.length > 0);
  },

  handleSubmit: async function (e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const statusEl = document.getElementById('submitStatus');

    const payload = {
      title: form.title.value.trim(),
      date: form.date.value,
      time: form.time.value.trim(),
      venue: form.venue.value.trim(),
      address: form.address.value.trim(),
      city: form.city.value,
      djs: this.getDjList(),
      price: form.price.value.trim(),
      url: form.url.value.trim(),
      email: form.email.value.trim(),
      description: form.description.value.trim(),
      website: form.querySelector('[name="website"]')?.value || '',
    };

    if (!payload.title || !payload.date || !payload.venue) {
      statusEl.textContent = 'Completa el nombre, fecha y lugar.';
      statusEl.className = 'submit-status error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Publicando...';
    statusEl.textContent = '';

    try {
      const res = await fetch(`${this.apiBase()}/api/events.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let json = null;
      try {
        json = await res.json();
      } catch (err) {
        /* non-JSON body */
      }

      if (res.ok && json && json.success) {
        statusEl.textContent = '¡Publicado! Tu fiesta ya está en el calendario y en el mapa.';
        statusEl.className = 'submit-status success';

        if (typeof EventCalendar !== 'undefined' && EventCalendar.events && json.event) {
          EventCalendar.events.push(json.event);
          EventCalendar.renderCalendar();
        }

        setTimeout(() => this.closeModal(), 1500);
      } else if (json && json.error) {
        statusEl.textContent = json.error;
        statusEl.className = 'submit-status error';
      } else {
        statusEl.textContent =
          'Algo salió mal. Intenta en un momento o escríbenos: hola@3tres6records.com';
        statusEl.className = 'submit-status error';
      }
    } catch (err) {
      statusEl.textContent = 'Sin conexión. Escríbenos y lo publicamos: hola@3tres6records.com';
      statusEl.className = 'submit-status error';
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar Evento';
  },
};

document.addEventListener('DOMContentLoaded', () => EventSubmission.init());
