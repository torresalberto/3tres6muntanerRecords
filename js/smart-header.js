/*
 * smart-header.js — crew chrome behaviour (crew.html + crew member pages).
 *
 * The fixed header used to leave a band above itself once the ticker scrolled
 * away, so content scrubbed through the gap. Crew pages now ship without the
 * ribbon and pin the header to top: 0; this script only adds the reveal
 * behaviour: hide while scrolling down, come back as soon as the reader scrolls
 * up. The flow spacer keeps its height, so nothing can shift or overlap.
 *
 * Opt in from markup with <header class="header" data-smart-header>.
 */
(function () {
  'use strict';

  var header = document.querySelector('[data-smart-header]');
  if (!header || !('IntersectionObserver' in window)) return;

  var HIDE_AFTER = 140; // never hide this close to the top of the page
  var lastY = window.scrollY;
  var ticking = false;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setHidden(hidden) {
    header.classList.toggle('is-tucked', hidden);
  }

  function locked() {
    // Never hide while the mobile drawer or any modal surface is open.
    if (document.body.classList.contains('menu-open')) return true;
    return !!document.querySelector('.ab-lightbox.is-open, .crew-boot ~ * [aria-modal="true"]');
  }

  function update() {
    ticking = false;
    var y = Math.max(0, window.scrollY);
    var delta = y - lastY;
    lastY = y;

    if (reduced) {
      setHidden(false);
      return;
    }
    if (y <= HIDE_AFTER) {
      setHidden(false);
      return;
    }
    if (locked()) {
      setHidden(false);
      return;
    }
    if (delta > 6) setHidden(true);
    else if (delta < -6) setHidden(false);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  // A tucked header must never trap focus or keyboard users out of reach.
  header.addEventListener('focusin', function () {
    setHidden(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setHidden(false);
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  update();
})();
