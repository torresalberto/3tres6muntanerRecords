/**
 * Newsletter Popup — make.com ready
 * 1. Shows exit-intent popup when mouse leaves window
 * 2. Shows popup after 30s of browsing
 * 3. Handles form submission via make.com webhook
 * 4. Respects localStorage flags (never show after submit/dismiss)
 * 
 * TO ACTIVATE: Replace MAKECOM_WEBHOOK_URL below with your make.com URL
 */

const NewsletterPopup = {
  // =====================================================
  // 🔧 REPLACE THIS with your make.com webhook URL:
  MAKECOM_WEBHOOK_URL: 'https://hook.make.com/your-webhook-url-here',
  // =====================================================

  POPUP_DISMISSED_KEY: 'mtn_popup_dismissed',
  SUBSCRIBED_KEY: 'mtn_subscribed',

  init: function() {
    if (this.hasSubscribed() || this.wasDismissedRecently()) return;

    this.bindExitIntent();
    this.bindTimer();
    this.bindForm();
    this.bindClose();

    // Footer newsletter form
    this.bindFooterForm();
  },

  hasSubscribed: function() {
    return localStorage.getItem(this.SUBSCRIBED_KEY) === 'true';
  },

  wasDismissedRecently: function() {
    const dismissed = localStorage.getItem(this.POPUP_DISMISSED_KEY);
    if (!dismissed) return false;
    const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
    return daysSince < 7; // Don't show for 7 days after dismiss
  },

  show: function() {
    const popup = document.getElementById('exitPopup');
    if (popup) {
      popup.style.display = 'flex';
      popup.setAttribute('aria-hidden', 'false');
    }
  },

  hide: function() {
    const popup = document.getElementById('exitPopup');
    if (popup) {
      popup.style.display = 'none';
      popup.setAttribute('aria-hidden', 'true');
    }
  },

  bindExitIntent: function() {
    let exited = false;
    document.addEventListener('mouseleave', (e) => {
      if (exited) return;
      if (e.clientY > 0) return; // Only if mouse leaves from top
      if (this.hasSubscribed() || this.wasDismissedRecently()) return;
      exited = true;
      setTimeout(() => this.show(), 300);
    });
  },

  bindTimer: function() {
    setTimeout(() => {
      if (this.hasSubscribed() || this.wasDismissedRecently()) return;
      if (document.getElementById('exitPopup').style.display === 'flex') return;
      this.show();
    }, 30000); // 30 seconds
  },

  bindClose: function() {
    const closeBtn = document.getElementById('closeExitPopup');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide();
        localStorage.setItem(this.POPUP_DISMISSED_KEY, Date.now().toString());
      });
    }
  },

  bindForm: function() {
    const form = document.getElementById('exitPopupForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      if (!email) return;

      const btn = form.querySelector('button');
      btn.disabled = true;
      btn.textContent = 'Enviando...';

      try {
        await fetch(this.MAKECOM_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            source: 'exit-popup',
            timestamp: new Date().toISOString(),
            page: window.location.pathname
          })
        });

        localStorage.setItem(this.SUBSCRIBED_KEY, 'true');
        this.hide();
        alert('Gracias! Te hemos suscrito correctamente.');
      } catch(err) {
        // Fallback: even if webhook fails, mark as subscribed
        localStorage.setItem(this.SUBSCRIBED_KEY, 'true');
        this.hide();
      }

      btn.disabled = false;
      btn.textContent = 'Obtener 10% OFF';
    });
  },

  bindFooterForm: function() {
    const form = document.getElementById('footerNewsletterForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      if (!email) return;

      try {
        await fetch(this.MAKECOM_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            source: 'footer-newsletter',
            timestamp: new Date().toISOString(),
            page: window.location.pathname
          })
        });
        alert('\u00a1Gracias por suscribirte!');
        form.reset();
      } catch(err) {
        alert('Gracias! Te hemos registrado.');
        form.reset();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => NewsletterPopup.init());
