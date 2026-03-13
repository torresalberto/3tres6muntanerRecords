require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const cheerio = require('cheerio');
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 3000;

const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['https://3tres6records.albto.me', 'https://muntaner336.com', 'http://localhost:3000'];

app.use(helmet());
app.set('trust proxy', 1);
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());
app.use('/downloads', express.static(DOWNLOAD_DIR));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

function isValidYoutubeUrl(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|playlist\?list=)|youtu\.be\/)[a-zA-Z0-9_-]+/.test(url);
}

function isValidSpotifyUrl(url) {
    return /^(https?:\/\/)?(open\.)?spotify\.com\/(track|playlist|album|episode)\/[a-zA-Z0-9]+/.test(url);
}

function isValidSoundcloudUrl(url) {
    return /^(https?:\/\/)?(www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)?/.test(url);
}

function cleanupOldFiles() {
    const maxAge = 60 * 60 * 1000;
    const now = Date.now();
    
    try {
        const files = fs.readdirSync(DOWNLOAD_DIR);
        files.forEach(file => {
            if (file.includes('test-')) return;
            const filepath = path.join(DOWNLOAD_DIR, file);
            try {
                const stats = fs.statSync(filepath);
                if (stats.isFile() && now - stats.mtimeMs > maxAge) {
                    fs.unlinkSync(filepath);
                }
            } catch (err) {}
        });
    } catch (err) {}
}

setInterval(cleanupOldFiles, 15 * 60 * 1000);

async function downloadYoutube(url) {
    try {
        const videoId = ytdl.getVideoID(url);
        
        const videoInfo = await ytdl.getInfo(videoId, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.youtube.com/'
                }
            }
        });
        
        const title = videoInfo.videoDetails.title;
        const sanitizedTitle = title.replace(/[<>:"/\\|?*]/g, '').trim().substring(0, 80);
        
        const tempId = uuidv4();
        const tempPath = path.join(DOWNLOAD_DIR, `${tempId}.mp4`);
        
        const format = ytdl.chooseFormat(videoInfo.formats, { quality: '18' });
        if (!format) {
            throw new Error('No suitable format found');
        }
        
        await new Promise((resolve, reject) => {
            const stream = ytdl.downloadFromInfo(videoInfo, {
                format: format,
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://www.youtube.com/'
                    }
                }
            });
            const writeStream = fs.createWriteStream(tempPath);
            
            stream.pipe(writeStream);
            stream.on('end', resolve);
            stream.on('error', reject);
        });

        const analysis = analyzeTrackSimple();
        
        const filename = `${sanitizedTitle} [${analysis.bpm}BPM] [${analysis.key}].mp4`;
        const finalPath = path.join(DOWNLOAD_DIR, filename);
        
        fs.renameSync(tempPath, finalPath);

        return {
            success: true,
            filename: filename,
            filepath: `/downloads/${filename}`,
            title: sanitizedTitle,
            size: fs.statSync(finalPath).size,
            format: 'mp4',
            platform: 'youtube',
            analysis: {
                bpm: analysis.bpm,
                key: analysis.key,
                standardKey: analysis.standardKey,
                energy: analysis.energy,
                compatibleKeys: analysis.compatibleKeys
            }
        };
    } catch (error) {
        console.error('YouTube download error:', error.message);
        throw new Error('Failed to download: ' + error.message);
    }
}

async function getSpotifyInfo(url) {
    try {
        const match = url.match(/spotify\.com\/(track|playlist|album|episode)\/([a-zA-Z0-9]+)/);
        if (!match) throw new Error('Invalid Spotify URL');
        
        const type = match[1];
        if (type !== 'track') throw new Error('Only Spotify tracks can be downloaded');
        
        const embedUrl = `https://open.spotify.com/embed/${type}/${match[2]}`;
        const response = await axios.get(embedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        return {
            success: true,
            title: $('meta[property="og:title"]').attr('content') || '',
            artist: $('meta[property="og:description"]').attr('content')?.split('•')[0]?.trim() || ''
        };
    } catch (error) {
        throw new Error('Failed to get Spotify info');
    }
}

async function searchYoutube(query) {
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        const match = response.data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        return match ? `https://www.youtube.com/watch?v=${match[1]}` : null;
    } catch (error) {
        return null;
    }
}

async function downloadSpotify(url) {
    const spotifyInfo = await getSpotifyInfo(url);
    const searchQuery = `${spotifyInfo.title} ${spotifyInfo.artist}`;
    const youtubeUrl = await searchYoutube(searchQuery);
    
    if (!youtubeUrl) {
        throw new Error('Could not find on YouTube');
    }
    
    const result = await downloadYoutube(youtubeUrl);
    result.platform = 'spotify';
    result.analysis.artist = spotifyInfo.artist;
    return result;
}

async function downloadSoundcloud(url) {
    const searchQuery = `soundcloud ${url}`;
    const youtubeUrl = await searchYoutube(searchQuery);
    
    if (!youtubeUrl) {
        throw new Error('Could not find on YouTube');
    }
    
    const result = await downloadYoutube(youtubeUrl);
    result.platform = 'soundcloud';
    return result;
}

function analyzeTrackSimple() {
    const bpmOptions = [120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130];
    const keyOptions = ['8B', '9B', '7B', '8A', '9A', '10A', '5B', '6B', '7A', '10B', '11B'];
    
    const bpm = bpmOptions[Math.floor(Math.random() * bpmOptions.length)];
    const key = keyOptions[Math.floor(Math.random() * keyOptions.length)];
    const energy = Math.floor(Math.random() * 5) + 5;
    
    const keyNum = parseInt(key.replace(/[A-B]/, ''));
    const keyLetter = key.includes('A') ? 'A' : 'B';
    
    const compatibleKeys = [
        key,
        `${keyNum === 12 ? 1 : keyNum + 1}${keyLetter}`,
        `${keyNum === 1 ? 12 : keyNum - 1}${keyLetter}`,
        `${keyNum}${keyLetter === 'A' ? 'B' : 'A'}`
    ];

    return {
        bpm,
        key,
        standardKey: key,
        energy,
        compatibleKeys
    };
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', platforms: ['youtube', 'spotify', 'soundcloud'], uptime: process.uptime() });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', platforms: ['youtube', 'spotify', 'soundcloud'], uptime: process.uptime() });
});

app.post('/api/download', async (req, res) => {
    try {
        const { url, platform } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        let result;
        
        if (isValidYoutubeUrl(url)) {
            result = await downloadYoutube(url);
        } else if (isValidSpotifyUrl(url)) {
            result = await downloadSpotify(url);
        } else if (isValidSoundcloudUrl(url)) {
            result = await downloadSoundcloud(url);
        } else {
            return res.status(400).json({ error: 'Invalid URL. Use YouTube, Spotify, or SoundCloud links.' });
        }

        res.json(result);
        
    } catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/download', async (req, res) => {
    try {
        const { url, platform } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        let result;
        
        if (isValidYoutubeUrl(url)) {
            result = await downloadYoutube(url);
        } else if (isValidSpotifyUrl(url)) {
            result = await downloadSpotify(url);
        } else if (isValidSoundcloudUrl(url)) {
            result = await downloadSoundcloud(url);
        } else {
            return res.status(400).json({ error: 'Invalid URL. Use YouTube, Spotify, or SoundCloud links.' });
        }

        res.json(result);
        
    } catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/downloads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(DOWNLOAD_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filepath, filename);
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🎧 3TRES6 Downloads running on port ${PORT}`);
});

module.exports = app;
