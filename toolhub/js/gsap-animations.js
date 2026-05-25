// toolhub GSAP animations — 3TRES6 Records
// Requires: gsap, ScrollTrigger (loaded via CDN in HTML)

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

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

  // ── Affiliate cards — CSS handles visibility (ScrollTrigger caused animation conflicts) ─
});
