/* ============================================================ ALB — CINE
   Letterbox intro timeline, hero title reveal, scroll wipes/parallax, film
   progress bar + timecode HUD, full-screen viewer. GSAP CDN loaded by the
   page (same pattern as crew.html): no gsap or reduced-motion → strip
   html.cn-js and everything ships static.                                  */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOTAL_FRAMES = (63 * 60 + 7) * 24; /* 63:07 @ 24fps */

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  /* ------------------------------------------------------- HUD + progress */
  function initHud() {
    var bar = document.getElementById('cnBar');
    var tc = document.getElementById('cnTc');
    var ticking = false;

    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = Math.max(doc.scrollHeight - window.innerHeight, 1);
      var p = Math.min(1, Math.max(0, (window.scrollY || doc.scrollTop) / max));
      if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
      if (tc) {
        var f = Math.round(p * TOTAL_FRAMES);
        var ff = f % 24;
        var s = Math.floor(f / 24);
        tc.textContent =
          pad(Math.floor(s / 3600)) +
          ':' +
          pad(Math.floor(s / 60) % 60) +
          ':' +
          pad(s % 60) +
          ':' +
          pad(ff);
      }
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ------------------------------------------------------------- viewer */
  function initViewer() {
    var shots = Array.prototype.slice.call(document.querySelectorAll('.cn-shot'));
    if (!shots.length) return;

    var view = document.createElement('div');
    view.className = 'cn-view';
    view.id = 'cnView';
    view.setAttribute('role', 'dialog');
    view.setAttribute('aria-modal', 'true');
    view.setAttribute('aria-label', 'Fotograma en grande');
    view.innerHTML =
      '<button type="button" class="cn-view-x" aria-label="Cerrar">✕</button>' +
      '<button type="button" class="cn-view-prev" aria-label="Anterior">←</button>' +
      '<img alt="" />' +
      '<button type="button" class="cn-view-next" aria-label="Siguiente">→</button>' +
      '<p class="cn-view-label"></p>';
    document.body.appendChild(view);

    var vImg = view.querySelector('img');
    var vLabel = view.querySelector('.cn-view-label');
    var current = 0;

    function show(i) {
      current = (i + shots.length) % shots.length;
      var img = shots[current].querySelector('img');
      var plate = shots[current].closest('.cn-frame').querySelector('.cn-plate span');
      vImg.src = img.getAttribute('src');
      vImg.alt = img.getAttribute('alt') || '';
      vLabel.textContent =
        (plate ? plate.textContent : 'Nº ' + pad(current + 1)) +
        ' · ' +
        pad(current + 1) +
        ' / ' +
        pad(shots.length);
    }
    function open(i) {
      show(i);
      view.classList.add('is-open');
      document.body.classList.add('cn-view-locked');
      view.querySelector('.cn-view-x').focus();
    }
    function close() {
      view.classList.remove('is-open');
      document.body.classList.remove('cn-view-locked');
      shots[current].focus();
    }

    shots.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        open(i);
      });
    });
    view.querySelector('.cn-view-x').addEventListener('click', close);
    view.querySelector('.cn-view-prev').addEventListener('click', function (e) {
      e.stopPropagation();
      show(current - 1);
    });
    view.querySelector('.cn-view-next').addEventListener('click', function (e) {
      e.stopPropagation();
      show(current + 1);
    });
    view.addEventListener('click', function (e) {
      if (e.target === view) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!view.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------------------------------------------------------- static mode */
  function showStatic() {
    document.documentElement.classList.remove('cn-js');
    document.documentElement.style.overflow = '';
    Array.prototype.forEach.call(
      document.querySelectorAll('.cn-frame, [data-cine], .cn-name, .cn-hero-kicker, .cn-hero-sub'),
      function (el) {
        el.style.removeProperty('opacity');
        el.style.removeProperty('clip-path');
        el.style.removeProperty('transform');
      }
    );
  }

  /* ------------------------------------------------------------ motion */
  function initMotion() {
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    var name = document.getElementById('cnName');
    var intro = document.getElementById('cnIntro');
    var heroBits = ['.cn-hero-kicker', '.cn-name', '.cn-hero-sub', '.cn-stage'];
    var done = false;

    /* split the title if SplitText made it, otherwise plain fade */
    var chars = null;
    if (typeof window.SplitText !== 'undefined' && name) {
      chars = new window.SplitText(name, { charsClass: 'cn-char' });
    }

    function heroIn() {
      if (done) return;
      done = true;
      var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('.cn-hero-kicker', { opacity: 1, y: 0, duration: 0.5 }, 0);
      if (chars) {
        gsap.set(name, { opacity: 1 });
        tl.from(
          chars.chars,
          { yPercent: 105, opacity: 0, duration: 0.9, stagger: 0.055, ease: 'power4.out' },
          0.08
        );
      } else {
        tl.to(name, { opacity: 1, y: 0, duration: 0.8 }, 0.05);
      }
      tl.to('.cn-hero-sub', { opacity: 1, y: 0, duration: 0.6 }, 0.4);
      tl.to('.cn-stage', { opacity: 1, y: 0, duration: 0.8 }, 0.55);
    }

    function heroSet() {
      gsap.set(['.cn-hero-kicker', '.cn-name', '.cn-hero-sub', '.cn-stage'], {
        opacity: 0,
        y: 26,
      });
    }

    /* -------- letterbox intro */
    heroSet();
    document.documentElement.style.overflow = 'hidden';

    var presents = intro.querySelector('.cn-intro-presents');
    var iName = intro.querySelector('.cn-intro-name');
    gsap.set([presents, iName], { opacity: 0 });

    var tl = gsap.timeline({
      onComplete: function () {
        document.documentElement.style.overflow = '';
        intro.style.display = 'none';
        heroIn();
      },
    });
    tl.to(presents, { opacity: 1, duration: 0.45, ease: 'power2.out' }, 0.25)
      .to(presents, { opacity: 0, duration: 0.3 }, 1.15)
      .fromTo(
        iName,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' },
        1.35
      )
      .to(iName, { opacity: 0, duration: 0.35 }, 2.3)
      .to('.cn-intro-t', { yPercent: -100, duration: 0.85, ease: 'expo.inOut' }, 2.5)
      .to('.cn-intro-b', { yPercent: 100, duration: 0.85, ease: 'expo.inOut' }, 2.5);

    /* click anywhere skips the reel */
    intro.addEventListener(
      'click',
      function () {
        if (!done) tl.progress(1);
      },
      { once: true }
    );

    /* -------- section heads + rows (everything outside the hero) */
    Array.prototype.forEach.call(document.querySelectorAll('[data-cine]'), function (el) {
      if (el.closest('.cn-hero')) return;
      var isRows = el.classList.contains('cn-rows');
      var st = { trigger: el, start: 'top 86%' };
      gsap.set(el, { y: isRows ? 0 : 36 });
      gsap.to(el, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: st });
      if (isRows) {
        gsap.set(el.children, { y: 36 });
        gsap.to(el.children, {
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: st,
        });
      }
    });

    /* -------- frames: gate wipe + settle, parallax drift in the gate */
    Array.prototype.forEach.call(document.querySelectorAll('.cn-frame'), function (frame) {
      var shot = frame.querySelector('.cn-shot');
      var img = frame.querySelector('img');
      gsap.set(frame, { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set(img, { scale: 1.16 });
      var st = { trigger: frame, start: 'top 88%' };
      gsap.to(frame, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.0,
        ease: 'power4.inOut',
        scrollTrigger: st,
      });
      gsap.to(img, {
        scale: 1.02,
        duration: 1.25,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: st,
      });
      gsap.fromTo(
        shot,
        { yPercent: 4 },
        {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    });

    /* -------- hero backdrop drift */
    gsap.to('.cn-hero-bg img', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '.cn-hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* keep triggers honest once the real fonts land */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        window.ScrollTrigger.refresh();
      });
    }
  }

  /* ------------------------------------------------------------- boot */
  function init() {
    initHud();
    initViewer();
    if (!window.gsap || REDUCED) {
      showStatic();
      return;
    }
    try {
      initMotion();
    } catch (err) {
      showStatic();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
