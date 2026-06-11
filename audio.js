// Standalone audio player - works on any page
// Requires: player-init.js (injects controls)
// Skipped if script.js already defines AudioPlayer
(function() {
  if (window.AudioPlayer) return; // Already defined by script.js

  const DEFAULT_VIDEO_ID = 'qfF19hUzLo0';

  const AudioPlayer = {
    isPlaying: false,
    isMuted: false,
    currentVideoId: null,
    currentTitle: '3TRES6 Radio',

    STORAGE_KEY: '3tres6_audio_state',

    saveState() {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        videoId: this.currentVideoId,
        title: this.currentTitle,
        isMuted: this.isMuted,
        timestamp: Date.now(),
      }));
    },

    loadState() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (_) { return null; }
    },

    init() {
      const audioToggle = document.getElementById('audioToggle');
      if (!audioToggle) return;

      audioToggle.addEventListener('click', () => {
        if (this.isMuted) {
          this.unmute();
        } else {
          this.mute();
        }
      });

      const saved = this.loadState();
      const savedAge = saved ? Date.now() - saved.timestamp : Infinity;
      const isRecent = savedAge < 5000;

      if (saved && isRecent && saved.videoId) {
        this.startMusic(saved.videoId, saved.title, true);
      } else {
        this.startMusic(DEFAULT_VIDEO_ID, '3TRES6 Radio', true);
      }

      const unmuteHandler = () => {
        if (this.isMuted) this.unmute();
        document.removeEventListener('click', unmuteHandler);
        document.removeEventListener('keydown', unmuteHandler);
        document.removeEventListener('touchstart', unmuteHandler);
      };
      document.addEventListener('click', unmuteHandler, { once: true });
      document.addEventListener('keydown', unmuteHandler, { once: true });
      document.addEventListener('touchstart', unmuteHandler, { once: true });
    },

    startMusic(videoId, title, startMuted) {
      const container = document.getElementById('youtubeAudioContainer');
      if (!container) return;

      container.style.display = '';
      const vid = videoId || DEFAULT_VIDEO_ID;
      this.currentVideoId = vid;
      this.currentTitle = title || '3TRES6 Radio';
      this.isMuted = startMuted;

      const muteParam = startMuted ? 1 : 0;
      const src = `https://www.youtube.com/embed/${vid}?autoplay=1&mute=${muteParam}&loop=1&playlist=${vid}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;

      container.innerHTML = `<iframe id="ytPlayer" width="0" height="0" src="${src}" allow="autoplay" style="position:absolute;width:0;height:0;opacity:0;pointer-events:none;"></iframe>`;

      this.isPlaying = true;
      this.updateUI(true, this.currentTitle, startMuted);
      this.saveState();
    },

    mute() {
      const iframe = document.getElementById('ytPlayer');
      if (iframe) iframe.contentWindow?.postMessage('{"event":"command","func":"mute","args":""}', '*');
      this.isMuted = true;
      this.updateUI(true, this.currentTitle, true);
    },

    unmute() {
      const iframe = document.getElementById('ytPlayer');
      if (iframe) iframe.contentWindow?.postMessage('{"event":"command","func":"unMute","args":""}', '*');
      this.isMuted = false;
      this.updateUI(true, this.currentTitle, false);
    },

    updateUI(playing, title, muted) {
      const toggle = document.getElementById('audioToggle');
      const controls = document.getElementById('audioControls');
      const info = document.querySelector('.track-info');

      if (playing) {
        toggle?.classList.add('playing');
        controls?.classList.add('playing');
        if (info) {
          const t = title || '3TRES6 Radio';
          const truncated = t.length > 25 ? t.substring(0, 22) + '...' : t;
          info.textContent = muted ? `🔇 ${truncated}` : `🎵 ${truncated}`;
        }
      } else {
        toggle?.classList.remove('playing');
        controls?.classList.remove('playing');
        if (info) info.textContent = '🎵 3TRES6 Radio';
      }
    },
  };

  window.AudioPlayer = AudioPlayer;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AudioPlayer.init());
  } else {
    AudioPlayer.init();
  }
})();
