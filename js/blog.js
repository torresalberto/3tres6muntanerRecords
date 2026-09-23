/**
 * blog.js — pillar tabs + hash routing (Swup-compatible).
 *
 * Loaded from blog.html (direct load) and injected by swup-init.js when
 * arriving via client-side navigation (head/body scripts outside
 * <main data-swup> never run on swup nav).
 */
(function () {
  'use strict';

  window.Muntaner336 = window.Muntaner336 || {};

  function siteBase() {
    var s = document.currentScript && document.currentScript.src;
    if (s) return s.replace(/js\/blog\.js(?:\?.*)?$/, '');
    // Fallback: one level up from /dj/, /toolhub/, /dj-library/
    var p = window.location.pathname;
    if (/\/(dj|toolhub|dj-library)\//.test(p)) return new URL('../', window.location.href).href;
    return new URL('./', window.location.href).href;
  }

  function ensurePillars(cb) {
    if (window.BLOG_PILLARS) return cb();
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      cb();
    };
    var s = document.createElement('script');
    s.src = siteBase() + 'data/blog/index.js';
    s.onload = finish;
    s.onerror = finish;
    document.head.appendChild(s);
  }

  function isBlogDom() {
    return !!document.querySelector('.blog-cat-btn');
  }

      // Blog page initializer (Swup-compatible) — pillar tabs + hash routing
      function initBlogPage() {
        const PILLARS = ['atlas', 'emerging', 'culture'];

        function escapeHtml(s) {
          return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        }

        function renderPillars() {
          const data = window.BLOG_PILLARS || {};
          PILLARS.forEach((key) => {
            const panel = document.querySelector('.blog-pillar[data-pillar="' + key + '"]');
            if (!panel) return;
            const list = panel.querySelector('[data-pillar-list]');
            const empty = panel.querySelector('[data-empty-state]');
            const posts = data[key] || [];
            if (!list) return;
            if (!posts.length) {
              list.innerHTML = '';
              if (empty) empty.hidden = false;
              return;
            }
            if (empty) empty.hidden = true;
            list.innerHTML = posts
              .map((post) => {
                const stats =
                  post.stats && post.stats.length
                    ? '<div class="pillar-card-stats">' +
                      post.stats
                        .map(
                          (s) =>
                            '<span class="pillar-stat"><strong>' +
                            escapeHtml(String(s.value)) +
                            '</strong>' +
                            escapeHtml(s.label) +
                            '</span>'
                        )
                        .join('') +
                      '</div>'
                    : '';
                const chart = post.chart ? renderChart(post.chart) : '';
                const sources =
                  post.sources && post.sources.length
                    ? '<div class="pillar-card-meta">' +
                      post.sources
                        .map(
                          (s) =>
                            '<a href="' +
                            escapeHtml(s.href) +
                            '" target="_blank" rel="noopener">↗ ' +
                            escapeHtml(s.label) +
                            '</a>'
                        )
                        .join('') +
                      '</div>'
                    : '';
                const body = (post.body || []).map((b) => '<p>' + escapeHtml(b) + '</p>').join('');
                const meta = (post.meta || [])
                  .map((m) => '<span>' + escapeHtml(m) + '</span>')
                  .join('');
                return (
                  '<article class="pillar-card" id="' +
                  escapeHtml(post.id) +
                  '" data-pillar-post>' +
                  '<div class="pillar-card-meta">' +
                  meta +
                  '</div>' +
                  '<h3>' +
                  escapeHtml(post.title) +
                  '</h3>' +
                  '<p class="pillar-card-excerpt">' +
                  escapeHtml(post.excerpt) +
                  '</p>' +
                  stats +
                  chart +
                  '<div class="pillar-card-body">' +
                  body +
                  '</div>' +
                  sources +
                  '</article>'
                );
              })
              .join('');
          });
        }

        function renderChart(chart) {
          if (!chart || !chart.items || !chart.items.length) return '';
          const max = Math.max.apply(
            null,
            chart.items.map((i) => Number(i.value) || 0)
          );
          const rows = chart.items
            .map((item) => {
              const v = Number(item.value) || 0;
              const pct = max > 0 ? Math.max(2, Math.round((v / max) * 100)) : 0;
              const unit = chart.unit || '';
              const note = item.note ? ' <em>' + escapeHtml(item.note) + '</em>' : '';
              return (
                '<div class="chart-row">' +
                '<span class="chart-label">' +
                escapeHtml(item.name) +
                note +
                '</span>' +
                '<span class="chart-track"><span class="chart-bar" style="width:' +
                pct +
                '%"></span></span>' +
                '<span class="chart-value">' +
                v +
                unit +
                '</span>' +
                '</div>'
              );
            })
            .join('');
          return (
            '<figure class="pillar-chart">' +
            (chart.title
              ? '<figcaption class="pillar-chart-title">' +
                escapeHtml(chart.title) +
                '</figcaption>'
              : '') +
            rows +
            '<p class="pillar-chart-note">Fuentes enlazadas en la tarjeta · datos de la pasada de investigación.</p>' +
            '</figure>'
          );
        }

        renderPillars();

        function showPillar(id, { pushHash } = { pushHash: true }) {
          const key = PILLARS.includes(id) ? id : 'atlas';
          document.querySelectorAll('.blog-cat-btn').forEach((btn) => {
            const on = btn.dataset.pillar === key;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
          });
          document.querySelectorAll('.blog-pillar').forEach((panel) => {
            const on = panel.dataset.pillar === key;
            panel.classList.toggle('is-active', on);
            if (on) panel.removeAttribute('hidden');
            else panel.setAttribute('hidden', '');
          });
          if (pushHash) {
            const hash = '#pillar-' + key;
            if (window.location.hash !== hash) {
              history.replaceState(null, '', hash);
            }
          }
        }

        function pillarFromHash() {
          const h = (window.location.hash || '').replace(/^#/, '');
          if (h.startsWith('pillar-')) return h.slice('pillar-'.length);
          if (PILLARS.includes(h)) return h;
          return 'atlas';
        }

        document.querySelectorAll('.blog-cat-btn:not([data-bound])').forEach((btn) => {
          btn.dataset.bound = '1';
          btn.addEventListener('click', function () {
            showPillar(this.dataset.pillar, { pushHash: true });
          });
        });

        // Header scroll effect (idempotent)
        if (!window._blogScrollBound) {
          window._blogScrollBound = true;
          window.addEventListener('scroll', function () {
            const header = document.querySelector('.header');
            if (header) header.classList.toggle('scrolled', window.pageYOffset > 50);
          });
        }

        // Anchor links: open pillar sections, ignore empty/article leftovers
        document.querySelectorAll('a[href^="#"]:not([data-bound])').forEach((anchor) => {
          anchor.dataset.bound = '1';
          anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            e.preventDefault();
            if (targetElement.classList.contains('blog-pillar')) {
              showPillar(targetElement.dataset.pillar, { pushHash: true });
            }
            const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
          });
        });

        function openFromHash() {
          const h = window.location.hash;
          if (!h || h.length < 2) return;
          const el = document.querySelector(h);
          if (el && el.classList.contains('blog-pillar')) {
            showPillar(el.dataset.pillar, { pushHash: false });
            const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
            window.scrollTo({ top: el.offsetTop - headerHeight - 20, behavior: 'smooth' });
          } else if ((h || '').includes('pillar-') || PILLARS.includes(h.replace(/^#/, ''))) {
            showPillar(pillarFromHash(), { pushHash: false });
          }
        }
        if (!window._blogHashBound) {
          window._blogHashBound = true;
          window.addEventListener('hashchange', openFromHash);
        }

        // Initial state from hash (default atlas)
        showPillar(pillarFromHash(), { pushHash: false });
        openFromHash();
      }

  function boot() {
    if (!isBlogDom()) return;
    ensurePillars(function () {
      initBlogPage();
    });
  }

  window.Muntaner336.initBlogPage = function () {
    if (!isBlogDom()) return;
    ensurePillars(function () {
      initBlogPage();
    });
  };

  // Direct load + every swup page:view (once registered)
  boot();
  if (typeof window.Muntaner336.onPageView === 'function') {
    window.Muntaner336.onPageView(function () {
      if (isBlogDom()) boot();
    });
  } else {
    // swup-init loads after this file on first paint — retry when ready
    var t = setInterval(function () {
      if (typeof window.Muntaner336.onPageView === 'function') {
        clearInterval(t);
        window.Muntaner336.onPageView(function () {
          if (isBlogDom()) boot();
        });
      }
    }, 50);
  }
})();
