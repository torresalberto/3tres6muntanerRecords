/*
 * alberto.js — "ARCHIVO" (crew member Nº 002).
 *
 * Same three jobs as the dark pass, different furniture:
 *   1. Mixcloud facade — nothing loads until the reader presses play
 *   2. The gallery viewer — paper-light overlay, Esc / ← / →, body lock
 *   3. Quiet IntersectionObserver fades, gated behind the `ar-js` marker so a
 *      JS-less visit still sees every print
 */
(function () {
  'use strict';

  var MIXCLOUD_WIDGET =
    'https://player-widget.mixcloud.com/widget/iframe/?feed=__FEED__&hide_cover=1&light=0&autoplay=0';

  /* ------------------------------------------------------------ mix facade */

  function initMix() {
    var button = document.getElementById('arPlay');
    var embed = document.getElementById('arEmbed');
    var deck = document.getElementById('arDeck');
    if (!button || !embed || !deck || button.dataset.ready === '1') return;
    button.dataset.ready = '1';

    button.addEventListener('click', function () {
      var feed = button.getAttribute('data-feed');
      if (!feed) return;
      var iframe = document.createElement('iframe');
      iframe.src = MIXCLOUD_WIDGET.replace('__FEED__', encodeURIComponent(feed));
      iframe.title = 'Minimix OCT2 — albtome en Mixcloud';
      iframe.width = '100%';
      iframe.height = '400';
      iframe.style.border = '0';
      iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.loading = 'lazy';
      embed.hidden = false;
      embed.appendChild(iframe);
      deck.classList.add('is-playing');
      button.hidden = true;
      iframe.focus();
    });
  }

  /* ----------------------------------------------------------- the viewer */

  function initViewer() {
    var hang = document.getElementById('arHang');
    if (!hang || hang.dataset.ready === '1') return;
    hang.dataset.ready = '1';

    var works = Array.prototype.slice.call(hang.querySelectorAll('.ar-work'));
    if (!works.length) return;

    var plates = works.map(function (work) {
      var img = work.querySelector('img');
      var nr = work.querySelector('.ar-plate-nr');
      return {
        src: img.getAttribute('src'),
        w: parseInt(img.getAttribute('width'), 10) || 640,
        h: parseInt(img.getAttribute('height'), 10) || 480,
        alt: img.alt || '',
        nr: nr ? nr.textContent.trim() : '',
      };
    });

    var box = document.createElement('div');
    box.className = 'ar-viewer';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Pieza a pantalla completa');
    box.innerHTML =
      '<button type="button" class="ar-v-btn ar-v-close" aria-label="Cerrar">Cerrar ✕</button>' +
      '<button type="button" class="ar-v-btn ar-v-prev" aria-label="Pieza anterior">‹</button>' +
      '<button type="button" class="ar-v-btn ar-v-next" aria-label="Pieza siguiente">›</button>' +
      '<figure><span class="ar-mat"><img alt="" /></span><figcaption class="ar-plate">' +
      '<span class="ar-plate-nr"></span></figcaption></figure>';
    document.body.appendChild(box);

    var img = box.querySelector('img');
    var nr = box.querySelector('.ar-plate-nr');
    var current = 0;
    var lastFocus = null;

    // Seed with the first print so the overlay never holds an empty image.
    img.src = plates[0].src;
    img.alt = plates[0].alt;

    function show(i) {
      current = (i + plates.length) % plates.length;
      var plate = plates[current];
      img.style.animation = 'none';
      void img.offsetWidth;
      img.style.animation = '';
      img.src = plate.src;
      img.setAttribute('width', String(plate.w));
      img.setAttribute('height', String(plate.h));
      img.alt = plate.alt;
      nr.textContent = plate.nr + ' · ' + pad(current + 1) + ' / ' + pad(plates.length);
    }

    function pad(n) {
      return String(n).padStart(2, '0');
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      box.querySelector('.ar-v-close').focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    works.forEach(function (work, i) {
      var btn = work.querySelector('.ar-mount');
      if (!btn) return;
      btn.addEventListener('click', function () {
        open(i);
      });
    });

    box.querySelector('.ar-v-close').addEventListener('click', close);
    box.querySelector('.ar-v-prev').addEventListener('click', function () {
      show(current - 1);
    });
    box.querySelector('.ar-v-next').addEventListener('click', function () {
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

  /* --------------------------------------------------------------- reveals */

  function initReveal() {
    var targets = document.querySelectorAll(
      '.ar-room-head, .ar-deck, .ar-hall-head, .ar-work, .ar-log-head, .ar-rows, .ar-frontis, .ar-index, .ar-lede, .ar-ledger'
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
      { rootMargin: '0px 0px -5% 0px', threshold: 0.05 }
    );

    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add('ar-fade');
      if (el.classList.contains('ar-work')) {
        el.style.transitionDelay = (i % 3) * 70 + 'ms';
      }
      observer.observe(el);
    });
  }

  function init() {
    initMix();
    initViewer();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
