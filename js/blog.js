(function () {
  'use strict';

  window.Muntaner336 = window.Muntaner336 || {};

  const PILLARS = ['atlas', 'emerging', 'culture', 'voices'];
  const PILLAR_LABELS = {
    atlas: 'Atlas Vinilo',
    emerging: 'DJs Emergentes',
    culture: 'Cultura DJ',
    voices: 'Red de Voces',
  };

  function siteBase() {
    const source = document.currentScript && document.currentScript.src;
    if (source) return source.replace(/js\/blog\.js(?:\?.*)?$/, '');
    const path = window.location.pathname;
    if (/\/(dj|toolhub|dj-library)\//.test(path)) return new URL('../', window.location.href).href;
    return new URL('./', window.location.href).href;
  }

  function ensurePillars(callback) {
    if (window.BLOG_PILLARS) {
      callback();
      return;
    }
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      callback();
    };
    const script = document.createElement('script');
    script.src = siteBase() + 'data/blog/index.js';
    script.onload = finish;
    script.onerror = finish;
    document.head.appendChild(script);
  }

  function isBlogDom() {
    return Boolean(document.querySelector('.blog-cat-btn'));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initBlogPage() {
    const page = document.querySelector('.blog-page');
    if (!page || page.dataset.blogInitialized === '1') return;
    page.dataset.blogInitialized = '1';

    const data = window.BLOG_PILLARS || {};
    const indexShell = page.querySelector('.blog-index-shell');
    const reader = page.querySelector('.blog-reader');
    const status = page.querySelector('[data-blog-status]');
    const progress = page.querySelector('[data-reader-progress]');
    const progressTrack = page.querySelector('.blog-reader__progress');
    const tabs = Array.from(page.querySelectorAll('.blog-cat-btn'));
    let currentPillar = 'atlas';
    let activeArticleId = null;
    let lastArticleTrigger = null;
    let readerHideTimer = 0;
    let panelAnimationTimer = 0;

    const reducedMotion = () =>
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function findArticle(id) {
      for (const pillar of PILLARS) {
        const post = (data[pillar] || []).find((item) => item.id === id);
        if (post) return { pillar, post };
      }
      return null;
    }

    function renderMeta(meta) {
      return (meta || []).map((item) => '<span>' + escapeHtml(item) + '</span>').join('');
    }

    function renderStats(stats, className) {
      if (!stats || !stats.length) return '';
      return (
        '<dl class="' +
        className +
        '">' +
        stats
          .map(
            (stat) =>
              '<div><dt>' +
              escapeHtml(stat.label) +
              '</dt><dd>' +
              escapeHtml(String(stat.value)) +
              '</dd></div>'
          )
          .join('') +
        '</dl>'
      );
    }

    function renderChart(chart) {
      if (!chart || !chart.items || !chart.items.length) return '';
      const max = Math.max.apply(
        null,
        chart.items.map((item) => Number(item.value) || 0)
      );
      const rows = chart.items
        .map((item) => {
          const value = Number(item.value) || 0;
          const percent = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
          const unit = chart.unit || '';
          const note = item.note ? '<em>' + escapeHtml(item.note) + '</em>' : '';
          return (
            '<div class="chart-row">' +
            '<span class="chart-label">' +
            escapeHtml(item.name) +
            note +
            '</span>' +
            '<span class="chart-track"><span class="chart-bar" style="width:' +
            percent +
            '%"></span></span>' +
            '<span class="chart-value">' +
            value +
            escapeHtml(unit) +
            '</span>' +
            '</div>'
          );
        })
        .join('');
      return (
        '<figure class="pillar-chart">' +
        (chart.title
          ? '<figcaption class="pillar-chart-title">' + escapeHtml(chart.title) + '</figcaption>'
          : '') +
        rows +
        '<p class="pillar-chart-note">Datos de la pasada de investigación; fuentes enlazadas en la ficha.</p>' +
        '</figure>'
      );
    }

    function renderIndexCard(post, index) {
      const sourceCount = post.sources ? post.sources.length : 0;
      const articleHash = '#article-' + encodeURIComponent(post.id);
      return (
        '<article class="pillar-card" id="' +
        escapeHtml(post.id) +
        '" data-pillar-post>' +
        '<div class="pillar-card__index" aria-hidden="true"><span>Ficha</span><strong>' +
        String(index + 1).padStart(2, '0') +
        '</strong></div>' +
        '<div class="pillar-card__copy">' +
        '<div class="pillar-card__meta">' +
        renderMeta(post.meta) +
        '</div>' +
        '<h3><a class="pillar-card__title" href="' +
        escapeHtml(articleHash) +
        '" data-article-link="' +
        escapeHtml(post.id) +
        '">' +
        escapeHtml(post.title) +
        '</a></h3>' +
        '<p class="pillar-card__excerpt">' +
        escapeHtml(post.excerpt) +
        '</p>' +
        '</div>' +
        '<div class="pillar-card__aside">' +
        renderStats(post.stats, 'pillar-card__stats') +
        '<div class="pillar-card__footer"><span>' +
        sourceCount +
        (sourceCount === 1 ? ' fuente citada' : ' fuentes citadas') +
        '</span><a class="pillar-card__read" href="' +
        escapeHtml(articleHash) +
        '" data-article-link="' +
        escapeHtml(post.id) +
        '">Leer ficha<span aria-hidden="true"></span></a></div></div>' +
        (post.chart
          ? '<div class="pillar-card__visual">' + renderChart(post.chart) + '</div>'
          : '') +
        '</article>'
      );
    }

    function renderPillars() {
      let total = 0;
      PILLARS.forEach((pillar) => {
        const posts = data[pillar] || [];
        const panel = page.querySelector('.blog-pillar[data-pillar="' + pillar + '"]');
        const list = panel && panel.querySelector('[data-pillar-list]');
        const empty = panel && panel.querySelector('[data-empty-state]');
        const tab = page.querySelector('.blog-cat-btn[data-pillar="' + pillar + '"]');
        const count = tab && tab.querySelector('[data-tab-count]');
        total += posts.length;
        if (count) count.textContent = String(posts.length).padStart(2, '0');
        if (!list) return;
        list.innerHTML = posts.map(renderIndexCard).join('');
        if (empty) empty.hidden = posts.length > 0;
      });
      const totalNode = page.querySelector('[data-blog-total]');
      if (totalNode) totalNode.textContent = String(total).padStart(2, '0');
    }

    function setPillarState(key, animate) {
      currentPillar = key;
      tabs.forEach((tab) => {
        const active = tab.dataset.pillar === key;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
        if (active) {
          const categories = tab.closest('.blog-categories');
          if (categories && categories.scrollWidth > categories.clientWidth) {
            categories.scrollLeft = Math.max(
              0,
              tab.offsetLeft - (categories.clientWidth - tab.offsetWidth) / 2
            );
          }
        }
      });
      page.querySelectorAll('.blog-pillar').forEach((panel) => {
        const active = panel.dataset.pillar === key;
        panel.classList.toggle('is-active', active);
        if (active) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      });
      const activePanel = page.querySelector('.blog-pillar[data-pillar="' + key + '"]');
      if (activePanel && animate) {
        window.clearTimeout(panelAnimationTimer);
        activePanel.classList.remove('is-entering');
        void activePanel.offsetWidth;
        activePanel.classList.add('is-entering');
        panelAnimationTimer = window.setTimeout(() => {
          activePanel.classList.remove('is-entering');
        }, 360);
      }
    }

    function scrollToElement(element, instant) {
      if (!element) return;
      const rail = page.querySelector('.pillar-rail');
      const isPanel = element.classList.contains('blog-pillar');
      const offset = isPanel ? 121 + ((rail && rail.offsetHeight) || 0) + 20 : 121;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      const behavior = instant || reducedMotion() ? 'auto' : 'smooth';
      window.scrollTo({ top: Math.max(0, top), behavior });
    }

    function setReaderExpanded(open) {
      window.clearTimeout(readerHideTimer);
      if (open) {
        reader.hidden = false;
        reader.removeAttribute('aria-hidden');
        indexShell.setAttribute('inert', '');
        indexShell.setAttribute('aria-hidden', 'true');
        page.classList.add('is-reader-open');
        window.requestAnimationFrame(() => reader.classList.add('is-open'));
        return;
      }
      reader.classList.remove('is-open');
      reader.setAttribute('aria-hidden', 'true');
      indexShell.removeAttribute('inert');
      indexShell.removeAttribute('aria-hidden');
      page.classList.remove('is-reader-open');
      readerHideTimer = window.setTimeout(
        () => {
          if (!activeArticleId) reader.hidden = true;
        },
        reducedMotion() ? 0 : 280
      );
    }

    function updateReaderProgress() {
      if (!activeArticleId || !reader || !reader.isConnected || reader.hidden) return;
      const prose = reader.querySelector('[data-reader-body]');
      if (!prose || !progress || !progressTrack) return;
      const rect = prose.getBoundingClientRect();
      const total = Math.max(1, prose.offsetHeight - window.innerHeight * 0.55);
      const traveled = Math.min(total, Math.max(0, 180 - rect.top));
      const ratio = Math.min(1, traveled / total);
      progress.style.transform = 'scaleX(' + ratio + ')';
      progressTrack.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    }

    function populateReader(result) {
      const post = result.post;
      const pillarLabel = PILLAR_LABELS[result.pillar];
      reader.querySelector('[data-reader-pillar]').textContent = pillarLabel + ' · Ficha';
      reader.querySelector('[data-reader-title]').textContent = post.title;
      reader.querySelector('[data-reader-excerpt]').textContent = post.excerpt;
      reader.querySelector('[data-reader-meta]').innerHTML = renderMeta(post.meta);
      reader.querySelector('[data-reader-location]').textContent =
        'Pilar ' +
        String(PILLARS.indexOf(result.pillar) + 1).padStart(2, '0') +
        ' / ' +
        pillarLabel;
      reader.querySelector('[data-reader-body]').innerHTML = (post.body || [])
        .map((paragraph) => '<p>' + escapeHtml(paragraph) + '</p>')
        .join('');
      reader.querySelector('[data-reader-stats]').innerHTML = renderStats(
        post.stats,
        'reader-stats'
      );
      const statsWrap = reader.querySelector('[data-reader-stats-wrap]');
      if (statsWrap) statsWrap.hidden = !post.stats || !post.stats.length;
      reader.querySelector('[data-reader-chart]').innerHTML = renderChart(post.chart);
      const chartWrap = reader.querySelector('[data-reader-chart-wrap]');
      if (chartWrap) chartWrap.hidden = !post.chart;
      reader.querySelector('[data-reader-sources]').innerHTML = (post.sources || [])
        .map(
          (source) =>
            '<a href="' +
            escapeHtml(source.href) +
            '" target="_blank" rel="noopener noreferrer">' +
            escapeHtml(source.label) +
            '<span aria-hidden="true">↗</span></a>'
        )
        .join('');
      const sourcesWrap = reader.querySelector('[data-reader-sources-wrap]');
      if (sourcesWrap) sourcesWrap.hidden = !post.sources || !post.sources.length;
      page.querySelectorAll('[data-reader-close]').forEach((link) => {
        link.href = '#pillar-' + result.pillar;
      });
    }

    function openReader(id, options) {
      const settings = options || {};
      const result = findArticle(id);
      if (!result) return;
      if (settings.trigger) lastArticleTrigger = settings.trigger;
      currentPillar = result.pillar;
      setPillarState(result.pillar, false);
      populateReader(result);
      activeArticleId = id;
      setReaderExpanded(true);
      if (settings.updateHash !== false && window.location.hash !== '#article-' + id) {
        history.pushState(history.state, '', '#article-' + encodeURIComponent(id));
      }
      if (status) status.textContent = 'Ficha abierta: ' + result.post.title;
      const positionReader = () => {
        if (activeArticleId !== id) return;
        scrollToElement(reader, true);
        if (settings.focus !== false) reader.focus({ preventScroll: true });
        updateReaderProgress();
      };
      if (document.fonts && document.fonts.ready) {
        Promise.race([
          document.fonts.ready,
          new Promise((resolve) => window.setTimeout(resolve, 500)),
        ]).then(positionReader);
      } else {
        positionReader();
      }
    }

    function showPillar(id, options) {
      const settings = options || {};
      const key = PILLARS.includes(id) ? id : 'atlas';
      const wasReaderOpen = Boolean(activeArticleId);
      if (wasReaderOpen) {
        activeArticleId = null;
        setReaderExpanded(false);
      }
      setPillarState(key, !wasReaderOpen);
      if (settings.updateHash !== false && window.location.hash !== '#pillar-' + key) {
        history.replaceState(history.state, '', '#pillar-' + key);
      }
      if (status) status.textContent = PILLAR_LABELS[key] + ' seleccionado';
      if (wasReaderOpen) {
        window.requestAnimationFrame(() => {
          scrollToElement(page.querySelector('.blog-pillar[data-pillar="' + key + '"]'));
          if (settings.restoreFocus !== false && lastArticleTrigger) {
            lastArticleTrigger.focus({ preventScroll: true });
          }
        });
      }
    }

    function routeFromHash() {
      if (!page.isConnected) return;
      const rawHash = window.location.hash.replace(/^#/, '');
      let decodedHash = rawHash;
      try {
        decodedHash = decodeURIComponent(rawHash);
      } catch (error) {
        decodedHash = rawHash;
      }
      if (decodedHash.startsWith('article-')) {
        openReader(decodedHash.slice('article-'.length), { updateHash: false, focus: false });
        return;
      }
      const pillar = decodedHash.startsWith('pillar-')
        ? decodedHash.slice('pillar-'.length)
        : decodedHash;
      showPillar(PILLARS.includes(pillar) ? pillar : 'atlas', { updateHash: false });
      if (rawHash.startsWith('pillar-')) {
        window.requestAnimationFrame(() => {
          scrollToElement(page.querySelector('.blog-pillar[data-pillar="' + currentPillar + '"]'));
        });
      }
    }

    function bindTabs() {
      tabs.forEach((tab, index) => {
        if (tab.dataset.bound) return;
        tab.dataset.bound = '1';
        tab.addEventListener('click', () => showPillar(tab.dataset.pillar));
        tab.addEventListener('keydown', (event) => {
          let nextIndex = index;
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
            nextIndex = (index + 1) % tabs.length;
          else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
            nextIndex = (index - 1 + tabs.length) % tabs.length;
          else if (event.key === 'Home') nextIndex = 0;
          else if (event.key === 'End') nextIndex = tabs.length - 1;
          else return;
          event.preventDefault();
          showPillar(tabs[nextIndex].dataset.pillar);
          tabs[nextIndex].focus();
        });
      });
    }

    function bindAnchors() {
      page.querySelectorAll('a[href^="#"]:not([data-bound])').forEach((anchor) => {
        const href = anchor.getAttribute('href') || '';
        if (href === '#') return;
        const target = document.getElementById(href.slice(1));
        const articleLink = anchor.matches('[data-article-link]');
        if (!articleLink && (!target || !target.classList.contains('blog-pillar'))) return;
        anchor.dataset.bound = '1';
        anchor.addEventListener('click', (event) => {
          event.preventDefault();
          if (articleLink) {
            openReader(anchor.dataset.articleLink, { trigger: anchor });
            return;
          }
          const currentTarget = document.getElementById(
            (anchor.getAttribute('href') || '').slice(1)
          );
          if (!currentTarget) return;
          showPillar(currentTarget.dataset.pillar);
          window.requestAnimationFrame(() => scrollToElement(currentTarget));
        });
      });
    }

    renderPillars();
    bindTabs();
    bindAnchors();
    window.Muntaner336.routeBlogHash = routeFromHash;
    window.Muntaner336.updateBlogProgress = updateReaderProgress;

    if (!window._blogScrollBound) {
      window._blogScrollBound = true;
      const onScroll = () => {
        const header = document.querySelector('.header');
        if (header) header.classList.toggle('scrolled', window.pageYOffset > 50);
        if (!window._blogScrollQueued) {
          window._blogScrollQueued = true;
          window.requestAnimationFrame(() => {
            window._blogScrollQueued = false;
            if (typeof window.Muntaner336.updateBlogProgress === 'function') {
              window.Muntaner336.updateBlogProgress();
            }
          });
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    }

    if (!window._blogHashBound) {
      window._blogHashBound = true;
      const onHashChange = () => {
        if (typeof window.Muntaner336.routeBlogHash === 'function') {
          window.Muntaner336.routeBlogHash();
        }
      };
      window.addEventListener('hashchange', onHashChange);
      window.addEventListener('popstate', () => window.setTimeout(onHashChange, 0));
    }

    routeFromHash();
  }

  function boot() {
    if (!isBlogDom()) return;
    ensurePillars(() => initBlogPage());
  }

  window.Muntaner336.initBlogPage = function () {
    if (!isBlogDom()) return;
    ensurePillars(() => initBlogPage());
  };

  boot();
  if (typeof window.Muntaner336.onPageView === 'function') {
    window.Muntaner336.onPageView(() => {
      if (isBlogDom()) boot();
    });
  } else {
    const timer = window.setInterval(() => {
      if (typeof window.Muntaner336.onPageView === 'function') {
        window.clearInterval(timer);
        window.Muntaner336.onPageView(() => {
          if (isBlogDom()) boot();
        });
      }
    }, 50);
  }
})();
