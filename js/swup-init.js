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
    // Also fix the subnav active tab, which lives OUTSIDE the swup
    // container and therefore keeps the .active class from the previous
    // page. Without this, clicking "Blog" on dj-library leaves "DJ Library"
    // highlighted on the new page.
    updateSubnavActive();
  }

  /**
   * Map a subnav tab's href to a section id.
   *   blog.html               -> "blog"
   *   dj-library.html         -> "library"
   *   3d-brain.html           -> "neural"
   *   ./  or ../toolhub/      -> "tools"
   *   ./#hardware             -> "hardware"
   */
  function getTabSection(tab) {
    var href = (tab.getAttribute('href') || '').toLowerCase();
    if (!href) return '';
    if (href.indexOf('#hardware') !== -1) return 'hardware';
    if (href.indexOf('blog.html') !== -1 || href.endsWith('/blog/')) return 'blog';
    if (href.indexOf('dj-library') !== -1 || href.indexOf('/dj/') !== -1) return 'library';
    if (href.indexOf('3d-brain') !== -1) return 'neural';
    if (href.indexOf('toolhub') !== -1) return 'tools';
    return '';
  }

  /**
   * Map the current URL to a section id. Falls back to the optional
   * <body data-page-section="..."> attribute when set.
   */
  function getCurrentSection() {
    var explicit = (document.body.getAttribute('data-page-section') || '').toLowerCase();
    if (explicit) return explicit;

    var path = window.location.pathname;
    var hash = window.location.hash || '';
    if (path.endsWith('/blog.html') || path === '/blog/' || path.endsWith('/blog')) return 'blog';
    if (path.endsWith('/dj-library.html')) return 'library';
    if (/\/dj\/[^/]+\.html?$/.test(path)) return 'library';
    if (path.endsWith('/3d-brain.html')) return 'neural';
    if (path.indexOf('/toolhub/') !== -1 || path.endsWith('/toolhub')) {
      return hash === '#hardware' ? 'hardware' : 'tools';
    }
    return '';
  }

  function updateSubnavActive() {
    var subnavTabs = document.querySelectorAll('.subnav-tab');
    if (subnavTabs.length === 0) return;

    var section = getCurrentSection();
    if (!section) return;

    subnavTabs.forEach(function (tab) {
      if (getTabSection(tab) === section) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
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
