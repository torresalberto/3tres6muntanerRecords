# ReClip Backend - Deployment Guide

## Quick Deploy to Render.com

### 1. Create Account
Go to [render.com](https://render.com) and create a free account

### 2. Create New Web Service
- Dashboard → "New" → "Web Service"
- Connect your GitHub repository (or create a new repo with this code)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python reclip.py`

### 3. Configuration
- **Name**: `336-reclip` (or whatever you prefer)
- **Environment**: Python
- **Region**: Frankfurt (closest to Europe)
- **Branch**: main

### 4. After Deploy
Copy your Render URL (e.g., `https://336-reclip.onrender.com`) and update it in:
- `downloads/index.html` line ~543: `window.API_BASE = 'YOUR_RENDER_URL'`

---

## Files Included
- `reclip.py` - Flask backend with yt-dlp
- `requirements.txt` - Python dependencies
- `runtime.txt` - Python version (3.11)
- `Procfile` - Render startup command
- `downloads/` - Folder for downloaded files (ephemeral on Render)

---

## Supported Platforms
- YouTube (video + audio)
- SoundCloud (audio)
- 1000+ other sites via yt-dlp

---

## Notes
- Render's free tier: 750 hours/month
- App sleeps after 15 min inactivity (wakes on request)
- Downloads folder is ephemeral - files deleted after each deploy or periodically
- If you need persistent storage, use Render's "Mount" feature with persistent disk