/**
 * Swup initializer — enables seamless page transitions.
 *
 * Goal: keep the audio player (#audioControls + #youtubeAudioContainer) ALIVE
 * across navigations, so music never cuts off when users click between
 * index, 3d-brain, blog, dj-library, product, dj/* and toolhub pages.
 *
 * Strategy:
 *  - Swup swaps elements matching [data-swup] containers.
 *  - The audio player is placed OUTSIDE the swup container (in <body>,
 *    before <main>) so it never gets replaced.
 *  - Other per-page init code is registered through window.Muntaner336.onPageView
 *    and re-invoked on every "page:view" event.
 */
(function () {
  'use strict';

  if (typeof window.Swup === 'undefined') {
    console.warn('[swup-init] Swup not loaded — falling back to standard navigation.');
    return;
  }

  // Container that Swup will swap on every navigation.
  // Each page wraps its main content in <main data-swup>...</main>.
  var swup = new window.Swup({
    containers: ['[data-swup]'],
    // Cache the new page so back/forward is instant.
    cache: true,
    // Respect <a target="_blank">, rel="external", downloads, mailto:, tel:
    linkSelector:
      'a[href]:not([data-no-swup]):not([target="_blank"])' +
      ':not([rel="external"]):not([download])' +
      ':not([href^="mailto:"]):not([href^="tel:"])' +
      ':not([href^="#"]):not([href^="javascript:"])',
  });

  // Make it globally accessible so other scripts can hook in.
  window.swup = swup;
  window.Muntaner336 = window.Muntaner336 || {};

  // Registry of per-page "view" handlers. Each page that needs to
  // re-initialize something after a navigation registers a callback here.
  // The first handler runs on the initial load; subsequent ones run on
  // every page:view event.
  var viewHandlers = [];
  window.Muntaner336.onPageView = function (handler) {
    if (typeof handler === 'function') {
      viewHandlers.push(handler);
      // Run immediately on first registration if DOM is already ready.
      if (document.readyState !== 'loading') {
        try {
          handler(document);
        } catch (err) {
          console.error('[swup-init] onPageView handler failed:', err);
        }
      }
    }
  };

  function runViewHandlers() {
    viewHandlers.forEach(function (handler) {
      try {
        handler(document);
      } catch (err) {
        console.error('[swup-init] onPageView handler failed:', err);
      }
    });
  }

  // Run handlers on the initial page load too.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runViewHandlers);
  } else {
    runViewHandlers();
  }

  // Re-run on every Swup navigation.
  swup.hooks.on('page:view', runViewHandlers);

  // Also re-run after a popstate (back/forward). Swup fires page:view on
  // popstate as well, but this is a safety net for browsers that swallow it.
  window.addEventListener('popstate', function () {
    setTimeout(runViewHandlers, 50);
  });

  console.log('[swup-init] Swup active. Audio player will survive navigation.');
})();
