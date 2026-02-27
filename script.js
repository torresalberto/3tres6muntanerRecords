/* ========================================
   MUNTANER336 - Complete JavaScript v3
   Discogs API, Cart, Checkout, Audio Preview
   ======================================== */

// YouTube IFrame API global callback — must be defined BEFORE DOMContentLoaded
// because the YT API script (loaded in <head>) may fire this before DOM is ready.
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube IFrame API ready (global)');
    window._ytApiReady = true;
    if (window._ytPlayerPendingInit) {
        window._ytPlayerPendingInit();
        window._ytPlayerPendingInit = null;
    }
};

document.addEventListener('DOMContentLoaded', function() {

    // ========================================
    // Configuration
    // ========================================
    
    const CONFIG = {
        // Discogs API Credentials (REAL)
        discogs: {
            consumerKey: 'sBEuWoUkdolwupCMeLjk',
            consumerSecret: 'OmvmhuqzJAPBwxYadiczZMsHaLQJoAsw',
            username: '3tres6records',
            baseUrl: 'https://api.discogs.com'
        },
        
        // YouTube video for background music (main radio)
        youtubeVideoId: 'qfF19hUzLo0',
        
        // Mercado Pago Public Key
        mercadoPagoPublicKey: 'YOUR_MERCADO_PAGO_PUBLIC_KEY',
        
        // Stripe Public Key
        stripePublicKey: 'YOUR_STRIPE_PUBLIC_KEY',
        
        // WhatsApp number (with country code)
        whatsappNumber: '5255879475564',
        
        // Exit Intent
        exitIntent: {
            sensitivity: 20,
            delay: 5000,
            cookieDays: 7,
            cookieName: 'muntaner336_exit_shown',
            discountCode: 'BIENVENIDO10'
        }
    };

    // ========================================
    // State Management
    // ========================================
    
    let state = {
        cart: JSON.parse(localStorage.getItem('muntaner336_cart')) || [],
        products: [],
        isPlaying: false,
        currentTrack: null,
        playlist: [],
        playlistIndex: 0,
        playlistMode: 'radio' // 'radio' = default track, 'vinyl' = inventory tracks
    };

    // ========================================
    // GA4 Custom Event Tracking (Complete User Journey)
    // ========================================
    
    function trackEvent(eventName, params = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }
        console.log('GA4 Track:', eventName, params);
    }

    // Scroll Depth Tracking
    const scrollDepthTracked = { 25: false, 50: false, 75: false, 90: false };
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        [25, 50, 75, 90].forEach(threshold => {
            if (scrollPercent >= threshold && !scrollDepthTracked[threshold]) {
                scrollDepthTracked[threshold] = true;
                trackEvent('scroll_depth', { percent: threshold });
            }
        });
    });

    // Discogs Link Tracking
    document.querySelectorAll('a[href*="discogs.com"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('discogs_navigation', {
                destination: link.href,
                link_text: link.textContent.trim()
            });
        });
    });

    // Section View Tracking (Intersection Observer)
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                trackEvent('section_view', {
                    section_id: entry.target.id || entry.target.className,
                    section_name: entry.target.querySelector('h2')?.textContent || 'unknown'
                });
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.section, .hero').forEach(section => {
        sectionObserver.observe(section);
    });

    // WhatsApp Click Tracking
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('whatsapp_click', { source: link.closest('section')?.id || 'unknown' });
        });
    });

    // Instagram Click Tracking
    document.querySelectorAll('a[href*="instagram.com"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('instagram_click', { link_location: link.closest('section')?.id || 'unknown' });
        });
    });

    // Cart Abandonment Tracking
    let cartAbandonmentTimeout;
    function trackCartAbandonment() {
        if (state.cart.length > 0) {
            trackEvent('cart_abandonment', {
                items_count: state.cart.length,
                cart_value: state.cart.reduce((sum, item) => sum + item.price, 0),
                items: state.cart.map(i => i.title).join(', ')
            });
        }
    }

    // Track when user leaves with items in cart
    window.addEventListener('beforeunload', () => {
        if (state.cart.length > 0) {
            trackEvent('potential_cart_abandonment', {
                items_count: state.cart.length,
                cart_value: state.cart.reduce((sum, item) => sum + item.price, 0)
            });
        }
    });

    // Track if user is inactive for 3 minutes with items in cart
    document.addEventListener('mousemove', () => {
        clearTimeout(cartAbandonmentTimeout);
        if (state.cart.length > 0) {
            cartAbandonmentTimeout = setTimeout(trackCartAbandonment, 180000); // 3 minutes
        }
    });

    // ========================================
    // Discogs API Integration
    // ========================================
    
    const DiscogsAPI = {
        async getInventory() {
            const loadingEl = document.getElementById('loadingProducts');
            const gridEl = document.getElementById('productGrid');
            
            try {
                // Check cache first (1 hour)
                const cached = localStorage.getItem('discogs_inventory');
                const cacheTime = localStorage.getItem('discogs_inventory_time');
                
                if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 3600000) {
                    const data = JSON.parse(cached);
                    this.renderProducts(data);
                    // Populate hero playlist with cached data
                    HeroPlaylist.populateFromInventory(data);
                    return data;
                }
                
                // Fetch from Discogs
                const url = `${CONFIG.discogs.baseUrl}/users/${CONFIG.discogs.username}/inventory`;
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Discogs key=${CONFIG.discogs.consumerKey}, secret=${CONFIG.discogs.consumerSecret}`,
                        'User-Agent': 'Muntaner336WebStore/1.0'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch inventory');
                }
                
                const data = await response.json();
                
                // Debug log to see actual API response structure
                console.log('Discogs API Response:', data);
                if (data.listings && data.listings[0]) {
                    console.log('First listing structure:', data.listings[0]);
                    console.log('Release structure:', data.listings[0].release);
                }
                
                // Cache the result
                localStorage.setItem('discogs_inventory', JSON.stringify(data.listings));
                localStorage.setItem('discogs_inventory_time', Date.now().toString());
                
                state.products = data.listings;
                this.renderProducts(data.listings);
                
                // Populate hero playlist with inventory
                HeroPlaylist.populateFromInventory(data.listings);
                
                return data.listings;
                
            } catch (error) {
                console.error('Discogs API Error:', error);
                // Load fallback sample data
                this.loadFallbackProducts();
            }
        },
        
        renderProducts(listings) {
            const gridEl = document.getElementById('productGrid');
            if (!gridEl) return;
            
            gridEl.innerHTML = listings.map((listing, index) => {
                const release = listing.release || {};
                const genres = release.genres || ['Electronic'];
                const genre = genres[0]?.toLowerCase() || 'electronic';
                const images = release.images || [];
                const imageUrl = images[0]?.uri || release.thumbnail || this.getPlaceholderImage();
                const condition = listing.condition || 'VG+';
                const price = listing.price?.value || 500;
                const currency = listing.price?.currency || 'MXN';
                
                // Extract artist - Discogs uses release.artist (string) in inventory API
                let artistName = 'Artista';
                if (release.artist) {
                    artistName = release.artist;
                } else if (release.artists && release.artists[0]) {
                    artistName = release.artists[0].name;
                } else if (release.description) {
                    const parts = release.description.split(' - ');
                    if (parts.length >= 2) artistName = parts[0].trim();
                }
                
                const title = release.title || 'Sin título';
                const labels = release.labels || [{ name: release.label || '' }];
                const year = release.year || '';
                const audioUrl = listing.audio_url || release.videos?.[0]?.uri || '';
                
                return `
                    <article class="product-card" data-genre="${genre}" data-product-id="${listing.id}">
                        <div class="product-image">
                            <img src="${imageUrl}" 
                                 alt="${artistName} – ${title}"
                                 loading="lazy"
                                 onerror="this.src='${this.getPlaceholderImage()}'">
                            <div class="product-badges">
                                <span class="badge condition">${condition}</span>
                                <span class="badge origin">BCN</span>
                            </div>
                            <div class="product-overlay">
                                <button class="quick-view-btn" 
                                        data-product="${listing.id}"
                                        data-title="${artistName} – ${title}"
                                        data-genre="${genres[0] || 'Electronic'}"
                                        data-label="${labels[0]?.name || ''} · ${year}"
                                        data-price="${price}"
                                        data-condition="${condition}"
                                        data-image="${imageUrl}"
                                        data-audio="${audioUrl}"
                                        data-discogs="${listing.uri || ''}">
                                    Vista Rápida
                                </button>
                            </div>
                        </div>
                        <div class="product-info">
                            <span class="product-genre">${genres[0] || 'Electronic'}</span>
                            <h3 class="product-title">${artistName} – ${title}</h3>
                            <p class="product-label">${labels[0]?.name || ''} · ${year}</p>
                            <div class="product-footer">
                                <span class="product-price">${price} ${currency}</span>
                                <button class="buy-btn" 
                                        data-id="${listing.id}"
                                        data-title="${artistName} – ${title}"
                                        data-price="${price}"
                                        data-image="${imageUrl}">
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');
            
            // Re-attach event listeners
            this.attachProductListeners();
        },
        
        loadFallbackProducts() {
            const fallbackProducts = [
                { id: 1, title: 'Atmosphere EP', artist: 'Kerri Chandler', label: 'Madhouse Records', year: 1996, genre: 'Deep House', price: 550, condition: 'VG+', audio: 'https://www.youtube.com/watch?v=JvVw1XFBL7c' },
                { id: 2, title: 'Minimal Nation', artist: 'Robert Hood', label: 'M-Plant', year: 1994, genre: 'Techno', price: 850, condition: 'M', audio: 'https://www.youtube.com/watch?v=DwjfXA5SC8w' },
                { id: 3, title: 'Falling Up', artist: 'Theo Parrish', label: 'Sound Signature', year: 2001, genre: 'House', price: 720, condition: 'VG+', audio: 'https://www.youtube.com/watch?v=6TJR6szPHxk' },
                { id: 4, title: 'Alcachofa', artist: 'Ricardo Villalobos', label: 'Playhouse', year: 2003, genre: 'Minimal', price: 680, condition: 'VG', audio: 'https://www.youtube.com/watch?v=JaU4V0rQF_Y' },
                { id: 5, title: 'I Feel Love', artist: 'Donna Summer', label: 'Casablanca', year: 1977, genre: 'Disco', price: 480, condition: 'VG+', audio: 'https://www.youtube.com/watch?v=Nm-ISatLDG0' },
                { id: 6, title: "Neptune's Lair", artist: 'Drexciya', label: 'Tresor', year: 1999, genre: 'Electro', price: 1200, condition: 'M', audio: 'https://www.youtube.com/watch?v=cZ2RYr_E8SE' },
                { id: 7, title: 'Missing You', artist: 'Larry Heard', label: 'Alleviated Records', year: 1991, genre: 'Deep House', price: 950, condition: 'VG+', audio: 'https://www.youtube.com/watch?v=wKpmFSfA59c' },
                { id: 8, title: 'The Bells', artist: 'Jeff Mills', label: 'Tresor', year: 1992, genre: 'Techno', price: 780, condition: 'VG', audio: 'https://www.youtube.com/watch?v=DwFs1PNz0fc' }
            ];
            
            const gridEl = document.getElementById('productGrid');
            if (!gridEl) return;
            
            gridEl.innerHTML = fallbackProducts.map(product => `
                <article class="product-card" data-genre="${product.genre.toLowerCase()}" data-product-id="${product.id}">
                    <div class="product-image">
                        <img src="${this.getPlaceholderImage()}" alt="${product.artist} – ${product.title}" loading="lazy">
                        <div class="product-badges">
                            <span class="badge condition">${product.condition}</span>
                            <span class="badge origin">BCN</span>
                        </div>
                        <div class="product-overlay">
                            <button class="quick-view-btn"
                                    data-product="${product.id}"
                                    data-title="${product.artist} – ${product.title}"
                                    data-genre="${product.genre}"
                                    data-label="${product.label} · ${product.year}"
                                    data-price="${product.price}"
                                    data-condition="${product.condition}"
                                    data-image="${this.getPlaceholderImage()}"
                                    data-audio="${product.audio}">
                                Vista Rápida
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <span class="product-genre">${product.genre}</span>
                        <h3 class="product-title">${product.artist} – ${product.title}</h3>
                        <p class="product-label">${product.label} · ${product.year}</p>
                        <div class="product-footer">
                            <span class="product-price">$${product.price} MXN</span>
                            <button class="buy-btn" data-id="${product.id}" data-title="${product.artist} – ${product.title}" data-price="${product.price}">
                                Agregar
                            </button>
                        </div>
                    </div>
                </article>
            `).join('');
            
            this.attachProductListeners();
            
            // Populate hero playlist with fallback data
            const playlistData = fallbackProducts.map((p, i) => ({
                release: {
                    artist: p.artist,
                    artists: [{ name: p.artist }],
                    title: p.title,
                    videos: p.audio ? [{ uri: p.audio }] : [],
                    thumbnail: DiscogsAPI.getPlaceholderImage()
                },
                id: p.id
            }));
            HeroPlaylist.populateFromInventory(playlistData);
        },
        
        getPlaceholderImage() {
            return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect fill='%23111' width='300' height='300'/%3E%3Ctext fill='%23444' x='150' y='150' text-anchor='middle' font-size='50'%3E🎵%3C/text%3E%3C/svg%3E";
        },
        
        attachProductListeners() {
            // Buy buttons
            document.querySelectorAll('.buy-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    Cart.addItem({
                        id: this.dataset.id,
                        title: this.dataset.title,
                        price: parseFloat(this.dataset.price),
                        image: this.dataset.image || DiscogsAPI.getPlaceholderImage()
                    });
                });
            });
            
            // Quick view buttons
            document.querySelectorAll('.quick-view-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    QuickView.open({
                        id: this.dataset.product,
                        title: this.dataset.title,
                        genre: this.dataset.genre,
                        label: this.dataset.label,
                        price: this.dataset.price,
                        condition: this.dataset.condition,
                        image: this.dataset.image,
                        audio: this.dataset.audio,
                        discogs: this.dataset.discogs
                    });
                });
            });
        }
    };

    // ========================================
    // Shopping Cart
    // ========================================
    
    const Cart = {
        init() {
            this.updateCount();
            this.render();
            
            // Event listeners
            document.getElementById('cartIcon')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
            
            document.getElementById('cartClose')?.addEventListener('click', () => this.close());
            document.getElementById('cartOverlay')?.addEventListener('click', () => this.close());
            
            document.getElementById('checkoutBtn')?.addEventListener('click', () => {
                this.close();
                Checkout.open();
            });
            
            // Add to cart buttons (specials)
            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    Cart.addItem({
                        id: this.dataset.id,
                        title: this.dataset.title,
                        price: parseFloat(this.dataset.price),
                        image: ''
                    });
                });
            });
        },
        
        addItem(item) {
            // Check if already in cart
            const existing = state.cart.find(i => i.id === item.id);
            if (existing) {
                this.showNotification('Este vinilo ya está en tu carrito');
                return;
            }
            
            state.cart.push(item);
            this.save();
            this.updateCount();
            this.render();
            this.showNotification('¡Agregado al carrito!');
            
            trackEvent('add_to_cart', {
                currency: 'MXN',
                value: item.price,
                items: [{ item_id: item.id, item_name: item.title, price: item.price }]
            });
        },
        
        removeItem(id) {
            state.cart = state.cart.filter(item => item.id !== id);
            this.save();
            this.updateCount();
            this.render();
        },
        
        save() {
            localStorage.setItem('muntaner336_cart', JSON.stringify(state.cart));
        },
        
        updateCount() {
            const countEl = document.getElementById('cartCount');
            if (countEl) {
                countEl.textContent = state.cart.length;
                countEl.style.display = state.cart.length > 0 ? 'flex' : 'none';
            }
        },
        
        getTotal() {
            return state.cart.reduce((sum, item) => sum + item.price, 0);
        },
        
        render() {
            const itemsEl = document.getElementById('cartItems');
            const totalEl = document.getElementById('cartTotal');
            
            if (!itemsEl) return;
            
            if (state.cart.length === 0) {
                itemsEl.innerHTML = '<div class="cart-empty">Tu carrito está vacío</div>';
            } else {
                itemsEl.innerHTML = state.cart.map(item => `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-image">
                            <img src="${item.image || DiscogsAPI.getPlaceholderImage()}" alt="">
                        </div>
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-price">$${item.price} MXN</div>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}">×</button>
                    </div>
                `).join('');
                
                // Attach remove listeners
                itemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
                    btn.addEventListener('click', () => this.removeItem(btn.dataset.id));
                });
            }
            
            if (totalEl) {
                totalEl.textContent = `$${this.getTotal()} MXN`;
            }
        },
        
        toggle() {
            const sidebar = document.getElementById('cartSidebar');
            const overlay = document.getElementById('cartOverlay');
            
            sidebar?.classList.toggle('active');
            overlay?.classList.toggle('active');
            document.body.classList.toggle('cart-open');
        },
        
        open() {
            document.getElementById('cartSidebar')?.classList.add('active');
            document.getElementById('cartOverlay')?.classList.add('active');
            document.body.classList.add('cart-open');
        },
        
        close() {
            document.getElementById('cartSidebar')?.classList.remove('active');
            document.getElementById('cartOverlay')?.classList.remove('active');
            document.body.classList.remove('cart-open');
        },
        
        showNotification(message) {
            // Create toast notification
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                right: 30px;
                background: var(--color-accent, #ff4d00);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                z-index: 9999;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }
    };

    // ========================================
    // Checkout Flow (Shopify-style)
    // ========================================
    
    const Checkout = {
        currentStep: 1,
        customerData: {},
        shippingCost: 99,
        
        init() {
            // Close button
            document.getElementById('checkoutClose')?.addEventListener('click', () => this.close());
            
            // Step 1: Info form
            document.getElementById('checkoutInfoForm')?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.customerData.email = document.getElementById('checkoutEmail').value;
                this.customerData.firstName = document.getElementById('firstName').value;
                this.customerData.lastName = document.getElementById('lastName').value;
                this.customerData.phone = document.getElementById('phone').value;
                this.goToStep(2);
            });
            
            // Step 2: Shipping form
            document.getElementById('checkoutShippingForm')?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.customerData.address = document.getElementById('address').value;
                this.customerData.apartment = document.getElementById('apartment').value;
                this.customerData.city = document.getElementById('city').value;
                this.customerData.state = document.getElementById('state').value;
                this.customerData.zip = document.getElementById('zip').value;
                
                const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
                this.shippingCost = shippingMethod === 'express' ? 199 : shippingMethod === 'pickup' ? 0 : 99;
                
                this.goToStep(3);
                this.renderOrderSummary();
            });
            
            // Back buttons
            document.querySelectorAll('.checkout-back-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.goToStep(parseInt(btn.dataset.back));
                });
            });
            
            // Payment buttons
            document.getElementById('payWithMP')?.addEventListener('click', () => this.payWithMercadoPago());
            document.getElementById('payWithStripe')?.addEventListener('click', () => this.payWithStripe());
            document.getElementById('payWithPayPal')?.addEventListener('click', () => this.payWithPayPal());
            document.getElementById('payWithTransfer')?.addEventListener('click', () => this.payWithTransfer());
        },
        
        open() {
            if (state.cart.length === 0) {
                Cart.showNotification('Tu carrito está vacío');
                return;
            }
            
            document.getElementById('checkoutModal')?.classList.add('active');
            document.body.classList.add('checkout-open');
            this.goToStep(1);
            
            trackEvent('begin_checkout', {
                currency: 'MXN',
                value: Cart.getTotal(),
                items: state.cart.map(i => ({ item_id: i.id, item_name: i.title, price: i.price }))
            });
        },
        
        close() {
            document.getElementById('checkoutModal')?.classList.remove('active');
            document.body.classList.remove('checkout-open');
        },
        
        goToStep(step) {
            this.currentStep = step;
            
            // Update step indicators
            document.querySelectorAll('.checkout-steps .step').forEach(el => {
                const stepNum = parseInt(el.dataset.step);
                el.classList.remove('active', 'completed');
                if (stepNum === step) el.classList.add('active');
                if (stepNum < step) el.classList.add('completed');
            });
            
            // Show correct content
            document.querySelectorAll('.checkout-step-content').forEach(el => {
                el.classList.remove('active');
            });
            document.getElementById(`step${step}`)?.classList.add('active');
        },
        
        renderOrderSummary() {
            const itemsEl = document.getElementById('orderSummaryItems');
            const subtotalEl = document.getElementById('summarySubtotal');
            const shippingEl = document.getElementById('summaryShipping');
            const totalEl = document.getElementById('summaryTotal');
            
            if (itemsEl) {
                itemsEl.innerHTML = state.cart.map(item => `
                    <div class="summary-line">
                        <span>${item.title}</span>
                        <span>$${item.price} MXN</span>
                    </div>
                `).join('');
            }
            
            const subtotal = Cart.getTotal();
            if (subtotalEl) subtotalEl.textContent = `$${subtotal} MXN`;
            if (shippingEl) shippingEl.textContent = `$${this.shippingCost} MXN`;
            if (totalEl) totalEl.textContent = `$${subtotal + this.shippingCost} MXN`;
        },
        
        async payWithMercadoPago() {
            const total = Cart.getTotal() + this.shippingCost;
            
            trackEvent('payment_method_selected', { method: 'mercado_pago', value: total });
            
            // In production, call your backend to create a preference
            // For now, show instructions
            alert(`Mercado Pago Integration:\n\n1. Total: $${total} MXN\n2. Your backend needs to create a payment preference\n3. User will be redirected to Mercado Pago\n\nItems: ${state.cart.map(i => i.title).join(', ')}`);
            
            // Example production code:
            /*
            const response = await fetch('/api/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: state.cart,
                    shipping: this.shippingCost,
                    customer: this.customerData
                })
            });
            const { preferenceId } = await response.json();
            const mp = new MercadoPago(CONFIG.mercadoPagoPublicKey);
            mp.checkout({ preference: { id: preferenceId } });
            */
        },
        
        payWithPayPal() {
            const total = Cart.getTotal() + this.shippingCost;
            trackEvent('payment_method_selected', { method: 'paypal', value: total });
            alert(`PayPal Integration:\n\nTotal: $${total} MXN\n\nImplement PayPal Checkout SDK here.`);
        },
        
        payWithTransfer() {
            const total = Cart.getTotal() + this.shippingCost;
            const items = state.cart.map(i => i.title).join(', ');
            const message = encodeURIComponent(
                `Hola! Quiero comprar:\n${items}\n\nTotal: $${total} MXN\n\nNombre: ${this.customerData.firstName} ${this.customerData.lastName}\nEmail: ${this.customerData.email}\nDirección: ${this.customerData.address}, ${this.customerData.city}, ${this.customerData.state} ${this.customerData.zip}`
            );
            
            trackEvent('payment_method_selected', { method: 'transfer', value: total });
            
            window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${message}`, '_blank');
            this.close();
        },
        
        async payWithStripe() {
            const total = Cart.getTotal() + this.shippingCost;
            
            trackEvent('payment_method_selected', { method: 'stripe', value: total });
            
            // Check if Stripe is loaded
            if (typeof Stripe === 'undefined') {
                Cart.showNotification('Stripe no está disponible. Intenta otro método de pago.');
                return;
            }
            
            // In production, call backend to create a PaymentIntent
            // For now, show instructions
            Cart.showNotification('Stripe: Configura tu clave pública en CONFIG.stripePublicKey');
            
            /* Production implementation:
            try {
                const stripe = Stripe(CONFIG.stripePublicKey);
                
                const response = await fetch('/api/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: total * 100, // Stripe uses cents
                        currency: 'mxn',
                        items: state.cart,
                        customer: this.customerData
                    })
                });
                
                const { clientSecret } = await response.json();
                
                const result = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: `${this.customerData.firstName} ${this.customerData.lastName}`,
                            email: this.customerData.email
                        }
                    }
                });
                
                if (result.error) {
                    Cart.showNotification('Error: ' + result.error.message);
                } else {
                    Cart.showNotification('¡Pago exitoso! 🎉');
                    state.cart = [];
                    Cart.save();
                    Cart.updateCount();
                    this.close();
                }
            } catch (error) {
                console.error('Stripe error:', error);
                Cart.showNotification('Error al procesar el pago');
            }
            */
        }
    };

    // ========================================
    // Quick View Modal with Audio Preview (Improved)
    // ========================================
    
    const QuickView = {
        init() {
            document.getElementById('closeQuickView')?.addEventListener('click', () => this.close());
            document.getElementById('quickViewModal')?.addEventListener('click', (e) => {
                if (e.target.id === 'quickViewModal') this.close();
            });
            
            document.getElementById('quickViewAddToCart')?.addEventListener('click', () => {
                Cart.addItem(this.currentProduct);
                this.close();
            });
        },
        
        currentProduct: null,
        
        open(product) {
            this.currentProduct = {
                id: product.id,
                title: product.title,
                price: parseFloat(product.price),
                image: product.image
            };
            
            document.getElementById('quickViewTitle').textContent = product.title;
            document.getElementById('quickViewGenre').textContent = product.genre;
            document.getElementById('quickViewLabel').textContent = product.label;
            document.getElementById('quickViewPrice').textContent = `$${product.price} MXN`;
            document.getElementById('quickViewCondition').textContent = product.condition;
            document.getElementById('quickViewSleeveCondition').textContent = product.condition;
            document.getElementById('quickViewImage').src = product.image || DiscogsAPI.getPlaceholderImage();
            
            // Show loading state immediately, then resolve audio
            this._showAudioLoading();
            this._resolveAndRenderAudio(product);
            
            document.getElementById('quickViewModal')?.classList.add('active');
            
            trackEvent('view_item_details', {
                item_id: product.id,
                item_name: product.title,
                price: parseFloat(product.price)
            });
        },
        
        close() {
            document.getElementById('quickViewModal')?.classList.remove('active');
            const embedEl = document.getElementById('audioEmbed');
            if (embedEl) embedEl.innerHTML = '';
        },
        
        _showAudioLoading() {
            const embedEl = document.getElementById('audioEmbed');
            if (!embedEl) return;
            embedEl.innerHTML = `
                <div class="audio-preview-loading">
                    <div class="vinyl-spin-preview">🎵</div>
                    <p>Buscando preview...</p>
                </div>
            `;
        },
        
        async _resolveAndRenderAudio(product) {
            const embedEl = document.getElementById('audioEmbed');
            if (!embedEl) return;
            
            // Build a track object for TrackResolver
            const track = {
                audioUrl: product.audio || '',
                artist: product.title ? product.title.split(' – ')[0] : '',
                trackTitle: product.title ? (product.title.split(' – ')[1] || product.title) : product.title,
                productId: product.id,
                releaseId: product.releaseId || null
            };
            
            try {
                // Tier 1: Try direct URL first (fast path)
                if (product.audio) {
                    const rendered = this._tryRenderDirectUrl(product.audio, embedEl);
                    if (rendered) return;
                }
                
                // Tier 2: Use TrackResolver (may call Discogs Release API)
                const resolved = await TrackResolver.resolve(track);
                
                if (resolved.type === 'youtube') {
                    embedEl.innerHTML = `
                        <div class="audio-preview-embed">
                            <iframe
                                src="https://www.youtube.com/embed/${resolved.id}?autoplay=0&modestbranding=1&rel=0&playsinline=1"
                                width="100%"
                                height="180"
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                frameborder="0"
                                loading="lazy">
                            </iframe>
                        </div>
                    `;
                } else {
                    // No preview available — graceful state
                    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(resolved.searchQuery)}`;
                    embedEl.innerHTML = `
                        <div class="no-preview-state">
                            <div class="no-preview-icon">🎧</div>
                            <p class="no-preview-text">Preview no disponible</p>
                            <a href="${searchUrl}" target="_blank" rel="noopener" class="search-youtube-btn">
                                🔍 Buscar en YouTube
                            </a>
                        </div>
                    `;
                }
            } catch (err) {
                console.error('QuickView audio resolution error:', err);
                embedEl.innerHTML = `<div class="no-preview-state"><p class="no-preview-text">No se pudo cargar el preview</p></div>`;
            }
        },
        
        _tryRenderDirectUrl(audioUrl, embedEl) {
            if (!audioUrl) return false;
            
            // YouTube
            if (audioUrl.includes('youtube.com') || audioUrl.includes('youtu.be')) {
                const videoId = TrackResolver.extractYouTubeId(audioUrl);
                if (videoId) {
                    embedEl.innerHTML = `
                        <div class="audio-preview-embed">
                            <iframe
                                src="https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&playsinline=1"
                                width="100%"
                                height="180"
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                frameborder="0"
                                loading="lazy">
                            </iframe>
                        </div>
                    `;
                    return true;
                }
            }
            
            // SoundCloud
            if (audioUrl.includes('soundcloud.com')) {
                embedEl.innerHTML = `
                    <div class="audio-preview-embed">
                        <iframe
                            src="https://w.soundcloud.com/player/?url=${encodeURIComponent(audioUrl)}&color=%23ff4d00&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"
                            width="100%" height="120"
                            scrolling="no" frameborder="no" allow="autoplay">
                        </iframe>
                    </div>
                `;
                return true;
            }
            
            // Spotify
            if (audioUrl.includes('spotify.com')) {
                const spotifyId = audioUrl.split('/').pop().split('?')[0];
                embedEl.innerHTML = `
                    <div class="audio-preview-embed">
                        <iframe
                            src="https://open.spotify.com/embed/track/${spotifyId}"
                            width="100%" height="80"
                            allow="encrypted-media">
                        </iframe>
                    </div>
                `;
                return true;
            }
            
            // Direct audio file
            if (audioUrl.match(/\.(mp3|wav|ogg)$/i)) {
                embedEl.innerHTML = `
                    <audio controls style="width:100%;margin-top:8px;">
                        <source src="${audioUrl}" type="audio/mpeg">
                        Tu navegador no soporta audio.
                    </audio>
                `;
                return true;
            }
            
            return false;
        }
    };

    // ========================================
    // Background Audio - YouTube IFrame API (Reliable Mute/Unmute)
    // ========================================
    
    const AudioPlayer = {
        isPlaying: false,
        isMuted: true,  // Start muted (autoplay policy)
        currentVideoId: null,
        currentTitle: '3TRES6 Radio',
        ytPlayer: null,         // YT.Player instance (official API)
        ytPlayerReady: false,   // True once onReady fires
        pendingVideoId: null,   // Video to play once player is ready
        pendingTitle: null,
        userHasInteracted: false,
        
        init() {
            const audioToggle = document.getElementById('audioToggle');
            
            // TOGGLE BUTTON - mutes/unmutes using official YT API
            audioToggle?.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the document click handler
                if (this.isMuted) {
                    this.unmute();
                } else {
                    this.mute();
                }
            });
            
            // Show "Click to play" overlay — user must explicitly start audio
            this._showClickToPlay();
            
            // On first user interaction (not on the toggle button), start the radio
            // Store handler reference so it can be removed from startMusic() too
            this._unmuteHandler = (e) => {
                // Don't trigger if clicking the audio toggle or controls themselves
                const target = e.target;
                if (target && typeof target.closest === 'function') {
                    if (target.closest('#audioToggle') || target.closest('#audioControls')) return;
                }
                
                if (!this.userHasInteracted) {
                    this.userHasInteracted = true;
                    this._removeUnmuteListeners();
                    this._hideClickToPlay();
                    // Initialize the YT player now that we have user interaction
                    this._initYTPlayer(CONFIG.youtubeVideoId, '3TRES6 Radio', false);
                }
            };
            document.addEventListener('click', this._unmuteHandler);
            document.addEventListener('keydown', this._unmuteHandler);
            document.addEventListener('touchstart', this._unmuteHandler, { passive: true });
        },
        
        _removeUnmuteListeners() {
            if (this._unmuteHandler) {
                document.removeEventListener('click', this._unmuteHandler);
                document.removeEventListener('keydown', this._unmuteHandler);
                document.removeEventListener('touchstart', this._unmuteHandler);
                this._unmuteHandler = null;
            }
        },
        
        _showClickToPlay() {
            const youtubeContainer = document.getElementById('youtubeAudioContainer');
            if (!youtubeContainer) return;
            youtubeContainer.style.display = '';
            youtubeContainer.innerHTML = `
                <div class="mini-player-inner mini-player-click-to-play" id="clickToPlayOverlay">
                    <div class="mini-player-info">
                        <span class="mini-player-now-playing">🎵 3TRES6 RADIO</span>
                        <span class="mini-player-title">Haz clic en cualquier lugar para escuchar</span>
                    </div>
                    <div class="click-to-play-body">
                        <div class="vinyl-spin-icon">🎵</div>
                        <p>Música de fondo</p>
                    </div>
                </div>
            `;
            this.updateUI(false, '3TRES6 Radio', true);
        },
        
        _hideClickToPlay() {
            const overlay = document.getElementById('clickToPlayOverlay');
            if (overlay) overlay.closest('.mini-player-inner')?.remove();
        },
        
        _initYTPlayer(videoId, title, startMuted) {
            const youtubeContainer = document.getElementById('youtubeAudioContainer');
            if (!youtubeContainer) return;
            
            youtubeContainer.style.display = '';
            this.currentVideoId = videoId || CONFIG.youtubeVideoId;
            this.currentTitle = title || '3TRES6 Radio';
            this.isMuted = startMuted !== false ? false : false; // default unmuted after interaction
            
            // Create a div for YT.Player to attach to
            youtubeContainer.innerHTML = `
                <div class="mini-player-inner" id="miniPlayerInner">
                    <div class="mini-player-info">
                        <span class="mini-player-now-playing">▶ Now Playing</span>
                        <span class="mini-player-title" id="miniPlayerTitle">${this.currentTitle}</span>
                        <div class="mini-player-actions">
                            <button class="mini-player-collapse" id="miniPlayerCollapse" title="Minimizar" aria-label="Minimizar reproductor">▼</button>
                            <button class="mini-player-close" id="miniPlayerClose" title="Cerrar reproductor" aria-label="Cerrar reproductor">×</button>
                        </div>
                    </div>
                    <div id="ytPlayerDiv" class="yt-player-div"></div>
                </div>
            `;
            
            // Attach close button handler
            document.getElementById('miniPlayerClose')?.addEventListener('click', (e) => {
                e.stopPropagation();
                youtubeContainer.style.display = 'none';
                if (this.ytPlayer) {
                    try { this.ytPlayer.pauseVideo(); } catch(err) {}
                }
                this.isPlaying = false;
                state.isPlaying = false;
            });
            
            // Collapse/expand toggle
            document.getElementById('miniPlayerCollapse')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const inner = document.getElementById('miniPlayerInner');
                const btn = document.getElementById('miniPlayerCollapse');
                if (inner) {
                    const isCollapsed = inner.classList.toggle('collapsed');
                    if (btn) btn.textContent = isCollapsed ? '▲' : '▼';
                    localStorage.setItem('3tres6_player_collapsed', isCollapsed ? '1' : '0');
                }
            });
            
            // Restore collapsed state
            if (localStorage.getItem('3tres6_player_collapsed') === '1') {
                const inner = document.getElementById('miniPlayerInner');
                const btn = document.getElementById('miniPlayerCollapse');
                if (inner) inner.classList.add('collapsed');
                if (btn) btn.textContent = '▲';
            }
            
            // Initialize YT.Player via official API
            if (window._ytApiReady && typeof YT !== 'undefined' && YT.Player) {
                this._createYTPlayer(this.currentVideoId);
            } else {
                // YT API not ready yet — queue the init
                window._ytPlayerPendingInit = () => this._createYTPlayer(this.currentVideoId);
                // The API script is already loaded in <head>, so it will call onYouTubeIframeAPIReady
                // when ready. No need to inject another script tag.
            }
            
            this.isPlaying = true;
            state.isPlaying = true;
            this.updateUI(true, this.currentTitle, false);
            trackEvent('audio_play', { source: videoId ? 'vinyl_track' : '3tres6_radio', title: this.currentTitle });
        },
        
        _createYTPlayer(videoId) {
            if (!document.getElementById('ytPlayerDiv')) return;
            
            this.ytPlayer = new YT.Player('ytPlayerDiv', {
                height: '135',
                width: '240',
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    mute: 0,
                    loop: 1,
                    playlist: videoId,
                    controls: 1,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    origin: window.location.origin || 'https://3tres6records.com'
                },
                events: {
                    onReady: (event) => {
                        this.ytPlayerReady = true;
                        event.target.setVolume(80);
                        if (this.isMuted) {
                            event.target.mute();
                        } else {
                            event.target.unMute();
                        }
                        event.target.playVideo();
                        console.log('YT Player ready, videoId:', videoId);
                    },
                    onStateChange: (event) => {
                        if (event.data === YT.PlayerState.ENDED) {
                            // Loop: restart the video
                            event.target.playVideo();
                        }
                        if (event.data === YT.PlayerState.PLAYING) {
                            this.isPlaying = true;
                            state.isPlaying = true;
                        }
                    },
                    onError: (event) => {
                        console.warn('YT Player error:', event.data, 'for videoId:', videoId);
                        // If a vinyl track fails, fall back to radio
                        if (videoId !== CONFIG.youtubeVideoId) {
                            console.log('Falling back to radio...');
                            this.startMusic(CONFIG.youtubeVideoId, '3TRES6 Radio', this.isMuted);
                        }
                    }
                }
            });
        },
        
        startMusic(videoId = null, title = null, startMuted = null) {
            const vid = videoId || CONFIG.youtubeVideoId;
            const ttl = title || '3TRES6 Radio';
            const muted = startMuted !== null ? startMuted : this.isMuted;
            
            if (!this.userHasInteracted) {
                // This call IS a user interaction (e.g. clicking a playlist track)
                // Mark as interacted, remove the document listeners, and initialize the player
                this.userHasInteracted = true;
                this._removeUnmuteListeners();
                this._hideClickToPlay();
                this._initYTPlayer(vid, ttl, muted);
                return;
            }
            
            // If YT player exists and is ready, just load the new video
            if (this.ytPlayer && this.ytPlayerReady) {
                this.currentVideoId = vid;
                this.currentTitle = ttl;
                this.isMuted = muted;
                
                try {
                    this.ytPlayer.loadVideoById(vid);
                    if (muted) {
                        this.ytPlayer.mute();
                    } else {
                        this.ytPlayer.unMute();
                    }
                    // Update title in mini-player
                    const titleEl = document.getElementById('miniPlayerTitle');
                    if (titleEl) titleEl.textContent = ttl;
                    
                    // Make sure container is visible
                    const youtubeContainer = document.getElementById('youtubeAudioContainer');
                    if (youtubeContainer) youtubeContainer.style.display = '';
                    
                    this.isPlaying = true;
                    state.isPlaying = true;
                    this.updateUI(true, ttl, muted);
                    trackEvent('audio_play', { source: videoId ? 'vinyl_track' : '3tres6_radio', title: ttl });
                } catch (err) {
                    console.error('YT player loadVideoById error:', err);
                    // Re-init the player
                    this._initYTPlayer(vid, ttl, muted);
                }
            } else {
                // Player not ready yet — init it
                this._initYTPlayer(vid, ttl, muted);
            }
        },
        
        mute() {
            this.isMuted = true;
            if (this.ytPlayer && this.ytPlayerReady) {
                try { this.ytPlayer.mute(); } catch(e) {}
            }
            // If player not started yet, just update state — don't start music on mute click
            this.updateUI(this.isPlaying, this.currentTitle, true);
            trackEvent('audio_mute', {});
        },
        
        unmute() {
            this.isMuted = false;
            if (!this.userHasInteracted) {
                // First interaction via the toggle button — start the player
                this.userHasInteracted = true;
                this._removeUnmuteListeners();
                this._hideClickToPlay();
                this._initYTPlayer(CONFIG.youtubeVideoId, '3TRES6 Radio', false);
                return;
            }
            if (this.ytPlayer && this.ytPlayerReady) {
                try {
                    this.ytPlayer.unMute();
                    this.ytPlayer.setVolume(80);
                } catch(e) {}
            }
            this.updateUI(true, this.currentTitle, false);
            trackEvent('audio_unmute', {});
        },
        
        stopMusic() {
            if (this.ytPlayer && this.ytPlayerReady) {
                try { this.ytPlayer.pauseVideo(); } catch(e) {}
            }
            
            this.isPlaying = false;
            state.isPlaying = false;
            this.updateUI(false);
            
            console.log('Music paused');
            trackEvent('audio_pause', {});
        },
        
        updateUI(playing, title = null, muted = false) {
            const audioToggle = document.getElementById('audioToggle');
            const audioControls = document.getElementById('audioControls');
            const trackInfo = document.querySelector('.track-info');
            const coverEl = document.getElementById('playlistCoverArt')?.closest('.playlist-cover');
            
            if (playing) {
                audioToggle?.classList.add('playing');
                audioControls?.classList.add('playing');
                if (!muted) {
                    coverEl?.classList.add('is-playing');
                } else {
                    coverEl?.classList.remove('is-playing');
                }
                if (trackInfo) {
                    const displayTitle = title || '3TRES6 Radio';
                    const truncated = displayTitle.length > 28 ? displayTitle.substring(0, 25) + '...' : displayTitle;
                    trackInfo.textContent = muted ? `🔇 ${truncated}` : truncated;
                }
            } else {
                audioToggle?.classList.remove('playing');
                audioControls?.classList.remove('playing');
                coverEl?.classList.remove('is-playing');
                if (trackInfo) trackInfo.textContent = '3TRES6 Radio';
            }
        }
    };
    
    // ========================================
    // TrackResolver — Multi-tier audio lookup for vinyl tracks
    // ========================================
    
    const TrackResolver = {
        // Cache resolved tracks to avoid repeated API calls
        _cache: {},
        
        extractYouTubeId(url) {
            if (!url) return null;
            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[7]?.length === 11) ? match[7] : null;
        },
        
        // Tier 1: Direct YouTube ID from existing audioUrl
        resolveFromUrl(audioUrl) {
            if (!audioUrl) return null;
            return this.extractYouTubeId(audioUrl);
        },
        
        // Tier 2: Fetch Discogs Release Detail API to get videos
        async fetchDiscogsVideos(releaseId) {
            if (!releaseId) return [];
            
            const cacheKey = `discogs_release_${releaseId}`;
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                try { return JSON.parse(cached); } catch(e) {}
            }
            
            try {
                const url = `${CONFIG.discogs.baseUrl}/releases/${releaseId}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Discogs key=${CONFIG.discogs.consumerKey}, secret=${CONFIG.discogs.consumerSecret}`,
                        'User-Agent': 'Muntaner336WebStore/1.0'
                    }
                });
                
                if (!response.ok) throw new Error(`Discogs release API error: ${response.status}`);
                
                const data = await response.json();
                const videos = data.videos || [];
                sessionStorage.setItem(cacheKey, JSON.stringify(videos));
                return videos;
            } catch (err) {
                console.warn('Discogs release fetch failed:', err);
                return [];
            }
        },
        
        // Main resolve function — returns { type: 'youtube'|'none', id, searchQuery }
        async resolve(track) {
            const cacheKey = `track_${track.productId || track.title}`;
            if (this._cache[cacheKey]) return this._cache[cacheKey];
            
            // Tier 1: Direct YouTube ID from Discogs videos field
            const directId = this.resolveFromUrl(track.audioUrl);
            if (directId) {
                const result = { type: 'youtube', id: directId };
                this._cache[cacheKey] = result;
                return result;
            }
            
            // Tier 2: Discogs Release Detail API (fetch release to get videos)
            if (track.releaseId) {
                const videos = await this.fetchDiscogsVideos(track.releaseId);
                for (const video of videos) {
                    const videoId = this.extractYouTubeId(video.uri);
                    if (videoId) {
                        const result = { type: 'youtube', id: videoId, title: video.title };
                        this._cache[cacheKey] = result;
                        return result;
                    }
                }
            }
            
            // Tier 3: No audio found — return graceful no-preview state
            const searchQuery = `${track.artist} ${track.trackTitle}`;
            const result = { type: 'none', searchQuery };
            this._cache[cacheKey] = result;
            return result;
        }
    };

    // ========================================
    // Hero Playlist - Dynamic Vinyl Audio Player (Fixed)
    // ========================================
    
    const HeroPlaylist = {
        currentIndex: -1, // -1 means playing default radio
        isPlaying: false,
        _resolving: false,
        
        init() {
            // Play/Pause button
            document.getElementById('playlistPlayBtn')?.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.pause();
                } else {
                    this.playCurrentOrFirst();
                }
            });
            
            // Previous button
            document.getElementById('playlistPrevBtn')?.addEventListener('click', () => {
                if (this.currentIndex > 0) {
                    this.playTrack(this.currentIndex - 1);
                } else if (state.playlist.length > 0) {
                    this.playTrack(state.playlist.length - 1);
                }
            });
            
            // Next button
            document.getElementById('playlistNextBtn')?.addEventListener('click', () => {
                if (this.currentIndex < state.playlist.length - 1) {
                    this.playTrack(this.currentIndex + 1);
                } else {
                    this.playTrack(0);
                }
            });
            
            // Volume slider — control YT player volume via official API
            document.getElementById('volumeSlider')?.addEventListener('input', (e) => {
                const vol = parseInt(e.target.value);
                localStorage.setItem('3tres6_volume', vol);
                if (AudioPlayer.ytPlayer && AudioPlayer.ytPlayerReady) {
                    try {
                        AudioPlayer.ytPlayer.setVolume(vol);
                        if (vol === 0) {
                            AudioPlayer.ytPlayer.mute();
                            AudioPlayer.isMuted = true;
                        } else if (AudioPlayer.isMuted) {
                            AudioPlayer.ytPlayer.unMute();
                            AudioPlayer.isMuted = false;
                        }
                        AudioPlayer.updateUI(AudioPlayer.isPlaying, AudioPlayer.currentTitle, vol === 0);
                    } catch(err) {}
                }
            });
            
            // Track click listeners (will be reattached when tracks render)
            this.attachTrackListeners();
        },
        
        // Populate playlist from inventory data
        populateFromInventory(listings) {
            const tracksContainer = document.getElementById('playlistTracks');
            if (!tracksContainer) return;
            
            console.log('Populating playlist from listings:', listings.length);
            
            // Take first 8 items for the playlist
            const playlistItems = listings.slice(0, 8).map((listing, index) => {
                const release = listing.release || {};
                
                let artistName = 'Artista';
                if (release.artist) {
                    artistName = release.artist;
                } else if (release.artists && release.artists[0]) {
                    artistName = release.artists[0].name;
                } else if (release.description) {
                    const parts = release.description.split(' - ');
                    if (parts.length >= 2) artistName = parts[0].trim();
                }
                
                const title = release.title || 'Sin título';
                const videos = release.videos || [];
                const audioUrl = videos[0]?.uri || '';
                const fullTitle = `${artistName} – ${title}`;
                
                const images = release.images || [];
                const imageUrl = images[0]?.uri || release.thumbnail || DiscogsAPI.getPlaceholderImage();
                
                // Extract release ID for Tier 2 fallback
                const releaseId = release.id || listing.release_id || null;
                
                return {
                    index: index + 1,
                    title: fullTitle,
                    artist: artistName,
                    trackTitle: title,
                    audioUrl: audioUrl,
                    imageUrl: imageUrl,
                    productId: listing.id,
                    releaseId: releaseId
                };
            });
            
            state.playlist = playlistItems;
            
            tracksContainer.innerHTML = playlistItems.map(track => `
                <div class="playlist-track"
                     data-index="${track.index}"
                     data-audio="${track.audioUrl}"
                     data-title="${track.title}"
                     data-artist="${track.artist}"
                     data-track-title="${track.trackTitle}"
                     data-image="${track.imageUrl}"
                     data-release-id="${track.releaseId || ''}">
                    <span class="track-number">${track.index}.</span>
                    <span class="track-title-text">"${track.trackTitle}" — by ${track.artist}</span>
                    <span class="track-play-icon">▶</span>
                    <span class="track-loading-icon" style="display:none">⏳</span>
                    <span class="track-no-audio-icon" style="display:none" title="Sin preview disponible">🔇</span>
                </div>
            `).join('');
            
            const playlistTitle = document.getElementById('playlistTitle');
            if (playlistTitle) playlistTitle.textContent = '"En Stock Ahora"';
            
            if (playlistItems.length > 0) {
                this.updateCoverArt(playlistItems[0].imageUrl);
            }
            
            this.attachTrackListeners();
            console.log('Hero playlist populated with', playlistItems.length, 'tracks');
        },
        
        attachTrackListeners() {
            document.querySelectorAll('.playlist-track').forEach(track => {
                track.addEventListener('click', (e) => {
                    e.preventDefault();
                    const index = parseInt(track.dataset.index) - 1;
                    this.playTrack(index);
                });
            });
        },
        
        playCurrentOrFirst() {
            if (state.playlist.length === 0) {
                this.playDefaultRadio();
                return;
            }
            const index = this.currentIndex >= 0 ? this.currentIndex : 0;
            this.playTrack(index);
        },
        
        async playTrack(index) {
            if (index < 0 || index >= state.playlist.length) return;
            if (this._resolving) return; // Prevent double-click during resolution
            
            const track = state.playlist[index];
            this.currentIndex = index;
            state.playlistMode = 'vinyl';
            
            if (track.imageUrl) this.updateCoverArt(track.imageUrl);
            this.updateNowPlayingDisplay(track);
            this.highlightTrack(index);
            this.updatePlayPauseBtn(true);
            this._setTrackLoadingState(index, 'loading');
            
            this._resolving = true;
            try {
                const resolved = await TrackResolver.resolve(track);
                
                if (resolved.type === 'youtube') {
                    AudioPlayer.startMusic(resolved.id, track.title, AudioPlayer.isMuted);
                    this.isPlaying = true;
                    this.updateNowPlaying(track.title);
                    this._setTrackLoadingState(index, 'ready');
                    
                    trackEvent('playlist_track_play', {
                        track_name: track.title,
                        track_index: index + 1,
                        source: track.audioUrl ? 'discogs_video' : 'discogs_release_api'
                    });
                } else {
                    // No audio found — show graceful state
                    this._setTrackLoadingState(index, 'no-audio');
                    this.isPlaying = false;
                    this.updatePlayPauseBtn(false);
                    this._showNoPreviewInPlaylist(track, resolved.searchQuery);
                    
                    trackEvent('playlist_track_no_preview', {
                        track_name: track.title,
                        track_index: index + 1
                    });
                }
            } catch (err) {
                console.error('Track resolution error:', err);
                this._setTrackLoadingState(index, 'no-audio');
                this.isPlaying = false;
                this.updatePlayPauseBtn(false);
            } finally {
                this._resolving = false;
            }
        },
        
        _setTrackLoadingState(index, state) {
            const tracks = document.querySelectorAll('.playlist-track');
            const track = tracks[index];
            if (!track) return;
            
            const loadingIcon = track.querySelector('.track-loading-icon');
            const noAudioIcon = track.querySelector('.track-no-audio-icon');
            const playIcon = track.querySelector('.track-play-icon');
            
            if (state === 'loading') {
                if (loadingIcon) loadingIcon.style.display = 'inline';
                if (noAudioIcon) noAudioIcon.style.display = 'none';
                if (playIcon) playIcon.style.display = 'none';
            } else if (state === 'no-audio') {
                if (loadingIcon) loadingIcon.style.display = 'none';
                if (noAudioIcon) noAudioIcon.style.display = 'inline';
                if (playIcon) playIcon.style.display = 'none';
            } else {
                if (loadingIcon) loadingIcon.style.display = 'none';
                if (noAudioIcon) noAudioIcon.style.display = 'none';
                if (playIcon) playIcon.style.display = 'inline';
            }
        },
        
        _showNoPreviewInPlaylist(track, searchQuery) {
            const nowPlayingName = document.getElementById('nowPlayingName');
            if (nowPlayingName) {
                nowPlayingName.innerHTML = `
                    <span style="color:#888;font-size:0.85em;">Sin preview — </span>
                    <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}"
                       target="_blank" rel="noopener"
                       style="color:#ff4d00;text-decoration:underline;font-size:0.85em;">
                       Buscar en YouTube ↗
                    </a>
                `;
            }
        },
        
        playDefaultRadio() {
            state.playlistMode = 'radio';
            this.currentIndex = -1;
            AudioPlayer.startMusic(CONFIG.youtubeVideoId, '3TRES6 Radio', AudioPlayer.isMuted);
            this.clearTrackHighlights();
            this.isPlaying = true;
            this.updatePlayPauseBtn(true);
            
            const nowPlayingName = document.getElementById('nowPlayingName');
            if (nowPlayingName) nowPlayingName.textContent = '3TRES6 Radio';
        },
        
        pause() {
            AudioPlayer.stopMusic();
            this.isPlaying = false;
            this.updatePlayPauseBtn(false);
        },
        
        updatePlayPauseBtn(playing) {
            const playBtn = document.getElementById('playlistPlayBtn');
            if (!playBtn) return;
            const playIcon = playBtn.querySelector('.play-icon');
            const pauseIcon = playBtn.querySelector('.pause-icon');
            if (playIcon) playIcon.style.display = playing ? 'none' : 'block';
            if (pauseIcon) pauseIcon.style.display = playing ? 'block' : 'none';
        },
        
        updateNowPlayingDisplay(track) {
            const nowPlayingName = document.getElementById('nowPlayingName');
            const playlistArtist = document.getElementById('playlistArtist');
            if (nowPlayingName) nowPlayingName.textContent = track.title;
            if (playlistArtist) playlistArtist.textContent = `by ${track.artist}`;
        },
        
        highlightTrack(index) {
            this.clearTrackHighlights();
            const tracks = document.querySelectorAll('.playlist-track');
            if (tracks[index]) tracks[index].classList.add('playing');
        },
        
        clearTrackHighlights() {
            document.querySelectorAll('.playlist-track').forEach(t => t.classList.remove('playing'));
            const playBtn = document.getElementById('playlistPlayBtn');
            if (playBtn) {
                const playIcon = playBtn.querySelector('.play-icon');
                const pauseIcon = playBtn.querySelector('.pause-icon');
                if (playIcon) playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
            }
        },
        
        updateNowPlaying(title) {
            const trackInfo = document.querySelector('.track-info');
            if (trackInfo) {
                const displayTitle = title.length > 30 ? title.substring(0, 27) + '...' : title;
                trackInfo.textContent = `🎵 ${displayTitle}`;
            }
        },
        
        updateCoverArt(imageUrl) {
            const coverArt = document.getElementById('playlistCoverArt');
            if (coverArt && imageUrl) {
                coverArt.innerHTML = `<img src="${imageUrl}" alt="Album cover" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" onerror="this.parentElement.innerHTML='<span>🔥</span>'">`;
            }
        }
    };

    // ========================================
    // Instagram Carousel
    // ========================================
    
    const InstagramCarousel = {
        currentSlide: 0,
        totalSlides: 6,
        autoPlayInterval: null,
        
        init() {
            const prevBtn = document.getElementById('instagramPrev');
            const nextBtn = document.getElementById('instagramNext');
            const dots = document.querySelectorAll('.carousel-dot');
            
            prevBtn?.addEventListener('click', () => this.prev());
            nextBtn?.addEventListener('click', () => this.next());
            
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goTo(index));
            });
            
            // Auto-play carousel
            this.startAutoPlay();
            
            // Pause on hover
            const carousel = document.getElementById('instagramCarousel');
            carousel?.addEventListener('mouseenter', () => this.stopAutoPlay());
            carousel?.addEventListener('mouseleave', () => this.startAutoPlay());
            
            // Touch/swipe support
            this.initSwipe();
        },
        
        goTo(index) {
            const slides = document.querySelectorAll('.instagram-slide');
            const dots = document.querySelectorAll('.carousel-dot');
            
            slides[this.currentSlide]?.classList.remove('active');
            dots[this.currentSlide]?.classList.remove('active');
            
            this.currentSlide = (index + this.totalSlides) % this.totalSlides;
            
            slides[this.currentSlide]?.classList.add('active');
            dots[this.currentSlide]?.classList.add('active');
        },
        
        next() {
            this.goTo(this.currentSlide + 1);
        },
        
        prev() {
            this.goTo(this.currentSlide - 1);
        },
        
        startAutoPlay() {
            this.stopAutoPlay();
            this.autoPlayInterval = setInterval(() => this.next(), 4000);
        },
        
        stopAutoPlay() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        },
        
        initSwipe() {
            const carousel = document.getElementById('instagramCarousel');
            if (!carousel) return;
            
            let startX = 0;
            let isDragging = false;
            
            carousel.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
            }, { passive: true });
            
            carousel.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                
                if (Math.abs(diff) > 50) {
                    if (diff > 0) this.next();
                    else this.prev();
                }
                isDragging = false;
            }, { passive: true });
        }
    };

    // ========================================
    // Calendar Live Tabs
    // ========================================
    
    const CalendarLiveTabs = {
        init() {
            const ytTab = document.getElementById('ytLiveTab');
            const tiktokTab = document.getElementById('tiktokLiveTab');
            const embedFrame = document.getElementById('liveEmbedFrame');
            
            ytTab?.addEventListener('click', () => {
                this.switchTab('youtube');
                trackEvent('live_tab_switch', { platform: 'youtube' });
            });
            
            tiktokTab?.addEventListener('click', () => {
                this.switchTab('tiktok');
                trackEvent('live_tab_switch', { platform: 'tiktok' });
            });
        },
        
        switchTab(platform) {
            const tabs = document.querySelectorAll('.live-tab');
            tabs.forEach(t => t.classList.remove('active'));
            
            const activeTab = document.querySelector(`.live-tab[data-platform="${platform}"]`);
            activeTab?.classList.add('active');
            
            const embedFrame = document.getElementById('liveEmbedFrame');
            if (!embedFrame) return;
            
            // Remove existing iframe
            const existingIframe = embedFrame.querySelector('iframe');
            if (existingIframe) existingIframe.remove();
            
            const placeholder = document.getElementById('liveEmbedPlaceholder');
            
            if (platform === 'youtube') {
                // YouTube live embed
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/live_stream?channel=UCxxxxxxxxxxxxxx&autoplay=0&rel=0&modestbranding=1`;
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                iframe.title = '3TRES6 Records YouTube Live';
                embedFrame.insertBefore(iframe, placeholder);
                
                // Update placeholder follow button
                if (placeholder) {
                    placeholder.querySelector('.follow-live-btn.yt')?.style.setProperty('display', 'inline-flex');
                    placeholder.querySelector('.follow-live-btn.tt')?.style.setProperty('display', 'none');
                }
            } else if (platform === 'tiktok') {
                // TikTok doesn't support direct live embeds, show redirect
                if (placeholder) {
                    placeholder.style.display = 'flex';
                    const icon = placeholder.querySelector('svg');
                    if (icon) {
                        icon.innerHTML = '<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>';
                    }
                    const p = placeholder.querySelector('p');
                    if (p) p.textContent = 'TikTok no permite embeds directos de live';
                    const sub = placeholder.querySelector('.placeholder-sub');
                    if (sub) sub.textContent = 'Haz click para ver nuestro live en TikTok';
                    
                    // Update buttons
                    const ytBtn = placeholder.querySelector('.follow-live-btn.yt');
                    const ttBtn = placeholder.querySelector('.follow-live-btn.tt');
                    if (ytBtn) ytBtn.style.display = 'none';
                    if (ttBtn) {
                        ttBtn.style.display = 'inline-flex';
                        ttBtn.href = 'https://www.tiktok.com/@3tres6records/live';
                        ttBtn.textContent = 'Ver en TikTok Live';
                    }
                }
            }
        }
    };

    // ========================================
    // Catalog Filters
    // ========================================
    
    const CatalogFilters = {
        init() {
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.filter-btn').forEach(b => {
                        b.classList.remove('active');
                        b.setAttribute('aria-selected', 'false');
                    });
                    this.classList.add('active');
                    this.setAttribute('aria-selected', 'true');
                    
                    const filter = this.dataset.filter;
                    
                    document.querySelectorAll('.product-card').forEach(card => {
                        const genre = card.dataset.genre?.toLowerCase();
                        const shouldShow = filter === 'all' || genre === filter || genre?.includes(filter);
                        card.style.display = shouldShow ? 'block' : 'none';
                    });
                    
                    trackEvent('filter_used', { filter_type: 'genre', filter_value: filter });
                });
            });
        }
    };

    // ========================================
    // Mobile Navigation
    // ========================================
    
    const MobileNav = {
        init() {
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const mobileNav = document.getElementById('mobileNav');
            
            if (mobileMenuBtn && mobileNav) {
                mobileMenuBtn.addEventListener('click', function() {
                    const isOpen = mobileNav.classList.toggle('active');
                    this.classList.toggle('active');
                    this.setAttribute('aria-expanded', isOpen);
                    document.body.classList.toggle('menu-open', isOpen);
                });

                mobileNav.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        mobileNav.classList.remove('active');
                        mobileMenuBtn.classList.remove('active');
                        document.body.classList.remove('menu-open');
                    });
                });
            }
        }
    };

    // ========================================
    // Smooth Scroll
    // ========================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // Exit Intent Popup
    // ========================================
    
    const ExitIntent = {
        hasShown: false,
        pageLoadTime: Date.now(),
        
        init() {
            const exitPopup = document.getElementById('exitPopup');
            const closeExitPopup = document.getElementById('closeExitPopup');
            const exitPopupForm = document.getElementById('exitPopupForm');
            
            if (!exitPopup) return;
            
            // Desktop: Mouse leave
            document.addEventListener('mouseout', (e) => {
                if (e.clientY < CONFIG.exitIntent.sensitivity && 
                    e.relatedTarget === null) {
                    this.show();
                }
            });
            
            // Mobile: Scroll up
            if ('ontouchstart' in window) {
                let maxScroll = 0;
                window.addEventListener('scroll', () => {
                    const scrollTop = window.pageYOffset;
                    if (scrollTop > maxScroll) maxScroll = scrollTop;
                    if (maxScroll > 500 && scrollTop < maxScroll * 0.7) {
                        this.show();
                    }
                });
            }
            
            closeExitPopup?.addEventListener('click', () => this.hide());
            exitPopup?.addEventListener('click', (e) => {
                if (e.target === exitPopup) this.hide();
            });
            
            exitPopupForm?.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = e.target.querySelector('input[type="email"]').value;
                this.submitEmail(email);
            });
        },
        
        hasBeenShown() {
            return document.cookie.includes(CONFIG.exitIntent.cookieName);
        },
        
        setCookie() {
            const date = new Date();
            date.setTime(date.getTime() + (CONFIG.exitIntent.cookieDays * 24 * 60 * 60 * 1000));
            document.cookie = `${CONFIG.exitIntent.cookieName}=true;expires=${date.toUTCString()};path=/`;
        },
        
        show() {
            if (this.hasShown || this.hasBeenShown()) return;
            if (Date.now() - this.pageLoadTime < CONFIG.exitIntent.delay) return;
            
            document.getElementById('exitPopup')?.classList.add('active');
            this.hasShown = true;
            
            trackEvent('exit_intent_shown', { page: window.location.pathname });
        },
        
        hide() {
            document.getElementById('exitPopup')?.classList.remove('active');
            this.setCookie();
        },
        
        submitEmail(email) {
            const popup = document.getElementById('exitPopup');
            
            trackEvent('newsletter_signup', {
                source: 'exit_intent',
                discount_code: CONFIG.exitIntent.discountCode
            });
            
            // Show success
            if (popup) {
                popup.querySelector('.exit-popup-body').innerHTML = `
                    <div style="text-align:center;">
                        <h2>¡Listo! 🎉</h2>
                        <p style="color:#888;margin:15px 0;">Tu código de 10% es:</p>
                        <div style="background:#ff4d00;padding:15px 30px;border-radius:8px;font-size:24px;font-weight:bold;letter-spacing:2px;display:inline-block;margin:15px 0;">${CONFIG.exitIntent.discountCode}</div>
                        <p style="color:#888;margin:15px 0;">También te lo enviamos por email.</p>
                        <a href="#catalogo" style="display:inline-block;margin-top:20px;color:#ff4d00;font-weight:600;" onclick="document.getElementById('exitPopup').classList.remove('active');">
                            Explorar catálogo →
                        </a>
                    </div>
                `;
            }
            
            this.setCookie();
            
            // Send to email service in production
            console.log('Exit intent signup:', email);
        }
    };

    // ========================================
    // Header Scroll Effect
    // ========================================
    
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            header.classList.toggle('scrolled', window.pageYOffset > 50);
        }
    });

    // ========================================
    // Newsletter Form
    // ========================================
    
    document.getElementById('footerNewsletterForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        const button = this.querySelector('button');
        
        button.textContent = '¡Listo!';
        this.querySelector('input').value = '';
        
        trackEvent('newsletter_signup', { source: 'footer_form' });
        
        setTimeout(() => {
            button.textContent = 'Suscribirse';
        }, 2000);
    });

    // ========================================
    // Keyboard Navigation
    // ========================================
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            Cart.close();
            Checkout.close();
            QuickView.close();
            ExitIntent.hide();
        }
    });

    // ========================================
    // Initialize Everything
    // ========================================
    
    DiscogsAPI.getInventory();
    Cart.init();
    Checkout.init();
    QuickView.init();
    AudioPlayer.init();
    HeroPlaylist.init();
    CatalogFilters.init();
    MobileNav.init();
    ExitIntent.init();
    InstagramCarousel.init();
    CalendarLiveTabs.init();
    
    // Re-process Instagram embeds if SDK loaded
    if (window.instgrm) {
        window.instgrm.Embeds.process();
    }

    // ========================================
    // Console Branding
    // ========================================
    
    console.log('%c🎵 3TRES6 RECORDS', 'font-size: 24px; font-weight: bold; color: #ff4d00;');
    console.log('%cBarcelona → México', 'font-size: 14px; color: #888;');

});

// Add toast animation styles
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(toastStyle);
