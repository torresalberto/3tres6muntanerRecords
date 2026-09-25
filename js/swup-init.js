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

  // Site root derived from this file's URL (js/swup-init.js → site root).
  // Used to inject blog assets when arriving via swup (head/body scripts
  // outside <main data-swup> never run on client-side navigation).
  var SITE_BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    if (s) return s.replace(/js\/swup-init\.js(?:\?.*)?$/, '');
    return '/';
  })();

  function isBlogPath(path) {
    return /\/blog\.html$/.test(path) || path === '/blog/' || path === '/blog';
  }

  function isCrewPath(path) {
    return /\/crew\.html$/.test(path) || path === '/crew/' || path === '/crew';
  }

  function hasScript(part) {
    return !!document.querySelector('script[src*="' + part + '"]');
  }

  function hasStylesheet(part) {
    return !!document.querySelector('link[href*="' + part + '"]');
  }

  function ensureStylesheet(href, part) {
    if (hasStylesheet(part)) return;
    var el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = href;
    document.head.appendChild(el);
  }

  function ensureScriptSequence(urls, i) {
    if (i >= urls.length) return;
    if (hasScript(urls[i].part)) {
      ensureScriptSequence(urls, i + 1);
      return;
    }
    var s = document.createElement('script');
    s.src = SITE_BASE + urls[i].src;
    s.defer = true;
    s.onload = function () {
      ensureScriptSequence(urls, i + 1);
    };
    s.onerror = function () {
      ensureScriptSequence(urls, i + 1);
    };
    document.head.appendChild(s);
  }

  var crewAssetsLoading = false;

  function ensureCrewAssets() {
    ensureStylesheet(SITE_BASE + 'css/crew.css?v=2', 'css/crew.css');
    if (crewAssetsLoading) return;
    var seq = [
      { src: 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js', part: '/gsap@' },
      {
        src: 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
        part: '/ScrollTrigger.min.js',
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js',
        part: '/SplitText.min.js',
      },
      { src: 'data/crew/index.js', part: 'data/crew/index.js' },
      { src: 'js/crew.js', part: 'js/crew.js' },
    ];
    if (
      seq.every(function (u) {
        return hasScript(u.part);
      })
    ) {
      return;
    }
    crewAssetsLoading = true;
    ensureScriptSequence(seq, 0);
  }

  function ensureAsset(href, tag) {
    // Match any equivalent href (relative vs absolute SITE_BASE).
    var existing =
      tag === 'link'
        ? document.querySelector('link[href*="css/blog.css"]')
        : document.querySelector('script[src*="js/blog.js"]');
    if (existing) return true;
    var el = document.createElement(tag);
    if (tag === 'link') {
      el.rel = 'stylesheet';
      el.href = href;
      document.head.appendChild(el);
    } else {
      el.src = href;
      el.defer = true;
      document.head.appendChild(el);
    }
    return false;
  }

  function ensureBlogCss() {
    ensureAsset(SITE_BASE + 'css/blog.css', 'link');
  }

  function ensureBlogJs(cb) {
    if (window.Muntaner336 && typeof window.Muntaner336.initBlogPage === 'function') {
      if (cb) cb();
      return;
    }
    if (document.querySelector('script[src*="js/blog.js"]')) {
      // Already present (loading or loaded) — poll briefly for initBlogPage.
      var tries = 0;
      var t = setInterval(function () {
        tries += 1;
        if (window.Muntaner336 && typeof window.Muntaner336.initBlogPage === 'function') {
          clearInterval(t);
          if (cb) cb();
        } else if (tries > 40) {
          clearInterval(t);
          if (cb) cb();
        }
      }, 50);
      return;
    }
    var s = document.createElement('script');
    s.src = SITE_BASE + 'js/blog.js';
    s.defer = true;
    s.onload = function () {
      if (cb) cb();
    };
    s.onerror = function () {
      if (cb) cb();
    };
    document.head.appendChild(s);
  }

  function runViewHandlers() {
    // Blog page: pull in shared CSS/JS that other pages may not have loaded.
    if (isBlogPath(window.location.pathname)) {
      ensureBlogCss();
      ensureBlogJs();
    }
    // Crew page: pull in crew CSS + GSAP stack + data + motion layer.
    if (isCrewPath(window.location.pathname)) {
      ensureCrewAssets();
    }
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

  // Inject blog CSS before the content swap so the first paint is styled.
  // Swup 4.9 hooks: visit:start / content:replace / page:view (not page:visit).
  if (swup.hooks && typeof swup.hooks.on === 'function') {
    swup.hooks.on('visit:start', function (visit) {
      var url = visit && visit.to && visit.to.url ? visit.to.url : '';
      if (!url) return;
      var path = String(url).split('?')[0].split('#')[0];
      if (isBlogPath(path)) ensureBlogCss();
      if (isCrewPath(path)) ensureStylesheet(SITE_BASE + 'css/crew.css?v=2', 'css/crew.css');
    });
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
