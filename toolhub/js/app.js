const App = {
  DOWNLOAD_LIMIT: 3,
  // Backend retired — download service temporarily unavailable

  state: {
    platform: 'youtube',
    isLoading: false,
    downloadCount: 0,
    currentDownload: null,
  },

  init() {
    this.loadDownloadCount();
    this.bindEvents();
    this.detectPlatform();
    this.checkForExistingDownload();
    this.checkBackendHealth();
  },

  async checkBackendHealth() {
    // Backend retired — no health check needed
    console.warn('Download backend retired — service temporarily unavailable');
  },

  loadDownloadCount() {
    const count = parseInt(localStorage.getItem('3tres6_downloads') || '0');
    this.state.downloadCount = count;
    this.updateDownloadCounter();
  },

  updateDownloadCounter() {
    const counterEl = document.getElementById('downloadCount');
    if (counterEl) {
      counterEl.textContent = this.state.downloadCount;
    }
  },

  incrementDownloadCount() {
    this.state.downloadCount++;
    localStorage.setItem('3tres6_downloads', this.state.downloadCount.toString());
    this.updateDownloadCounter();
  },

  bindEvents() {
    const urlInput = document.getElementById('urlInput');
    const pasteBtn = document.getElementById('pasteBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const retryBtn = document.getElementById('retryBtn');
    const platformTabs = document.querySelectorAll('.platform-tab');
    const modalClose = document.getElementById('modalClose');
    const skipBtn = document.getElementById('skipBtn');
    const emailForm = document.getElementById('emailForm');

    if (pasteBtn) {
      pasteBtn.addEventListener('click', () => this.pasteFromClipboard());
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.startDownload());
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.resetUI());
    }

    if (urlInput) {
      urlInput.addEventListener('input', () => this.detectPlatform());
      urlInput.addEventListener('paste', (e) => {
        setTimeout(() => this.detectPlatform(), 100);
      });
      urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.startDownload();
        }
      });
    }

    platformTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.setPlatform(tab.dataset.platform);
      });
    });

    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.closeModal();
        localStorage.setItem('3tres6_email_skipped', 'true');
      });
    }

    if (emailForm) {
      emailForm.addEventListener('submit', (e) => this.handleEmailSubmit(e));
    }

    document.getElementById('emailModal').addEventListener('click', (e) => {
      if (e.target.id === 'emailModal') {
        this.closeModal();
      }
    });
  },

  detectPlatform() {
    const url = document.getElementById('urlInput').value.trim();

    if (this.isYouTubeUrl(url)) {
      this.setPlatform('youtube');
    } else if (this.isSoundcloudUrl(url)) {
      this.setPlatform('soundcloud');
    }
  },

  setPlatform(platform) {
    this.state.platform = platform;

    document.querySelectorAll('.platform-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.platform === platform);
    });
  },

  isYouTubeUrl(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|playlist\?list=)|youtu\.be\/)[a-zA-Z0-9_-]+/.test(
      url
    );
  },

  isSoundcloudUrl(url) {
    // Accept either full SoundCloud URLs OR track IDs (numbers like 293)
    if (/^\d+$/.test(url)) {
      return true;
    }
    return /^(https?:\/\/)?(www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)?/.test(url);
  },

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const urlInput = document.getElementById('urlInput');
      urlInput.value = text;
      this.detectPlatform();
      urlInput.focus();
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  },

  async startDownload() {
    let url = document.getElementById('urlInput').value.trim();

    if (!url) {
      this.showError('Por favor ingresa una URL válida');
      return;
    }

    if (!this.validateUrl(url)) {
      this.showError('URL no válida. Usa enlaces de YouTube o SoundCloud');
      return;
    }

    // For SoundCloud track IDs (plain numbers), convert to API URL
    if (this.state.platform === 'soundcloud' && /^\d+$/.test(url)) {
      url = `https://api.soundcloud.com/tracks/${url}`;
    }
    // For SoundCloud URLs, try to resolve to track ID via proxy
    else if (this.state.platform === 'soundcloud' && url.includes('soundcloud.com')) {
      const trackId = await this.resolveSoundcloudUrl(url);
      if (trackId) {
        url = `https://api.soundcloud.com/tracks/${trackId}`;
      } else {
        this.showError('SoundCloud requiere el ID de pista (número). Ejemplo: 293. Encuentra el ID en la URL de compartir.');
        return;
      }
    }

    // Call backend API instead of external redirector
    await this.downloadFromAPI(url);
  },

  async resolveSoundcloudUrl(url) {
    try {
      // Use a CORS proxy to fetch the SoundCloud page
      // The browser can access SoundCloud directly via a proxy
      const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch SoundCloud page via proxy:', response.status);
        // Fallback: try direct fetch
        return await this.resolveSoundcloudUrlDirect(url);
      }

      const html = await response.text();

      // Look for track ID in various formats in the HTML
      // Pattern 1: "track_id":123456789
      const match1 = html.match(/"track_id"\s*:\s*(\d+)/);
      if (match1) {
        return match1[1];
      }

      // Pattern 2: api.soundcloud.com/tracks/123456789
      const match2 = html.match(/api\.soundcloud\.com\/tracks\/(\d+)/);
      if (match2) {
        return match2[1];
      }

      // Pattern 3: data-trackid="123456789"
      const match3 = html.match(/data-trackid\s*=\s*["'](\d+)["']/);
      if (match3) {
        return match3[1];
      }

      // Pattern 4: tracks in widget config
      const match4 = html.match(/tracks\/(\d+)/);
      if (match4) {
        return match4[1];
      }

      console.error('Could not find track ID in SoundCloud page');
      return null;
    } catch (error) {
      console.error('Error resolving SoundCloud URL:', error);
      // Try direct fetch as fallback
      return await this.resolveSoundcloudUrlDirect(url);
    }
  },

  async resolveSoundcloudUrlDirect(url) {
    try {
      // Direct fetch without proxy - might work depending on browser
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',  // This will return an opaque response but might work
      });
      return null; // no-cors won't give us the content
    } catch (error) {
      console.error('Direct fetch also failed:', error);
      return null;
    }
  },

  async downloadFromAPI(url) {
    this.showLoading();
    // Backend retired — download service temporarily unavailable
    this.showError('⚠️ El servicio de descarga está en mantenimiento. Usa Y2Mate o SoundCloud-Downloader como alternativa.');
  },

  async pollJobStatus(jobId) {
    // Backend retired — no polling needed
  },

  showReclipResult(downloadUrl, filename) {
    this.state.isLoading = false;

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('resultCard').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('downloadBtn').disabled = false;

    document.getElementById('resultTitle').textContent = filename.replace(/\.[^/.]+$/, '');
    document.getElementById('resultArtist').textContent = '3TRES6 Tools';

    document.getElementById('bpmValue').textContent = '-';
    document.getElementById('keyValue').textContent = '-';
    document.getElementById('energyValue').textContent = '-/10';
    document.getElementById('energyFill').style.width = '0%';
    document.getElementById('keyTags').innerHTML = '';

    const downloadLinkBtn = document.getElementById('downloadLinkBtn');
    downloadLinkBtn.href = downloadUrl;
    downloadLinkBtn.target = '_blank';
    downloadLinkBtn.download = filename;
    downloadLinkBtn.textContent = 'Descargar Archivo';
    downloadLinkBtn.onclick = null;

    this.simulateProgress();
  },

  validateUrl(url) {
    return this.isYouTubeUrl(url) || this.isSoundcloudUrl(url);
  },

  showLoading() {
    this.state.isLoading = true;

    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('downloadBtn').disabled = true;

    this.updateProgress(10, 'Conectando...');
  },

  updateProgress(percent, status) {
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressStatus').textContent = status;
  },

  showResult(data) {
    this.state.isLoading = false;
    this.state.currentDownload = data;

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('resultCard').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('downloadBtn').disabled = false;

    document.getElementById('resultTitle').textContent = data.title || 'Track';
    document.getElementById('resultArtist').textContent = data.artist || 'Unknown Artist';

    const analysis = data.analysis || {};

    document.getElementById('bpmValue').textContent = analysis.bpm || '128';
    document.getElementById('keyValue').textContent = analysis.key || '8B';

    const energy = analysis.energy || 5;
    document.getElementById('energyValue').textContent = `${energy}/10`;
    document.getElementById('energyFill').style.width = `${energy * 10}%`;

    const compatibleKeys = analysis.compatibleKeys || [];
    const keyTagsEl = document.getElementById('keyTags');
    keyTagsEl.innerHTML = compatibleKeys
      .map((key) => `<span class="key-tag">${key}</span>`)
      .join('');

    const downloadLinkBtn = document.getElementById('downloadLinkBtn');

    // Use redirect URL from backend (new approach)
    const serviceName = data.service || 'Y2Meta';
    if (data.downloadUrl) {
      downloadLinkBtn.href = data.downloadUrl;
      downloadLinkBtn.target = '_blank';
      downloadLinkBtn.textContent = `Abrir ${serviceName} para descargar`;
      downloadLinkBtn.onclick = null;
      
      // Auto-redirect after short delay
      setTimeout(() => {
        window.open(data.downloadUrl, '_blank');
      }, 2000);
    } else if (data.filepath) {
      // Fallback to server file if available
      downloadLinkBtn.href = data.filepath;
      downloadLinkBtn.target = '_blank';
      downloadLinkBtn.download = data.filename || 'download.mp4';
      downloadLinkBtn.textContent = `Descargar ${data.filename || 'Archivo'}`;
      downloadLinkBtn.onclick = null;
    } else {
      downloadLinkBtn.href = '#';
      downloadLinkBtn.textContent = 'Descargar Archivo';
      downloadLinkBtn.onclick = (e) => {
        e.preventDefault();
        this.showError('No se pudo generar el enlace de descarga');
      };
    }

    this.simulateProgress();
  },

  simulateProgress() {
    let progress = 10;
    const statuses = [
      'Conectando...',
      'Obteniendo información...',
      'Descargando audio...',
      'Analizando pista...',
      'Detectando BPM...',
      'Detectando key...',
      'Finalizando...',
    ];

    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 90) {
        progress = 90;
        clearInterval(interval);
      }

      const statusIndex = Math.min(
        Math.floor((progress / 100) * statuses.length),
        statuses.length - 1
      );

      this.updateProgress(progress, statuses[statusIndex]);
    }, 500);
  },

  showError(message) {
    this.state.isLoading = false;

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('downloadBtn').disabled = false;

    document.getElementById('errorMessage').textContent = message;
  },

  resetUI() {
    this.state.isLoading = false;

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('downloadBtn').disabled = false;
    document.getElementById('urlInput').value = '';
    this.updateProgress(0, 'Preparando...');
  },

  checkEmailCapture() {
    const shouldSkip = localStorage.getItem('3tres6_email_skipped') === 'true';
    const hasEmail = localStorage.getItem('3tres6_email') !== null;

    if (!shouldSkip && !hasEmail && this.state.downloadCount >= this.DOWNLOAD_LIMIT) {
      setTimeout(() => {
        this.showEmailModal();
      }, 2000);
    }
  },

  showEmailModal() {
    document.getElementById('emailModal').style.display = 'flex';
  },

  closeModal() {
    document.getElementById('emailModal').style.display = 'none';
  },

  async handleEmailSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('emailInput').value.trim();

    if (!email || !email.includes('@')) {
      return;
    }

    // Backend retired — save locally only
    localStorage.setItem('3tres6_email', email);
    this.closeModal();
    alert('¡Gracias! Tu email ha sido guardado.');
  },

  checkForExistingDownload() {
    const savedDownload = localStorage.getItem('3tres6_current_download');
    if (savedDownload) {
      try {
        const data = JSON.parse(savedDownload);
        document.getElementById('urlInput').value = data.url || '';
        this.detectPlatform();
      } catch (e) {
        localStorage.removeItem('3tres6_current_download');
      }
    }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
