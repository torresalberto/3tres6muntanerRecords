// Inject persistent audio player controls into any page
(function() {
  if (document.getElementById('audioToggle')) return;

  const html = `
    <div class="audio-controls playing" id="audioControls">
      <button class="audio-toggle playing" id="audioToggle" aria-label="Silenciar/Activar audio">
        <svg class="icon-playing" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        <svg class="icon-muted" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      </button>
      <div class="now-playing-bar">
        <span class="pulse"></span>
        <span class="track-info" id="trackInfo">🎵 3TRES6 Radio</span>
      </div>
    </div>
    <div id="youtubeAudioContainer" class="youtube-mini-player"></div>
  `;
  document.body.insertAdjacentHTML('afterbegin', html);

  // Load audio player script if not already loaded
  if (!window.AudioPlayer) {
    const s = document.createElement('script');
    // Detect if we're in a subdirectory (dj/ or toolhub/)
    const isSubdir = window.location.pathname.includes('/dj/') || window.location.pathname.includes('/toolhub/') || window.location.pathname.includes('/dj-library/');
    s.src = isSubdir ? '../audio.js' : 'audio.js';
    document.body.appendChild(s);
  }
})();
