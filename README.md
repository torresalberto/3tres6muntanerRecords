# MUNTANER336 - Complete Website Build
## Barcelona → México | Vinilos Europeos de Segunda Mano

---

## 📁 FILE STRUCTURE

```
/website-build/
├── index.html          ← Main website (all sections)
├── styles.css          ← Complete styling
├── script.js           ← All frontend functionality
├── product.html        ← Single product page template
├── README.md           ← This file
│
└── /backend/           ← API Server
    ├── server.js       ← Express server with Discogs, MP, Brevo
    ├── package.json    ← Dependencies
    └── .env.example    ← Environment variables template
```

---

## ✅ FEATURES IMPLEMENTED

### Frontend
| Feature | Status |
|---------|--------|
| Animated ticker banner (Mercado Pago) | ✅ |
| Audio controls (no welcome screen) | ✅ |
| Shopify-style checkout (3 steps) | ✅ |
| Audio preview in Quick View (YouTube/SoundCloud) | ✅ |
| Specials "Playlist" in Hero | ✅ |
| Instagram section (unique posts) | ✅ |
| Localized yellow section (CDMX) | ✅ |
| Shopping cart sidebar | ✅ |
| Exit intent popup (10% off) | ✅ |
| SEO meta tags + JSON-LD | ✅ |
| GA4 event tracking (15+ events) | ✅ |
| Mobile responsive | ✅ |
| Newsletter form | ✅ |

### Backend
| Feature | Status |
|---------|--------|
| Discogs API inventory sync | ✅ |
| Hourly auto-sync (cron) | ✅ |
| Product filtering/sorting | ✅ |
| Mercado Pago checkout | ✅ |
| Brevo email newsletter | ✅ |
| WhatsApp contact | ✅ |
| Rate limiting | ✅ |
| CORS security | ✅ |

---

## 🚀 QUICK START

### Step 1: Get Discogs API Credentials

1. Go to: https://www.discogs.com/settings/developers
2. Click "Create an Application"
3. Fill in:
   - **Name:** `Muntaner336 Website`
   - **Description:** `Sync inventory to muntaner336.com`
   - **Homepage:** `https://muntaner336.com`
4. Copy **Consumer Key** and **Consumer Secret**

### Step 2: Configure Frontend

Edit `script.js` lines 13-16:
```javascript
discogs: {
    consumerKey: 'YOUR_KEY_HERE',
    consumerSecret: 'YOUR_SECRET_HERE',
    username: 'muntaner336',
```

Edit `index.html` line 57:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_GA4_ID"></script>
```

### Step 3: Configure Backend (Optional but Recommended)

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm start
```

### Step 4: Deploy

**Netlify (Recommended):**
1. Go to netlify.com
2. Drag & drop `website-build` folder
3. Done!

---

## 📋 CONFIGURATION CHECKLIST

### Required
- [ ] Discogs Consumer Key + Secret
- [ ] GA4 Measurement ID
- [ ] WhatsApp number (format: 5215512345678)

### Recommended
- [ ] Mercado Pago credentials
- [ ] Brevo API key
- [ ] YouTube video ID for background music
- [ ] Custom domain (muntaner336.com)

---

## 🔧 ENVIRONMENT VARIABLES

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
# Discogs
DISCOGS_CONSUMER_KEY=your_key
DISCOGS_CONSUMER_SECRET=your_secret
DISCOGS_USERNAME=muntaner336

# Mercado Pago
MP_ACCESS_TOKEN=your_token
MP_PUBLIC_KEY=your_public_key

# Brevo Email
BREVO_API_KEY=your_key
BREVO_LIST_ID=2

# WhatsApp
WHATSAPP_NUMBER=5215512345678

# Server
PORT=3000
FRONTEND_URL=https://muntaner336.com
```

---

## 📡 API ENDPOINTS

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | Get all products |
| GET | `/api/inventory?genre=house` | Filter by genre |
| GET | `/api/inventory/specials` | Get special offers |
| GET | `/api/product/:id` | Get single product |
| POST | `/api/inventory/sync` | Force inventory sync |
| POST | `/api/checkout` | Create payment |
| POST | `/api/newsletter` | Subscribe email |
| POST | `/api/contact` | Contact form |

---

## 📊 GA4 EVENTS TRACKED

| Event | Trigger |
|-------|---------|
| `audio_play` | Music starts |
| `audio_pause` | Music stops |
| `view_item` | Product card seen |
| `view_item_details` | Quick view opened |
| `add_to_cart` | Add to cart clicked |
| `begin_checkout` | Checkout started |
| `payment_method_selected` | Payment chosen |
| `filter_used` | Catalog filtered |
| `scroll_depth` | 25%, 50%, 75%, 90% |
| `newsletter_signup` | Email submitted |
| `exit_intent_shown` | Popup displayed |
| `whatsapp_click` | WhatsApp clicked |

---

## 🎨 DESIGN CONSISTENCY

### Color Palette
```css
--color-bg: #0a0a0a;           /* Main background */
--color-bg-card: #161616;      /* Card background */
--color-accent: #ff4d00;       /* Orange accent */
--color-text: #ffffff;         /* Primary text */
--color-text-muted: #888888;   /* Secondary text */
--color-yellow: #f5c518;       /* Info banner */
--color-mp-blue: #00bcff;      /* Mercado Pago */
```

### Typography
- Font: Space Grotesk
- Weights: 300, 400, 500, 600, 700

### Spacing
- Section padding: 100px 40px (desktop), 60px 20px (mobile)
- Card border-radius: 8px (md), 12px (lg)

---

## 📱 RESPONSIVE BREAKPOINTS

| Breakpoint | Description |
|------------|-------------|
| 1200px | Large desktop (4-column grid) |
| 992px | Desktop (3-column grid) |
| 768px | Tablet (2-column grid) |
| 480px | Mobile (1-column grid) |

---

## 🔒 SECURITY NOTES

1. **Never commit `.env`** - Add to `.gitignore`
2. **API keys in frontend** - Only public keys (Discogs, MP Public)
3. **Backend handles secrets** - MP Access Token, Brevo API Key
4. **Rate limiting enabled** - 100 requests per 15 minutes
5. **CORS configured** - Only allowed origins

---

## 📦 DEPLOYMENT OPTIONS

### Static Hosting (Frontend Only)
- Netlify (recommended)
- Vercel
- GitHub Pages

### Full Stack (Frontend + Backend)
- Railway
- Render
- Heroku
- DigitalOcean App Platform

### Self-Hosted
- VPS with Node.js + Nginx
- Docker container

---

## 🆘 TROUBLESHOOTING

### Products not loading?
1. Check browser console (F12)
2. Verify Discogs credentials
3. Clear localStorage: `localStorage.clear()`

### Checkout not working?
1. Backend must be running
2. Mercado Pago credentials required
3. Use "Transfer" option for now

### Mobile menu broken?
1. Check if script.js loaded
2. Look for JavaScript errors

### Exit popup not showing?
1. Clear cookies
2. Wait 5 seconds on page
3. Move mouse to top of screen

---

## 📞 SUPPORT

- **Project Files:** `/Users/altome/Documents/Agency/Muntaner336/`
- **Strategy Docs:** `/Strategy/` folder
- **Operations Docs:** `/Operations/` folder

---

## 🎵 MUNTANER336

**Barcelona → México**

*Del underground europeo a tu tornamesa.*
