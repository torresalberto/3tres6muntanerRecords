const EventSubmission = {
  // Backend retired — event submission temporarily unavailable

  init: function() {
    this.bindEvents();
  },

  bindEvents: function() {
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

  closeModal: function() {
    const modal = document.getElementById('eventSubmitModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  getDjList: function() {
    const inputs = document.querySelectorAll('.dj-input');
    return Array.from(inputs).map(i => i.value.trim()).filter(v => v.length > 0);
  },

  handleSubmit: async function(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const statusEl = document.getElementById('submitStatus');

    const payload = {
      title: form.title.value.trim(),
      date: form.date.value,
      time: form.time.value || 'TBA',
      venue: form.venue.value.trim(),
      address: form.address.value.trim(),
      city: form.city.value.trim(),
      djs: this.getDjList(),
      genres: form.genres.value.trim().split(',').map(g => g.trim()).filter(g => g),
      price: form.price.value.trim() || 'TBA',
      url: form.url.value.trim(),
      email: form.email.value.trim(),
      description: form.description.value.trim()
    };

    if (!payload.title || !payload.date || !payload.venue) {
      statusEl.textContent = 'Please fill in title, date, and venue';
      statusEl.className = 'submit-status error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusEl.textContent = '';

    // Backend retired — event submission temporarily unavailable
    statusEl.textContent = '📧 Envíanos el evento por email: hola@3tres6records.com';
    statusEl.className = 'submit-status info';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Event';
    return;

    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Event';
  }
};

document.addEventListener('DOMContentLoaded', () => EventSubmission.init());
