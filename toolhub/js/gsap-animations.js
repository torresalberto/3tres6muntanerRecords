// toolhub GSAP animations — 3TRES6 Records
// Requires: gsap, ScrollTrigger (loaded via CDN in HTML)

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // ── Hero entrance ──────────────────────────────────────────────
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTl
    .from('.hero-badge', {
      y: -30,
      opacity: 0,
      duration: 0.6,
    })
    .from('.hero-downloads h1', {
      y: 60,
      opacity: 0,
      duration: 0.8,
      clipPath: 'inset(0 0 100% 0)',
    }, '-=0.2')
    .from('.hero-downloads p', {
      y: 30,
      opacity: 0,
      duration: 0.6,
    }, '-=0.4')
    .from('.download-counter', {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
    }, '-=0.3');

  // ── Download counter count-up ───────────────────────────────────
  const counterEl = document.getElementById('downloadCount');
  if (counterEl) {
    const stored = parseInt(localStorage.getItem('downloadCount') || '0', 10);
    if (stored > 0) {
      gsap.from({ val: 0 }, {
        val: stored,
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.8,
        onUpdate: function () {
          counterEl.textContent = Math.round(this.targets()[0].val);
        },
      });
    }
  }

  // ── Tool tabs staggered entrance ───────────────────────────────
  gsap.from('.tool-tab', {
    y: 40,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'back.out(1.4)',
    delay: 0.4,
  });

  // ── Tab hover: subtle lift + glow ─────────────────────────────
  document.querySelectorAll('.tool-tab').forEach(tab => {
    tab.addEventListener('mouseenter', () => {
      gsap.to(tab, { y: -4, scale: 1.03, duration: 0.25, ease: 'power2.out' });
    });
    tab.addEventListener('mouseleave', () => {
      gsap.to(tab, { y: 0, scale: 1, duration: 0.25, ease: 'power2.out' });
    });
  });

  // ── Section transition (replaces basic CSS fadeInUp) ───────────
  window.gsapAnimateSection = (section) => {
    gsap.fromTo(
      section,
      { y: 30, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' }
    );
  };

  // ── Affiliate cards scroll reveal ─────────────────────────────
  gsap.from('.affiliate-card', {
    scrollTrigger: {
      trigger: '.affiliate-section',
      start: 'top 80%',
    },
    y: 50,
    opacity: 0,
    duration: 0.5,
    stagger: 0.12,
    ease: 'power2.out',
  });

  // ── Download button pulse on idle ─────────────────────────────
  gsap.to('#downloadBtn', {
    boxShadow: '0 0 24px rgba(255, 77, 0, 0.5)',
    repeat: -1,
    yoyo: true,
    duration: 1.6,
    ease: 'sine.inOut',
    delay: 2,
  });

  // ── Result card entrance when shown ───────────────────────────
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.target.id === 'resultCard' && m.target.style.display !== 'none') {
        gsap.fromTo('#resultCard',
          { y: 20, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)' }
        );
      }
    });
  });
  const resultCard = document.getElementById('resultCard');
  if (resultCard) observer.observe(resultCard, { attributes: true, attributeFilter: ['style'] });
});
