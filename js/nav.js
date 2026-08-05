'use strict';

/**
 * nav.js — shared mobile navigation for 3TRES6.
 *
 * Works across both nav architectures in the codebase:
 *   - root/section pages: single #mainNav (desktop + mobile drawer)
 *   - dj/* pages: #mainNav (desktop) + #mobileNav (mobile drawer)
 *
 * The toggle is delegation-based so it survives swup SPA swaps.
 * Open state: .nav-open on #mainNav or .active on #mobileNav, .active on the
 * hamburger button, and a body.menu-open class for the backdrop.
 */
(function () {
  if (window.Muntaner336 && window.Muntaner336.navBound) return;

  function navEl() {
    return document.getElementById('mobileNav') || document.getElementById('mainNav');
  }

  function isOpen() {
    var el = navEl();
    if (!el) return false;
    return el.classList.contains('nav-open') || el.classList.contains('active');
  }

  function setOpen(open) {
    var el = navEl();
    var btn = document.getElementById('mobileMenuBtn');
    if (el) {
      el.classList.toggle('nav-open', open);
      el.classList.toggle('active', open);
    }
    if (btn) {
      btn.classList.toggle('active', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    document.body.classList.toggle('menu-open', open);
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var btn = t.closest('#mobileMenuBtn');
    var inside = t.closest('#mobileNav') || t.closest('#mainNav');
    if (btn) {
      e.preventDefault();
      setOpen(!isOpen());
      return;
    }
    if (inside && t.closest('a')) {
      setOpen(false);
      return;
    }
    if (isOpen() && !inside) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) setOpen(false);
  });

  if (window.Muntaner336 && typeof window.Muntaner336.onPageView === 'function') {
    window.Muntaner336.onPageView(function () {
      setOpen(false);
    });
  }

  window.Muntaner336 = window.Muntaner336 || {};
  window.Muntaner336.navBound = true;
})();
