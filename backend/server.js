/**
 * MUNTANER336 Backend Server
 *
 * Features:
 * - Discogs inventory sync with caching
 * - Mercado Pago payment integration
 * - Newsletter signup (Brevo/Sendinblue)
 * - Hourly auto-sync via cron
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'https://muntaner336.com',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ============================================
// IN-MEMORY CACHE
// ============================================

let inventoryCache = {
  data: [],
  lastUpdated: null,
  isLoading: false,
};

// ============================================
// DISCOGS API
// ============================================

const DISCOGS_CONFIG = {
  consumerKey: process.env.DISCOGS_CONSUMER_KEY,
  consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  username: process.env.DISCOGS_USERNAME || 'muntaner336',
  baseUrl: 'https://api.discogs.com',
  userAgent: 'Muntaner336WebStore/1.0 +https://muntaner336.com',
};

/**
 * Fetch inventory from Discogs API
 */
async function fetchDiscogsInventory() {
  console.log('📦 Fetching inventory from Discogs...');

  if (!DISCOGS_CONFIG.consumerKey || !DISCOGS_CONFIG.consumerSecret) {
    console.error('❌ Discogs credentials not configured');
    return [];
  }

  try {
    let allListings = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `${DISCOGS_CONFIG.baseUrl}/users/${DISCOGS_CONFIG.username}/inventory?page=${page}&per_page=100&status=For%20Sale`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Discogs key=${DISCOGS_CONFIG.consumerKey}, secret=${DISCOGS_CONFIG.consumerSecret}`,
          'User-Agent': DISCOGS_CONFIG.userAgent,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discogs API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.listings && data.listings.length > 0) {
        allListings = allListings.concat(data.listings);
      }

      // Check if there are more pages
      hasMore = data.pagination && page < data.pagination.pages;
      page++;

      // Rate limit protection - wait 1 second between requests
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Fetched ${allListings.length} listings from Discogs`);
    return allListings;
  } catch (error) {
    console.error('❌ Discogs fetch error:', error.message);
    return [];
  }
}

/**
 * Transform Discogs listing to frontend format
 */
function transformListing(listing) {
  const release = listing.release || {};
  const images = release.images || [];
  const artists = release.artists || [{ name: 'Unknown Artist' }];
  const labels = release.labels || [{ name: 'Unknown Label' }];
  const videos = release.videos || [];

  return {
    id: listing.id,
    discogsUrl: listing.uri || `https://www.discogs.com/sell/item/${listing.id}`,
    status: listing.status,

    // Product info
    title: `${artists.map((a) => a.name).join(', ')} – ${release.title || 'Unknown'}`,
    artist: artists.map((a) => a.name).join(', '),
    releaseTitle: release.title || 'Unknown',
    label: labels.map((l) => l.name).join(', '),
    catno: labels[0]?.catno || '',
    year: release.year || '',
    country: release.country || '',

    // Genres
    genres: release.genres || ['Electronic'],
    styles: release.styles || [],
    format: release.format || [],

    // Condition
    condition: listing.condition || 'VG+',
    sleeveCondition: listing.sleeve_condition || 'VG+',

    // Pricing
    price: listing.price?.value || 0,
    currency: listing.price?.currency || 'MXN',
    originalPrice: listing.original_price?.value || null,

    // Media
    image: images[0]?.uri || images[0]?.uri150 || null,
    thumbnail: images[0]?.uri150 || null,

    // Audio preview (from Discogs videos - usually YouTube)
    audioPreview: videos[0]?.uri || null,

    // Seller notes
    comments: listing.comments || '',

    // Metadata
    releaseId: release.id,
    resourceUrl: listing.resource_url,

    // For specials/featured
    isSpecial:
      listing.comments?.toLowerCase().includes('special') ||
      listing.comments?.toLowerCase().includes('oferta') ||
      false,
    discount: null,
  };
}

/**
 * Sync inventory and update cache
 */
async function syncInventory() {
  if (inventoryCache.isLoading) {
    console.log('⏳ Sync already in progress, skipping...');
    return;
  }

  inventoryCache.isLoading = true;

  try {
    const listings = await fetchDiscogsInventory();
    const transformedListings = listings.map(transformListing);

    inventoryCache.data = transformedListings;
    inventoryCache.lastUpdated = new Date().toISOString();
    inventoryCache.isLoading = false;

    console.log(`✅ Cache updated with ${transformedListings.length} products`);
  } catch (error) {
    console.error('❌ Sync error:', error);
    inventoryCache.isLoading = false;
  }
}

// ============================================
// MERCADO PAGO
// ============================================

let mercadopago;
if (process.env.MP_ACCESS_TOKEN) {
  const { MercadoPagoConfig, Preference } = require('mercadopago');
  mercadopago = {
    client: new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN }),
    Preference,
  };
}

/**
 * Create Mercado Pago payment preference
 */
