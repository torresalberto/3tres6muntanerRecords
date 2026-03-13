const App = {
    DOWNLOAD_LIMIT: 3,
    API_BASE: window.API_BASE || '/api',
    DOWNLOAD_API_BASE: window.DOWNLOAD_API_BASE || '/api',
    
    state: {
        platform: 'youtube',
        isLoading: false,
        downloadCount: 0,
        currentDownload: null
    },

    init() {
        this.loadDownloadCount();
        this.bindEvents();
        this.detectPlatform();
        this.checkForExistingDownload();
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

        platformTabs.forEach(tab => {
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
        } else if (this.isSpotifyUrl(url)) {
            this.setPlatform('spotify');
        } else if (this.isSoundcloudUrl(url)) {
            this.setPlatform('soundcloud');
        }
    },

    setPlatform(platform) {
        this.state.platform = platform;
        
        document.querySelectorAll('.platform-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.platform === platform);
        });
    },

    isYouTubeUrl(url) {
        return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|playlist\?list=)|youtu\.be\/)[a-zA-Z0-9_-]+/.test(url);
    },

    isSpotifyUrl(url) {
        return /^(https?:\/\/)?(open\.)?spotify\.com\/(track|playlist|album|episode)\/[a-zA-Z0-9]+/.test(url);
    },

    isSoundcloudUrl(url) {
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
        const url = document.getElementById('urlInput').value.trim();
        
        if (!url) {
            this.showError('Por favor ingresa una URL válida');
            return;
        }

        if (!this.validateUrl(url)) {
            this.showError('URL no válida. Usa enlaces de YouTube, Spotify o SoundCloud');
            return;
        }

        // Redirect to external downloader with URL pre-filled
        this.redirectToDownloader(url);
    },

    redirectToDownloader(url) {
        // Encode the URL for the redirect
        const encodedUrl = encodeURIComponent(url);
        
        // List of free downloaders to try
        const downloaders = [
            { name: 'Y2Meta', url: `https://www.y2meta.mobi/youtube-to-mp3?url=${encodedUrl}` },
            { name: 'YTMate', url: `https://ytmate.dev/search?url=${encodedUrl}` },
            { name: 'SaveFrom', url: `https://savefrom.net/youtube-to-mp3?url=${url}` }
        ];

        // Try the first one
        const downloader = downloaders[0];
        
        // Show a message before redirecting
        const message = 'Te redireccionamos a un descargador externo...';
        
        // Update UI to show redirect message
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('resultCard').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('downloadBtn').disabled = true;
        
        this.updateProgress(50, message);
        
        // Increment download count and check email capture
        this.incrementDownloadCount();
        this.checkEmailCapture();
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = downloader.url;
        }, 1500);
    },

    validateUrl(url) {
        return this.isYouTubeUrl(url) || 
               this.isSpotifyUrl(url) || 
               this.isSoundcloudUrl(url);
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
        document.getElementById('resultArtist').textContent = data.analysis?.artist || 'Unknown Artist';

        const analysis = data.analysis || {};
        
        document.getElementById('bpmValue').textContent = analysis.bpm || '128';
        document.getElementById('keyValue').textContent = analysis.key || '8B';
        
        const energy = analysis.energy || 5;
        document.getElementById('energyValue').textContent = `${energy}/10`;
        document.getElementById('energyFill').style.width = `${energy * 10}%`;

        const compatibleKeys = analysis.compatibleKeys || [];
        const keyTagsEl = document.getElementById('keyTags');
        keyTagsEl.innerHTML = compatibleKeys.map(key => 
            `<span class="key-tag">${key}</span>`
        ).join('');

        const downloadLinkBtn = document.getElementById('downloadLinkBtn');
        
        // Redirect to external downloader instead of direct download
        downloadLinkBtn.onclick = (e) => {
            e.preventDefault();
            const encodedUrl = encodeURIComponent(data.originalUrl || `https://youtube.com/watch?v=test`);
            window.location.href = `https://www.y2meta.mobi/youtube-to-mp3?url=${encodedUrl}`;
        };

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
            'Finalizando...'
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

        try {
            await fetch(`${this.API_BASE}/newsletter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    source: 'downloads'
                })
            });

            localStorage.setItem('3tres6_email', email);
            this.closeModal();

            alert('¡Gracias! A partir de ahora tendrás descargas ilimitadas.');
            
        } catch (error) {
            console.error('Email submission error:', error);
            this.closeModal();
        }
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
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
