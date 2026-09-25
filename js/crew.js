/**
 * CREW — kinetic layer.
 * GSAP + ScrollTrigger + SplitText (CDN) drive the intro, cursor-reactive
 * type and the wall scrub; a raw-WebGL grain overlay sits above the content.
 * Degrades to a fully static page when GSAP, SplitText or WebGL are missing,
 * and renders the final state immediately under prefers-reduced-motion.
 */
(function () {
  'use strict';

  var page = null;
  var headerBound = false;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function teardown() {
    if (!page) return;
    page.stops.forEach(function (fn) {
      try {
        fn();
      } catch (e) {
        // keep tearing down the remaining stops
      }
    });
    if (page.mm) page.mm.revert();
    if (page.ctx) page.ctx.revert();
    page = null;
  }

  function bindHeader() {
    if (headerBound) return;
    headerBound = true;
    window.addEventListener(
      'scroll',
      function () {
        var header = qs('.header');
        if (header) header.classList.toggle('scrolled', window.pageYOffset > 50);
      },
      { passive: true }
    );
  }

  /* ---------------- WebGL grain ---------------- */

  var GRAIN_VS = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';
  var GRAIN_FS = [
    'precision mediump float;',
    'uniform vec2 uRes;uniform float uTime;uniform float uVel;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+uTime)*43758.5453123);}',
    'void main(){',
    'vec2 f=gl_FragCoord.xy;',
    'float n=hash(floor(f/1.5));',
    'float scan=0.5+0.5*sin((f.y+uTime*60.0)*1.2);',
    'float k=0.05+min(uVel,1.0)*0.10;',
    'float a=(n*0.8+scan*0.10)*k;',
    'gl_FragColor=vec4(vec3(0.96,0.97,1.0),a);',
    '}',
  ].join('\n');

  function initGrain() {
    var canvas = document.getElementById('crewGrain');
    if (!canvas) return function () {};

    if (reducedMotion()) {
      document.body.classList.add('crew-no-webgl');
      return function () {};
    }

    var gl = null;
    try {
      gl =
        canvas.getContext('webgl', { alpha: true, antialias: false, depth: false }) ||
        canvas.getContext('experimental-webgl', { alpha: true, antialias: false, depth: false });
    } catch (e) {
      gl = null;
    }
    if (!gl) {
      document.body.classList.add('crew-no-webgl');
      return function () {};
    }

    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }

    var vs = compile(gl.VERTEX_SHADER, GRAIN_VS);
    var fs = compile(gl.FRAGMENT_SHADER, GRAIN_FS);
    if (!vs || !fs) {
      document.body.classList.add('crew-no-webgl');
      return function () {};
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      document.body.classList.add('crew-no-webgl');
      return function () {};
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'uRes');
    var uTime = gl.getUniformLocation(prog, 'uTime');
    var uVel = gl.getUniformLocation(prog, 'uVel');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var running = true;
    var raf = 0;
    var t0 = performance.now();
    var vel = 0;
    var lastY = window.pageYOffset;

    function resize() {
      var w = Math.round(canvas.clientWidth * dpr) || 1;
      var h = Math.round(canvas.clientHeight * dpr) || 1;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }

    function frame(now) {
      if (!running) return;
      resize();
      var dy = window.pageYOffset - lastY;
      lastY = window.pageYOffset;
      vel += Math.min(Math.abs(dy) / 45, 1) - vel * 0.18;
      if (vel < 0) vel = 0;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, ((now - t0) / 1000) % 1000);
      gl.uniform1f(uVel, vel);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (running && !raf) {
        raf = requestAnimationFrame(frame);
      }
    }

    resize();
    raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', resize);

    return function stop() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', resize);
    };
  }

  /* ---------------- kicker scramble ---------------- */

  function scramble(el, finalText, stopRef) {
    var glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789→·▚▞';
    var steps = 26;
    var i = 0;
    var id = setInterval(function () {
      i++;
      var revealed = Math.floor((i / steps) * finalText.length);
      var out = finalText.slice(0, revealed);
      for (var j = revealed; j < finalText.length; j++) {
        var c = finalText.charAt(j);
        out +=
          c === ' ' || c === '·' || c === '→'
            ? c
            : glyphs.charAt((Math.random() * glyphs.length) | 0);
      }
      el.textContent = out;
      if (i >= steps) {
        el.textContent = finalText;
        clearInterval(id);
      }
    }, 45);
    stopRef.push(function () {
      clearInterval(id);
      el.textContent = finalText;
    });
  }

  /* ---------------- hero intro + cursor type ---------------- */

  function initHero(stops) {
    var hero = qs('.crew-hero');
    if (!hero) return;

    var kicker = qs('.crew-kicker', hero);
    if (kicker) {
      var finalText = (kicker.textContent || '').trim();
      kicker.setAttribute('data-text', finalText);
      scramble(kicker, finalText, stops);
    }

    var split = null;
    var title = qs('.crew-title', hero);
    var targets = [];
    if (title) {
      if (typeof SplitText !== 'undefined') {
        try {
          split = new SplitText(title, { type: 'chars', charsClass: 'char' });
          targets = split.chars;
        } catch (e) {
          split = null;
        }
      }
      if (!targets.length) {
        targets = [qs('.crew-title-l1', hero), qs('.crew-title-l2', hero)].filter(Boolean);
      }
    }

    var stats = qs('.crew-stats', hero);
    var counters = hero.querySelectorAll('[data-count]');
    counters.forEach(function (el) {
      el.textContent = '0';
    });

    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(
      targets,
      { yPercent: 108, opacity: 0, rotate: 3 },
      { yPercent: 0, opacity: 1, rotate: 0, duration: 1.05, stagger: 0.045 },
      0.15
    )
      .fromTo(
        ['.crew-title-tag', '.crew-lede'],
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12 },
        0.5
      )
      .fromTo(
        stats,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          onComplete: function () {
            counters.forEach(function (el) {
              var target = parseInt(el.getAttribute('data-count'), 10) || 0;
              var obj = { v: 0 };
              gsap.to(obj, {
                v: target,
                duration: 1.1,
                ease: 'power2.out',
                onUpdate: function () {
                  el.textContent = String(Math.round(obj.v));
                },
                onComplete: function () {
                  el.textContent = String(target);
                },
              });
            });
          },
        },
        0.75
      )
      .fromTo(
        '.crew-hero-figure',
        { clipPath: 'inset(0% 0% 100% 0%)', y: 40 },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1 },
        0.35
      )
      .fromTo('.crew-scroll-cue', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.2);

    stops.push(function () {
      tl.kill();
      if (split) split.revert();
    });

    initTitlePointer(hero, targets, stops);
  }

  function initTitlePointer(hero, chars, stops) {
    if (!chars.length) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches)
      return;

    var setters = chars.map(function (el) {
      return {
        el: el,
        x: gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' }),
        r: gsap.quickTo(el, 'rotate', { duration: 0.45, ease: 'power3' }),
      };
    });

    var radius = 170;
    var strength = 34;

    function onMove(e) {
      setters.forEach(function (s) {
        var rect = s.el.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = cx - e.clientX;
        var dy = cy - e.clientY;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist > radius) {
          s.x(0);
          s.y(0);
          s.r(0);
          return;
        }
        var f = 1 - dist / radius;
        s.x((dx / dist) * f * strength);
        s.y((dy / dist) * f * strength * 0.7);
        s.r((dx / dist) * f * 7);
      });
    }

    function onLeave() {
      setters.forEach(function (s) {
        s.x(0);
        s.y(0);
        s.r(0);
      });
    }

    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    stops.push(function () {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    });
  }

  /* ---------------- wall: pinned horizontal scrub ---------------- */

  function initWall() {
    var section = qs('.crew-wall');
    var track = qs('#crewWall');
    if (!section || !track) return null;

    var mm = gsap.matchMedia();
    mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', function () {
      var len = function () {
        return Math.max(0, track.scrollWidth - window.innerWidth + 64);
      };
      var tween = gsap.to(track, {
        x: function () {
          return -len();
        },
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: function () {
            return '+=' + len();
          },
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      return function () {
        if (tween.scrollTrigger) tween.scrollTrigger.kill();
        tween.kill();
        gsap.set(track, { x: 0 });
      };
    });
    return mm;
  }

  /* ---------------- gigs map + sessions ---------------- */

  function initGigsMap(gigs) {
    var box = document.getElementById('crewGigsMap');
    if (!box || typeof L === 'undefined' || box.dataset.mapReady) return;
    var pinned = (gigs || []).filter(function (g) {
      return g.coords && g.coords.length === 2;
    });
    if (!pinned.length) return;

    try {
      var map = L.map(box, { scrollWheelZoom: false }).setView([41.3985, 2.175], 13);
      if (typeof L.maplibreGL === 'function') {
        L.maplibreGL({ style: 'https://tiles.openfreemap.org/styles/dark' }).addTo(map);
      } else {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          subdomains: 'abcd',
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap &copy; CARTO',
        }).addTo(map);
      }

      var markers = {};
      pinned.forEach(function (g) {
        var m = L.marker(g.coords).addTo(map);
        m.bindPopup(
          '<div class="crew-gig-pop"><b>' +
            g.event +
            '</b><span>' +
            (g.dateLabel || '') +
            '</span><span>' +
            g.venue +
            '</span><span class="crew-gig-pop-lineup">' +
            (g.lineup || []).join(' · ') +
            '</span></div>'
        );
        markers[g.id] = m;
      });
      var group = L.featureGroup(
        pinned.map(function (g) {
          return markers[g.id];
        })
      );
      map.fitBounds(group.getBounds().pad(0.4));
      box.dataset.mapReady = '1';

      var rail = document.getElementById('crewGigsRail');
      var onClick = function (e) {
        var li = e.target.closest('.crew-gig');
        if (!li) return;
        var m = markers[li.getAttribute('data-gig')];
        if (m) {
          m.openPopup();
          map.panTo(m.getLatLng());
        }
      };
      if (rail) rail.addEventListener('click', onClick);

      if (page) {
        page.stops.push(function () {
          if (rail) rail.removeEventListener('click', onClick);
          try {
            map.remove();
          } catch (err) {
            // map already detached
          }
          box.dataset.mapReady = '';
        });
      }
    } catch (err) {
      // basemap unavailable — rail list still renders the gigs
    }
  }

  function initGigs() {
    var hub = window.Muntaner336 && window.Muntaner336.crew;
    if (!hub) return;
    hub.onGigsReady = initGigsMap;
    if (hub.gigs && hub.gigs.length) initGigsMap(hub.gigs);
  }

  function initSessions() {
    var cards = document.querySelectorAll('.crew-session');
    cards.forEach(function (card) {
      if (card.dataset.bound) return;
      card.dataset.bound = '1';
      card.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        var id = card.getAttribute('data-video');
        if (!id) return;
        e.preventDefault();
        var thumb = card.querySelector('.crew-session-thumb');
        if (!thumb || thumb.querySelector('iframe')) return;
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
        f.title =
          'UNREC Open Source Sessions — ' +
          (card.querySelector('.crew-session-title') || {}).textContent;
        f.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        f.allowFullscreen = true;
        thumb.appendChild(f);
        card.classList.add('is-playing');
      });
    });
  }

  /* ---------------- section reveals ---------------- */

  function initReveals() {
    var els = gsap.utils.toArray(
      '.crew-shead, .crew-dossier-card, .crew-gigs-map, .crew-gigs-rail, .crew-session'
    );
    els.forEach(function (el, i) {
      gsap.fromTo(
        el,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: (i % 3) * 0.05,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        }
      );
    });
  }

  /* ---------------- page init ---------------- */

  function initCrewPage() {
    teardown();
    bindHeader();

    var hasCrewDom = !!qs('.crew-hero') || !!document.getElementById('crewGrid');
    if (!hasCrewDom) return;

    document.documentElement.classList.remove('crew-boot');

    page = { ctx: null, mm: null, stops: [] };

    initSessions();
    initGigs();

    if (typeof gsap === 'undefined') {
      document.body.classList.add('crew-no-motion');
      return;
    }

    if (reducedMotion()) {
      page.stops.push(initGrain());
      return;
    }

    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);

    document.body.classList.add('crew-motion');

    var stops = page.stops;
    var wallMM = null;
    page.ctx = gsap.context(function () {
      stops.push(initGrain());
      initHero(stops);
      wallMM = initWall();
      initReveals();
      if (typeof ScrollTrigger !== 'undefined') {
        var refresh = function () {
          ScrollTrigger.refresh();
        };
        window.addEventListener('load', refresh);
        stops.push(function () {
          window.removeEventListener('load', refresh);
        });
      }
    });
    page.mm = wallMM;
  }

  window.Muntaner336 = window.Muntaner336 || {};
  window.Muntaner336.initCrewPage = initCrewPage;

  if (window.Muntaner336 && typeof window.Muntaner336.onPageView === 'function') {
    window.Muntaner336.onPageView(initCrewPage);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCrewPage, { once: true });
  } else {
    initCrewPage();
  }
})();
