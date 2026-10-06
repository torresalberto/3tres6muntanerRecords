/*
 * alberto.js — "FOLLETO" (crew member ALB, Nº 002).
 *
 *   1. Mixcloud facade — nothing loads until the reader presses play
 *   2. The wall viewer — Esc / ← / →, body lock, number-only label
 *   3. Scroll reveals, gated behind the `fc-js` marker so a JS-less visit
 *      still sees every photo (cuts reveal on opacity only — their rotation
 *      lives in CSS transforms that a translate would clobber)
 */
(function () {
  'use strict';

  var MIXCLOUD_WIDGET =
    'https://player-widget.mixcloud.com/widget/iframe/?feed=__FEED__&hide_cover=1&light=0&autoplay=0';

  /* ------------------------------------------------------------ mix facade */

  function initMix() {
    var button = document.getElementById('fcPlay');
    var embed = document.getElementById('fcEmbed');
    var card = document.getElementById('fcSet');
    if (!button || !embed || !card || button.dataset.ready === '1') return;
    button.dataset.ready = '1';

    button.addEventListener('click', function () {
      var feed = button.getAttribute('data-feed');
      if (!feed) return;
      var iframe = document.createElement('iframe');
      iframe.src = MIXCLOUD_WIDGET.replace('__FEED__', encodeURIComponent(feed));
      iframe.title = 'Minimix OCT2 — ALB en Mixcloud';
      iframe.width = '100%';
      iframe.height = '400';
      iframe.style.border = '0';
      iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.loading = 'lazy';
      embed.hidden = false;
      embed.appendChild(iframe);
      card.classList.add('is-playing');
      button.hidden = true;
      iframe.focus();
    });
  }

  /* --------------------------------------------------------- the viewer */

  function initViewer() {
    var wall = document.getElementById('fcWall');
    if (!wall || wall.dataset.ready === '1') return;
    wall.dataset.ready = '1';

    var cuts = Array.prototype.slice.call(wall.querySelectorAll('.fc-cut'));
    if (!cuts.length) return;

    var plates = cuts.map(function (cut) {
      var img = cut.querySelector('img');
      var nr = cut.querySelector('.fc-stamp');
      return {
        src: img.getAttribute('src'),
        w: parseInt(img.getAttribute('width'), 10) || 640,
        h: parseInt(img.getAttribute('height'), 10) || 480,
        alt: img.alt || '',
        nr: nr ? nr.textContent.trim() : '',
      };
    });

    var box = document.createElement('div');
    box.className = 'fc-viewer';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Foto a pantalla completa');
    box.innerHTML =
      '<button type="button" class="fc-v-btn fc-v-close" aria-label="Cerrar">Cerrar ✕</button>' +
      '<button type="button" class="fc-v-btn fc-v-prev" aria-label="Foto anterior">‹</button>' +
      '<button type="button" class="fc-v-btn fc-v-next" aria-label="Foto siguiente">›</button>' +
      '<figure><span class="fc-v-mat"><img alt="" /></span>' +
      '<figcaption class="fc-stamp"></figcaption></figure>';
    document.body.appendChild(box);

    var img = box.querySelector('img');
    var nr = box.querySelector('figcaption');
    var current = 0;
    var lastFocus = null;

    img.src = plates[0].src;
    img.alt = plates[0].alt;

    function pad(n) {
      return String(n).padStart(2, '0');
    }

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

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      box.querySelector('.fc-v-close').focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    cuts.forEach(function (cut, i) {
      var btn = cut.querySelector('.fc-ink');
      if (btn) {
        btn.addEventListener('click', function () {
          open(i);
        });
      }
    });

    box.querySelector('.fc-v-close').addEventListener('click', close);
    box.querySelector('.fc-v-prev').addEventListener('click', function () {
      show(current - 1);
    });
    box.querySelector('.fc-v-next').addEventListener('click', function () {
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

  /* ------------------------------------------------------------- reveals */

  function initReveal() {
    var fade = document.querySelectorAll('.fc-sec-head, .fc-set-card, .fc-rows, .fc-mq');
    var fadeO = document.querySelectorAll('.fc-cut');

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

    Array.prototype.forEach.call(fade, function (el) {
      el.classList.add('fc-fade');
      observer.observe(el);
    });
    Array.prototype.forEach.call(fadeO, function (el, i) {
      el.classList.add('fc-fade-o');
      el.style.transitionDelay = (i % 3) * 60 + 'ms';
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