async function createPaymentPreference(items, customer, shipping) {
  if (!mercadopago) {
    throw new Error('Mercado Pago not configured');
  }

  const preference = new mercadopago.Preference(mercadopago.client);

  const preferenceData = {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: 1,
      unit_price: parseFloat(item.price),
      currency_id: 'MXN',
    })),
    payer: {
      email: customer.email,
      name: customer.firstName,
      surname: customer.lastName,
      phone: {
        number: customer.phone,
      },
      address: {
        street_name: customer.address,
        zip_code: customer.zip,
      },
    },
    shipments: {
      cost: parseFloat(shipping.cost),
      mode: 'not_specified',
    },
    back_urls: {
      success: `${process.env.FRONTEND_URL}/checkout/success`,
      failure: `${process.env.FRONTEND_URL}/checkout/failure`,
      pending: `${process.env.FRONTEND_URL}/checkout/pending`,
    },
    auto_return: 'approved',
    statement_descriptor: 'MUNTANER336',
    external_reference: `order_${Date.now()}`,
  };

  const result = await preference.create({ body: preferenceData });
  return result;
}

// ============================================
// NEWSLETTER (BREVO)
// ============================================

async function subscribeToNewsletter(email, source = 'website') {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log('📧 Brevo not configured, logging signup:', email);
    return { success: true, message: 'Email logged (Brevo not configured)' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email: email,
        listIds: [parseInt(process.env.BREVO_LIST_ID) || 2],
        attributes: {
          SOURCE: source,
          SIGNUP_DATE: new Date().toISOString(),
        },
        updateEnabled: true,
      }),
    });

    if (response.ok || response.status === 201) {
      console.log('✅ Email subscribed:', email);
      return { success: true, message: 'Successfully subscribed' };
    } else {
      const error = await response.json();
      if (error.code === 'duplicate_parameter') {
        return { success: true, message: 'Already subscribed' };
      }
      throw new Error(error.message || 'Brevo API error');
    }
  } catch (error) {
    console.error('❌ Newsletter error:', error.message);
    return { success: false, message: error.message };
  }
}

// ============================================
// API ROUTES
// ============================================

app.get('/', (req, res) => {
  res.json({
    name: 'Muntaner336 API',
    version: '1.0.0',
    status: 'running',
    inventory: {
      count: inventoryCache.data.length,
      lastUpdated: inventoryCache.lastUpdated,
    },
  });
});

app.get('/api/inventory', (req, res) => {
  const { genre, condition, minPrice, maxPrice, sort } = req.query;

  let products = [...inventoryCache.data];

  if (genre && genre !== 'all') {
    products = products.filter(
      (p) =>
        p.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase())) ||
        p.styles.some((s) => s.toLowerCase().includes(genre.toLowerCase()))
    );
  }

  if (condition) {
    products = products.filter((p) => p.condition === condition);
  }

  if (minPrice) {
    products = products.filter((p) => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    products = products.filter((p) => p.price <= parseFloat(maxPrice));
  }

  if (sort === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    products.sort((a, b) => b.id - a.id);
  }

  res.json({
    success: true,
    count: products.length,
    lastUpdated: inventoryCache.lastUpdated,
    products: products,
  });
});

app.get('/api/inventory/specials', (req, res) => {
  const specials = inventoryCache.data.filter((p) => p.isSpecial);
  res.json({ success: true, count: specials.length, products: specials });
});

app.get('/api/product/:id', (req, res) => {
  const product = inventoryCache.data.find((p) => p.id == req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, product: product });
});

app.post('/api/inventory/sync', async (req, res) => {
  await syncInventory();
  res.json({
    success: true,
    message: 'Sync completed',
    count: inventoryCache.data.length,
    lastUpdated: inventoryCache.lastUpdated,
  });
});

app.post('/api/checkout', async (req, res) => {
  try {
    const { items, customer, shipping } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    if (!customer || !customer.email) {
      return res.status(400).json({ error: 'Customer information required' });
    }

    const preference = await createPaymentPreference(items, customer, shipping);

    res.json({
      success: true,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webhook/mercadopago', async (req, res) => {
  console.log('📩 Mercado Pago webhook:', req.body);
  const { type, data } = req.body;
  if (type === 'payment') {
    console.log('Payment received:', data.id);
  }
  res.sendStatus(200);
});

app.post('/api/newsletter', async (req, res) => {
  const { email, source } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const result = await subscribeToNewsletter(email, source || 'website');

  if (result.success) {
    res.json({ success: true, message: result.message });
  } else {
    res.status(500).json({ success: false, error: result.message });
  }
});

app.post('/api/contact', (req, res) => {
  const { name, email, message, items } = req.body;
  console.log('📞 Contact request:', { name, email, message, items });

  const whatsappNumber = process.env.WHATSAPP_NUMBER || '521XXXXXXXXXX';
  const whatsappMessage = encodeURIComponent(
    `Hola! Soy ${name}.\n\n${message}\n\n${items ? `Productos: ${items.join(', ')}` : ''}`
  );

  res.json({
    success: true,
    whatsappUrl: `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`,
  });
});

// ============================================
// CRON JOBS
// ============================================

cron.schedule('0 * * * *', () => {
  console.log('⏰ Running scheduled inventory sync...');
  syncInventory();
});

// ============================================
// START SERVER
// ============================================

syncInventory().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║     🎵 MUNTANER336 Backend Server 🎵       ║
╠════════════════════════════════════════════╣
║  Port: ${PORT}                                 ║
║  Discogs User: ${DISCOGS_CONFIG.username.padEnd(24)}║
║  Products: ${String(inventoryCache.data.length).padEnd(29)}║
╚════════════════════════════════════════════╝
        `);
  });
});

module.exports = app;
