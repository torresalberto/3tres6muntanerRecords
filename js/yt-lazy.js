/**
 * yt-lazy.js — Click-to-play YouTube embeds.
 *
 * Renders a thumbnail + play button. On click (or Enter/Space when focused),
 * replaces the placeholder with the real <iframe>. Saves ~500KB of JS per
 * YouTube embed (no API load, no iframe until interaction).
 *
 * Usage in HTML:
 *   <div class="yt-lazy" data-vid="dQw4w9WgXcQ" tabindex="0" role="button">
 *     <img src="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" loading="lazy">
 *     <div class="yt-play-btn">▶</div>
 *   </div>
 *
 * YouTube's "nocookie" domain is used so no cookies are set until the user
 * clicks play (privacy-friendly, GDPR-light).
 */

(function () {
  function activate(el) {
    const vid = el.dataset.vid;
    if (!vid) return;
    const title = el.querySelector('img')?.alt || 'YouTube video';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}?autoplay=1&rel=0&modestbranding=1`;
    iframe.title = title;
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0';
    // Replace the inner content with the iframe
    el.innerHTML = '';
    el.appendChild(iframe);
    el.classList.add('yt-active');
    el.removeAttribute('role');
    el.removeAttribute('tabindex');
  }

  // Event delegation so it works with Swup page swaps
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.yt-lazy');
    if (el && !el.classList.contains('yt-active')) {
      e.preventDefault();
      activate(el);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest('.yt-lazy');
    if (el && !el.classList.contains('yt-active')) {
      e.preventDefault();
      activate(el);
    }
  });
})();
