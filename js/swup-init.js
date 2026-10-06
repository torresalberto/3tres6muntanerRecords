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
    // Full-load sections (same call as mapa). Each of these owns stylesheets and/or
    // scripts outside <main data-swup> that self-init on DOMContentLoaded, which has
    // already fired by the time an SPA arrival swaps the container — arriving via swup
    // rendered them unstyled and/or inert:
    //   /toolhub/      stylesheet + 11 data scripts + inline tab/init code
    //   /dj-library    d3 + dj-library-core.js + dj-library.js + css/dj-library.css
    //   /3d-brain      page CSS is inlined in its own <head> (never fetched on arrival)
    //   /              homepage calendar/cart/newsletter scripts live after </main>
    //   /crew/alberto  own <head> stylesheet (css/alberto.css) + lazy facade scripts
    //   /crew.html     store-free crew chrome (no ribbon, tucked header) lives in its
    //                  own markup, and swup only swaps [data-swup] — an arrival would
    //                  keep the previous page's store header and 40px band.
    ignoreVisit: function (url, opts) {
      // Preserve swup's default opt-out.
      var el = opts && opts.el;
      if (el && el.closest && el.closest('[data-no-swup]')) return true;
      var path;
      try {
        path = new URL(String(url || ''), window.location.href).pathname;
      } catch (e) {
        path = String(url || '').split('#')[0];
      }
      return (
        /^\/toolhub\/?$/.test(path) ||
        /^\/dj-library(\.html)?\/?$/.test(path) ||
        /^\/3d-brain\.html$/.test(path) ||
        /^\/crew\/alberto(-[cde])?\.html$/.test(path) ||
        /^\/crew(\.html)?\/?$/.test(path) ||
        path === '/'
      );
    },
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
    // Absolute URLs (CDN) must not get the site origin prefixed.
    s.src = /^https?:\/\//.test(urls[i].src) ? urls[i].src : SITE_BASE + urls[i].src;
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

  // Legacy path: crew pages used to be swup targets, so arrivals had to pull in
  // the crew stylesheet, GSAP and data layer by hand. crew.html is now a
  // full-load section (see ignoreVisit) and loads all of it from its own markup,
  // so this only runs if a crew page ever rejoins swup.
  function ensureCrewAssets() {
    ensureStylesheet(SITE_BASE + 'css/crew.css?v=4', 'css/crew.css');
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
    // DJ profile pages (/dj/<id>.html) are static markup but are styled by
    // css/dj-library.css, which only pages of that family load in their <head>.
    // Head links are not swapped on SPA arrival, so inject it here.
    if (/\/dj\/[^/]+\.html$/.test(window.location.pathname)) {
      ensureStylesheet(SITE_BASE + 'css/dj-library.css', 'css/dj-library.css');
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
    // Same problem for the main header nav (lives in <header>, outside
    // the swup container): the previous page's .active/aria-current sticks.
    updateMainNavActive();
    // And for <body> classes: crew/blog/ticker styles are scoped to body
    // classes set in static HTML, which swup never swaps. Sync them here.
    syncBodyClass();
    // The top-banner lives outside the swup container too — swap its
    // items (per-page sets) so the arriving page's ticker shows.
    syncTicker();
  }

  // Keep in sync with the .ticker-content items in each page's static HTML.
  var TICKER_SETS = {
    crew: [
      'Barcelona → México',
      'El crew que suena en cabina',
      'Sesiones UNREC · Open Source',
      'Conexiones entre DJs',
      'Archivo de cabina y flyers',
      'Dónde tocó · Mapa de gigs',
    ],
    blog: [
      'Atlas Vinilo — datos y visualizaciones',
      'DJs Emergentes — radar de talento',
      'Cultura DJ — vida entre discos',
      'Red de Voces — promotoras, salas y colectivos',
    ],
    library: [
      'Sets y tracklists de DJs underground',
      'Vinilos seleccionados en Barcelona',
      'Envíos a México',
      'Nuevas llegadas cada semana',
      'IDs identificados con precisión',
    ],
    store: [
      'Vinilos europeos directo de Barcelona',
      'Envíos a todo México',
      'Paga con Mercado Pago',
      'Escucha antes de comprar',
      'Nuevas llegadas cada semana',
    ],
  };

  function tickerSpecFor(path) {
    // Crew pages ship without the ribbon: it is store copy, and leaving a band
    // above the fixed header is what made the sticky menu look broken on scroll.
    if (isCrewPath(path) || /^\/crew\/alberto(-[cde])?\.html$/.test(path)) return { type: 'none' };
    if (isBlogPath(path)) return { type: 'items', set: 'blog' };
    if (/\/dj-library(?:\.html|\/)/.test(path)) return { type: 'items', set: 'library' };
    if (/\/toolhub\//.test(path) || /\/dj\//.test(path)) return { type: 'none' };
    if (/product\.html$/.test(path)) return { type: 'plain' };
    return { type: 'items', set: 'store' };
  }

  function escTicker(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function syncTicker() {
    var spec = tickerSpecFor(window.location.pathname);
    var banner = document.querySelector('.top-banner');
    document.body.classList.toggle('no-ticker', spec.type === 'none');
    if (!banner) {
      if (spec.type === 'none') return;
      banner = document.createElement('div');
      banner.className = 'top-banner';
      document.body.insertBefore(banner, document.body.firstChild);
    }
    if (spec.type === 'none') {
      banner.style.display = 'none';
      return;
    }
    banner.style.display = '';
    if (spec.type === 'plain') {
      if (!banner.querySelector('p'))
        banner.innerHTML = '<p>Vinilos europeos directo de Barcelona · Envíos a todo México</p>';
      return;
    }
    var content = banner.querySelector('.ticker-content');
    if (!content) {
      banner.innerHTML = '<div class="ticker-wrapper"><div class="ticker-content"></div></div>';
      content = banner.querySelector('.ticker-content');
    }
    var items = TICKER_SETS[spec.set];
    var half = items
      .map(function (t) {
        return '<span class="ticker-item">' + escTicker(t) + '</span>';
      })
      .join('<span class="ticker-separator">•</span>');
    // translateX(-50%) marquee: content must be exactly two identical halves.
    content.innerHTML = half + '<span class="ticker-separator">•</span>' + half;
  }

  var BODY_CLASS_BY_PATH = [
    { re: /\/dj-library(?:\.html|\/)/, cls: 'dj-library-page' },
    { re: /\/toolhub\//, cls: 'downloads-page' },
  ];
  var MANAGED_BODY_CLASSES = ['crew-page', 'blog-document']
    .concat(
      BODY_CLASS_BY_PATH.map(function (m) {
        return m.cls;
      })
    )
    .filter(function (v, i, a) {
      return a.indexOf(v) === i;
    });

  function syncBodyClass() {
    var path = window.location.pathname;
    var want = '';
    if (isCrewPath(path)) want = 'crew-page';
    else if (isBlogPath(path)) want = 'blog-document';
    else {
      for (var i = 0; i < BODY_CLASS_BY_PATH.length; i++) {
        if (BODY_CLASS_BY_PATH[i].re.test(path)) {
          want = BODY_CLASS_BY_PATH[i].cls;
          break;
        }
      }
    }
    MANAGED_BODY_CLASSES.forEach(function (cls) {
      document.body.classList.toggle(cls, cls === want);
    });
  }

  function updateMainNavActive() {
    var path = window.location.pathname.replace(/\/+$/, '');
    var current = path.split('/').pop() || '';
    if (!current) return;
    var items = document.querySelectorAll('.main-nav .nav-item');
    items.forEach(function (item) {
      var href = (item.getAttribute('href') || '').split('#')[0].split('?')[0];
      var base = href.replace(/\/+$/, '').split('/').pop();
      var isCurrent = !!base && base === current;
      item.classList.toggle('active', isCurrent);
      if (isCurrent) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  }

  // Inject blog CSS before the content swap so the first paint is styled.
  // Swup 4.9 hooks: visit:start / content:replace / page:view (not page:visit).
  if (swup.hooks && typeof swup.hooks.on === 'function') {
    swup.hooks.on('visit:start', function (visit) {
      var url = visit && visit.to && visit.to.url ? visit.to.url : '';
      if (!url) return;
      var path = String(url).split('?')[0].split('#')[0];
      if (isBlogPath(path)) ensureBlogCss();
      if (isCrewPath(path)) ensureStylesheet(SITE_BASE + 'css/crew.css?v=4', 'css/crew.css');
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
