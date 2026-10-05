(function () {
  'use strict';

  var MIXCLOUD_WIDGET =
    'https://player-widget.mixcloud.com/widget/iframe/?feed=__FEED__&hide_cover=1&light=0&autoplay=0';

  /* ------------------------------------------------------------------ mix */

  function initMix() {
    var button = document.getElementById('abPlay');
    var embed = document.getElementById('abEmbed');
    var card = document.getElementById('abMix');
    if (!button || !embed || !card || button.dataset.ready === '1') return;
    button.dataset.ready = '1';

    button.addEventListener('click', function () {
      var feed = button.getAttribute('data-feed');
      if (!feed) return;
      var iframe = document.createElement('iframe');
      iframe.src = MIXCLOUD_WIDGET.replace('__FEED__', encodeURIComponent(feed));
      iframe.title = 'Minimix OCT2 — albtome en Mixcloud';
      iframe.width = '100%';
      iframe.height = '400';
      iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.loading = 'lazy';
      embed.hidden = false;
      embed.appendChild(iframe);
      card.classList.add('is-playing');
      iframe.focus();
    });
  }

  /* ------------------------------------------------------------- lightbox */

  function initLightbox() {
    var sheet = document.getElementById('abSheet');
    if (!sheet || sheet.dataset.ready === '1') return;
    sheet.dataset.ready = '1';

    var frames = Array.prototype.slice.call(sheet.querySelectorAll('.ab-frame'));
    if (!frames.length) return;
    var alts = frames.map(function (f) {
      var img = f.querySelector('img');
      return (img && img.alt) || '';
    });

    var box = document.createElement('div');
    box.className = 'ab-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Foto a pantalla completa');
    box.innerHTML =
      '<button type="button" class="ab-lb-btn ab-lb-close" aria-label="Cerrar">✕</button>' +
      '<button type="button" class="ab-lb-btn ab-lb-prev" aria-label="Foto anterior">‹</button>' +
      '<button type="button" class="ab-lb-btn ab-lb-next" aria-label="Foto siguiente">›</button>' +
      '<figure><img alt="" /><figcaption><span class="ab-lb-text"></span>' +
      '<span class="ab-lb-count"></span></figcaption></figure>';
    document.body.appendChild(box);

    var img = box.querySelector('img');
    var text = box.querySelector('.ab-lb-text');
    var count = box.querySelector('.ab-lb-count');
    var current = 0;
    var lastFocus = null;

    var seed = frames[0].querySelector('img');
    img.src = seed.src;
    img.alt = seed.alt || '';

    function show(i) {
      current = (i + frames.length) % frames.length;
      var source = frames[current].querySelector('img');
      img.src = source.currentSrc || source.src;
      img.alt = source.alt || '';
      text.textContent = alts[current];
      count.textContent =
        String(current + 1).padStart(2, '0') + ' / ' + String(frames.length).padStart(2, '0');
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      box.querySelector('.ab-lb-close').focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    frames.forEach(function (frame, i) {
      frame.addEventListener('click', function () {
        open(i);
      });
    });

    box.querySelector('.ab-lb-close').addEventListener('click', close);
    box.querySelector('.ab-lb-prev').addEventListener('click', function () {
      show(current - 1);
    });
    box.querySelector('.ab-lb-next').addEventListener('click', function () {
      show(current + 1);
    });
    box.addEventListener('click', function (e) {
      if (e.target === box) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* --------------------------------------------------------------- reveal */

  function initReveal() {
    var targets = document.querySelectorAll(
      '.ab-shead, .ab-mix, .ab-frame, .ab-link, .ab-stats, .ab-sheet-hint'
    );
    if (!targets.length) return;

    var reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add('ab-reveal');
      if (el.classList.contains('ab-frame')) {
        el.style.transitionDelay = (i % 6) * 45 + 'ms';
      }
      observer.observe(el);
    });
  }

  function init() {
    initMix();
    initLightbox();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
