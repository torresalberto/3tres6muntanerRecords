'use strict';

/**
 * Journey scenarios. Each scenario exposes { id, name, viewport, run(t) }.
 *   t.check(ok, step, detail)  -> assertion
 *   t.warn(step, detail)       -> non-failing note
 *   t.goto(url, wait?)         -> navigate
 *   t.cap                      -> current page instrumentation
 *   t.measureNav(action)       -> reports { reload } for an in-page click
 *   t.base                     -> site origin
 */

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const SCENARIOS = [];

function s(id, name, viewport, run) {
  SCENARIOS.push({ id, name, viewport, run });
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

s('s01', 'Buy path: catalog → QuickView → Discogs (external)', DESKTOP, async (t) => {
  await t.goto(t.base + '/');
  await t.page.waitForSelector('.product-card', { timeout: 30000 }).catch(() => {});
  const cards = await t.page.locator('.product-card').count();
  t.check(cards > 0, 'Home catalog rendered', `product cards = ${cards}`);

  await t.page
    .locator('.quick-view-btn')
    .first()
    .click()
    .catch(() => {});
  await t.page.waitForSelector('#quickViewModal.active', { timeout: 4000 }).catch(() => {});
  const qvVisible = await t.page.locator('#quickViewModal.active').count();
  t.check(qvVisible > 0, 'QuickView modal opens', 'expected #quickViewModal.active');

  if (qvVisible > 0) {
    const buy = await t.page.evaluate(() => {
      const el = document.getElementById('quickViewAddToCart');
      return el
        ? { href: el.getAttribute('href'), blank: el.getAttribute('target'), cls: el.className }
        : null;
    });
    t.check(
      buy && /discogs\.com/.test(buy.href || '') && buy.blank === '_blank',
      'QuickView CTA is external Discogs link',
      `href=${buy && buy.href} target=${buy && buy.blank} cls=${buy && buy.cls}`
    );
  }

  // Card-level buy button also external
  const bbtn = await t.page.evaluate(() => {
    const a = document.querySelector('.buy-btn');
    return a ? { href: a.getAttribute('href'), blank: a.getAttribute('target') } : null;
  });
  t.check(
    bbtn && /discogs\.com/.test(bbtn.href || '') && bbtn.blank === '_blank',
    'Card buy-btn → Discogs (new tab)',
    `href=${bbtn && bbtn.href} target=${bbtn && bbtn.blank}`
  );

  // No local add-to-cart controls exist (cart deprecated after buy-via-Discogs refactor)
  const addCount = await t.page.evaluate(
    () => document.querySelectorAll('.add-to-cart-btn').length
  );
  t.check(
    addCount === 0,
    'No functional add-to-cart controls remain',
    `add-to-cart-btn elements = ${addCount}`
  );

  // Empty-cart checkout guard still present
  await t.page.evaluate(() => localStorage.removeItem('muntaner336_cart'));
  await t.page
    .locator('#cartIcon')
    .click()
    .catch(() => {});
  await t.page
    .locator('#checkoutBtn')
    .click()
    .catch(() => {});
  await t.page.waitForTimeout(500);
  const emptyBlocked = (await t.page.locator('#checkoutModal.active').count()) === 0;
  t.check(
    emptyBlocked,
    'Empty-cart checkout is guarded',
    'checkoutModal stays closed with empty cart'
  );
});

s('s02', 'Discogs fetch CORS behaviour + Stripe config', DESKTOP, async (t) => {
  await t.goto(t.base + '/');
  await t.page.waitForSelector('.product-card', { timeout: 30000 }).catch(() => {});

  const discogsFailed = t.cap.failed.some((f) => /api\.discogs\.com/.test(f.url));
  const corsBlocked = t.cap.console.some((m) => /discogs\.com.*(CORS|Access-Control)/i.test(m));
  t.check(
    !(discogsFailed || corsBlocked),
    'Live Discogs inventory loads (no CORS block)',
    `discogs request failed=${discogsFailed} CORS console errors=${corsBlocked}`
  );

  const inventory = await t.page.evaluate(() => {
    const it = localStorage['discogs_inventory'] || '';
    return { cached: it.length > 0, len: it.length };
  });
  t.warn('discogs.cache', `cached inventory len=${inventory.len}`);

  const stripe = await t.page.evaluate(() => (window.CONFIG && CONFIG.stripePublicKey) || '');
  t.warn(
    'checkout.stripe',
    `stripePublicKey = ${stripe ? '(set)' : '(EMPTY — payment stub only)'}`
  );
});

/* ------------------------------------------------------------------ */
/* Audio                                                               */
/* ------------------------------------------------------------------ */

s('s03', 'Audio survives swup SPA navigation (home→toolhub→blog)', DESKTOP, async (t) => {
  await t.goto(t.base + '/');
  await t.page.waitForSelector('#audioToggle', { timeout: 15000 }).catch(() => {});
  const toggle0 = await t.page.locator('#audioToggle').count();
  const player0 = await t.page.locator('#ytPlayer').count();
  const video0 = await t.page.evaluate(
    () => JSON.parse(localStorage['3tres6_audio_state'] || '{}').videoId || ''
  );
  t.check(
    toggle0 > 0 && player0 > 0,
    'Audio player boots on home',
    `toggle=${toggle0} ytPlayer=${player0} video=${video0 || '(none)'}`
  );

  // mute toggle
  await t.page
    .locator('#audioToggle')
    .click()
    .catch(() => {});
  await t.page.waitForTimeout(300);
  const muted = await t.page.evaluate(
    () => JSON.parse(localStorage['3tres6_audio_state'] || '{}').muted
  );
  t.warn('audio.muted', `after toggle muted=${muted}`);

  // swup nav to toolhub
  let mv = await t.measureNav(async () => {
    await t.page
      .getByRole('link', { name: /Herramientas/i })
      .first()
      .click()
      .catch(() => {});
  });
  t.check(!mv.reload, 'home→toolhub is SPA (no reload)', `reload=${mv.reload}`);
  const ytAfter = await t.page.locator('#ytPlayer').count();
  t.check(ytAfter > 0, 'Audio iframe persists across swup', `ytPlayer=${ytAfter}`);

  // swup nav to blog
  mv = await t.measureNav(async () => {
    await t.page
      .getByRole('link', { name: /Blog/i })
      .first()
      .click()
      .catch(() => {});
  });
  t.check(!mv.reload, 'toolhub→blog is SPA (no reload)', `reload=${mv.reload}`);
});

s('s04', 'Audio across full reloads (home→3d-brain→crew→mapa) + >5s loss', DESKTOP, async (t) => {
  await t.goto(t.base + '/');
  await t.page.waitForSelector('#ytPlayer', { timeout: 15000 }).catch(() => {});
  const video0 = await t.page.evaluate(
    () => JSON.parse(localStorage['3tres6_audio_state'] || '{}').videoId || ''
  );

  // fast full reload to 3d-brain (should restore within 5s window)
  await t.goto(t.base + '/3d-brain.html', 900);
  const yt3d = await t.page.locator('#ytPlayer').count();
  t.check(yt3d > 0, 'Audio player present after hard nav to 3d-brain', `ytPlayer=${yt3d}`);

  // slow nav: fake an old timestamp (>5s) then reload became crew
  await t.goto(t.base + '/crew.html', 600);
  const before = Date.now() - 20000;
  await t.page.evaluate((ts) => {
    const st = JSON.parse(localStorage['3tres6_audio_state'] || '{}');
    st.ts = ts;
    localStorage['3tres6_audio_state'] = JSON.stringify(st);
  }, before);
  await t.page.reload({ waitUntil: 'domcontentloaded' });
  await t.page.waitForTimeout(1200);
  const afterVideo = await t.page.evaluate(
    () => JSON.parse(localStorage['3tres6_audio_state'] || '{}').videoId || ''
  );
  const restored = afterVideo === video0;
  t.check(
    restored,
    'Audio restores if nav <5s',
    `video before=${video0 || '(none)'} after=${afterVideo || '(none)'}`
  );

  await t.goto(t.base + '/mapa.html', 1200);
  const ytMapa = await t.page.locator('#ytPlayer').count();
  t.check(ytMapa > 0, 'Audio player on mapa (full reload)', `ytPlayer=${ytMapa}`);
});

/* ------------------------------------------------------------------ */
/* Content / social                                                    */
/* ------------------------------------------------------------------ */

s('s05', 'DJ directions: library→card→profile→brain→crew→member', DESKTOP, async (t) => {
  await t.goto(t.base + '/dj-library.html', 7000);
  const cards = await t.page.locator('.dj-card').count();
  t.check(cards > 0, 'DJ library loads cards', `.dj-card = ${cards}`);

  if (cards > 0) {
    // Assert the actual behaviour of a card click: does it expand or navigate away?
    await t.page
      .locator('.dj-card')
      .first()
      .click()
      .catch(() => {});
    await t.page.waitForTimeout(2500);
    const url = t.page.url();
    const navAway = /\/dj\/[^/]+\.html/.test(url);
    const expanded = await t.page.locator('.dj-card.expanded').count();
    t.check(
      expanded > 0 || !navAway,
      'Card expand toggle works (does not orphan-navigate)',
      `url=${url.split('/').pop()} expanded=${expanded}`
    );

    // Follow to a DJ page via the card's "Ver perfil →" link
    const perma = t.page.locator('.dj-card a.set-permalink').first();
    if ((await perma.count()) > 0) {
      await t.measureNav(async () => perma.click().catch(() => {}));
    }
    t.check(
      /\/dj\//.test(t.page.url()),
      'DJ static page loads',
      `url=${t.page.url().split('/').pop()}`
    );
  }

  await t.goto(t.base + '/3d-brain.html', 2500);
  const circles = await t.page.locator('#sphere-svg circle').count();
  t.check(circles > 0, '3d-brain sphere renders', `svg circles = ${circles}`);

  await t.goto(t.base + '/crew.html', 2500);
  const crewCards = await t.page.locator('#crewGrid > *').count();
  t.check(crewCards > 0, 'Crew grid renders', `crew members = ${crewCards}`);

  if (crewCards > 0) {
    await t.measureNav(async () => {
      await t.page
        .locator('#crewGrid > * .dj-card, #crewGrid > * a[href]')
        .first()
        .click()
        .catch(() => {});
    });
    const memberOk = await t.page.evaluate(
      () => !/404|no se encontr/i.test(document.body.innerText)
    );
    t.check(
      memberOk,
      'Crew member page loads',
      `url=${t.page.url().split('/').slice(-2).join('/')}`
    );
  }
});

s('s06', 'Map directions: filters → popup → flyTo', DESKTOP, async (t) => {
  await t.goto(t.base + '/mapa.html', 4000);
  const markers = await t.page.locator('.leaflet-marker-icon').count();
  const cards = await t.page.locator('.venue-card, .venue-list .venue-item').count();
  t.check(markers > 0, 'Map markers render', `markers = ${markers}`);
  t.check(cards > 0, 'Venue sidebar renders', `venue cards = ${cards}`);

  const statsV = await t.page
    .locator('#statVenues')
    .textContent()
    .catch(() => '-');
  const statsC = await t.page
    .locator('#statCities')
    .textContent()
    .catch(() => '-');
  t.check(parseInt(statsV, 10) > 0, 'Stats populated', `venues=${statsV} cities=${statsC}`);

  const tabs = t.page.locator('.city-tab');
  const tabCount = await tabs.count();
  t.check(tabCount >= 3, 'City tabs present', `tabs = ${tabCount}`);
  if (tabCount > 0) {
    await tabs
      .nth(1)
      .click()
      .catch(() => {});
    await t.page.waitForTimeout(800);
    t.warn('map.cityTab', 'clicked tab index 1');
  }

  const firstCard = t.page.locator('.venue-card, .venue-list .venue-item').first();
  if ((await firstCard.count()) > 0) {
    await firstCard.click().catch(() => {});
    await t.page.waitForTimeout(700);
    const fn = await t.page.locator('.leaflet-popup').count();
    t.check(fn > 0, 'Venue popup opens on card click', `leaflet-popup = ${fn}`);
  }
});

s('s07', 'Tools: each toolhub tab loads without errors', DESKTOP, async (t) => {
  await t.goto(t.base + '/toolhub/', 2500);
  const tabs = t.page.locator('.tool-tab');
  const tabNames = await tabs.allTextContents();
  t.check(tabNames.length > 0, 'Toolhub tabs present', `tabs = ${tabNames.join(', ')}`);
  for (let i = 0; i < tabNames.length; i++) {
    await tabs
      .nth(i)
      .click()
      .catch(() => {});
    await t.page.waitForTimeout(350);
  }
  const camelotIdx = (await tabs.allTextContents()).findIndex((n) =>
    n.toLowerCase().includes('camelot')
  );
  if (camelotIdx >= 0) {
    await tabs.nth(camelotIdx).click();
    await t.page.waitForTimeout(600);
  }
  t.check(
    (await t.page.locator('#camelotWheel svg, #camelotWheel').count()) > 0,
    'Camelot wheel tool present',
    'wheelSvg found'
  );
});

s('s08', 'Blog: articles render and read-more targets resolve', DESKTOP, async (t) => {
  await t.goto(t.base + '/blog.html', 2500);
  const arts = await t.page.locator('.blog-article-small, article').count();
  t.check(arts > 0, 'Blog articles render', `articles = ${arts}`);

  const rm = t.page.locator('.blog-article-read-more').first();
  if ((await rm.count()) > 0) {
    const href = await rm.getAttribute('href');
    t.warn('blog.readMore', `read-more href = ${href}`);
    try {
      const r = await t.page.evaluate(async (u) => {
        const res = await fetch(u, { method: 'HEAD', redirect: 'follow' });
        return { status: res.status, final: res.url };
      }, href);
      t.check(
        r.status < 400,
        'First article read-more resolves',
        `status=${r.status} → ${r.final}`
      );
    } catch {
      t.warn('blog.readMore', `could not HEAD ${href}`);
    }
  }
});

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

s('s09', 'Nav integrity: every primary/subnav/footer link on each page', DESKTOP, async (t) => {
  const pages = [
    '/',
    '/blog.html',
    '/dj-library.html',
    '/3d-brain.html',
    '/crew.html',
    '/mapa.html',
    '/toolhub/',
  ];
  const seen = new Set();
  for (const p of pages) {
    await t.goto(t.base + p, 2200);
    const links = await t.page.evaluate(() => {
      const out = [];
      document
        .querySelectorAll(
          'header a[href], footer a[href], .dj-hub-subnav a[href], .main-nav a[href], .mobile-nav a[href]'
        )
        .forEach((a) => {
          const h = a.getAttribute('href');
          if (
            !h ||
            /^(#|javascript|mailto|tel:)/.test(h) ||
            (/https?:/.test(h) && !h.includes('3tres6records.albto.me'))
          )
            return;
          out.push(h);
        });
      return out;
    });
    for (const h of links) {
      if (seen.has(h)) continue;
      seen.add(h);
      try {
        const r = await t.page.evaluate(
          async (u) => (await fetch(u, { method: 'HEAD', redirect: 'follow' })).status,
          h
        );
        t.check(r < 400, `nav link OK (${p} → ${h})`, `status=${r}`);
      } catch {
        t.warn('nav.fetch', `could not verify ${h} from ${p}`);
      }
    }
  }
});

s('s10', 'Orphan / parallel pages direct access', DESKTOP, async (t) => {
  const targets = [
    '/product.html',
    '/dj-library/index.html',
    '/dj/carl-cox.html',
    '/data/djs/profiles/carl-cox.html',
  ];
  for (const p of targets) {
    await t.goto(t.base + p, 2000);
    const status = await t.page.evaluate(() => {
      // detect 404 page
      return document.title;
    });
    t.check(!/404|no se encontr/i.test(status), `direct access ${p}`, `title=${status}`);
  }
  // confirm product.html not reachable from nav (documented gap)
  await t.goto(t.base + '/', 1800);
  const prodLinks = await t.page.evaluate(
    () => document.querySelectorAll('a[href*="product.html"]').length
  );
  t.check(prodLinks === 0, 'product.html absent from homepage links', `links=${prodLinks}`);
});

s('s12', 'Back/forward across swup and full reloads', DESKTOP, async (t) => {
  await t.goto(t.base + '/', 2000);
  // full-reload path via map (mapa has no swup)
  await t.measureNav(async () => {
    await t.page
      .getByRole('link', { name: /Mapa/i })
      .first()
      .click()
      .catch(() => {});
  });
  await t.page.goBack().catch(() => {});
  await t.page.waitForTimeout(1800);
  t.check(
    t.page.url().replace(/\/$/, '') === t.base,
    'Back (full reload) → home',
    `url=${t.page.url()}`
  );

  // swup-enabled path from blog subnav
  await t.goto(t.base + '/blog.html', 2400);
  const mv = await t.measureNav(async () => {
    await t.page
      .getByRole('link', { name: /DJ Library/i })
      .first()
      .click()
      .catch(() => {});
  });
  t.warn('nav.swup', `blog→DJ Library used swup SPA=${!mv.reload} (reload=${mv.reload})`);
  await t.page.goBack().catch(() => {});
  await t.page.waitForTimeout(1800);
  t.check(
    /blog\.html/.test(t.page.url()),
    'Back (blog nav) → blog',
    `url=${t.page.url().split('/').pop()}`
  );
});

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */

s('s13', 'Newsletter: exit-intent trigger + submit', DESKTOP, async (t) => {
  await t.goto(t.base + '/');
  await t.page.evaluate(() => localStorage.removeItem('3tres6_exit_shown')).catch(() => {});
  await t.page.reload({ waitUntil: 'domcontentloaded' });
  await t.page.waitForTimeout(1500);

  const triggered = await t.page.evaluate(() => {
    let pop = false;
    if (!document.querySelector('.exit-popup, #exitPopup, .newsletter-modal')) return 'no-popup-el';
    const fired =
      document.dispatchEvent(
        new MouseEvent('mouseleave', { clientX: 0, clientY: -1, bubbles: true })
      ) || document.dispatchEvent(new Event('mouseleave'));
    return fired ? 'fired' : 'not-fired';
  });
  t.warn('newsletter.mouseleave', `mouseleave fired=${triggered}`);

  const popup = await t.page.locator('.exit-popup, #exitPopup, .newsletter-modal').count();
  t.check(popup > 0, 'Newsletter popup element exists', `popup elements = ${popup}`);
});

s('s14', 'Dead-links sweep (internal resolves; external headaches)', DESKTOP, async (t) => {
  const pages = [
    '/',
    '/blog.html',
    '/dj-library.html',
    '/3d-brain.html',
    '/crew.html',
    '/mapa.html',
    '/toolhub/',
    '/product.html',
  ];
  const badInternal = [];
  const ext = [];
  for (const p of pages) {
    await t.goto(t.base + p, 2200);
    const links = await t.page.evaluate(() => {
      const out = { internal: [], external: [] };
      document.querySelectorAll('a[href]').forEach((a) => {
        const h = a.getAttribute('href');
        if (!h || /^(#|javascript|mailto|tel:)/.test(h)) return;
        if (/^https?:/.test(h)) out.external.push(h);
        else out.internal.push(h);
      });
      return out;
    });
    for (const h of links.internal) {
      try {
        const r = await t.page.evaluate(
          async (u) => (await fetch(u, { method: 'HEAD', redirect: 'follow' })).status,
          h
        );
        if (r >= 400) badInternal.push({ from: p, href: h, status: r });
      } catch (e) {
        t.warn('sweep.fetch', `HEAD ${h} from ${p} failed: ${e.message || e}`);
      }
    }
    ext.push({ from: p, count: links.external.length });
  }
  t.check(
    badInternal.length === 0,
    'No 400+ internal links across sampled pages',
    badInternal
      .slice(0, 8)
      .map((b) => `${b.status} ${b.from} → ${b.href}`)
      .join(' | ')
  );
  t.warn('external.count', ext.map((e) => `${e.from}=${e.count}`).join(' '));
});

s('s11', 'Mobile 390px: menu, buy, map, DJ library, no horizontal scroll', MOBILE, async (t) => {
  await t.goto(t.base + '/');
  const noHScroll = await t.page.evaluate(
    () => document.scrollingElement.scrollWidth <= document.documentElement.clientWidth + 4
  );
  t.check(
    noHScroll,
    'No horizontal overflow on home',
    `sw=${await t.page.evaluate(() => document.scrollingElement.scrollWidth)} cw=${await t.page.evaluate(() => document.documentElement.clientWidth)}`
  );

  const menuBtn = t.page
    .locator('.mobile-menu-btn, #mobileMenuBtn, .hamburger, [aria-label*="menu" i]')
    .first();
  if ((await menuBtn.count()) > 0) {
    await menuBtn.click().catch(() => {});
    await t.page.waitForTimeout(500);
    const open = await t.page.evaluate(
      () =>
        document.querySelectorAll('.mobile-nav.active, .mobile-menu.active, nav.mobile.open').length
    );
    t.check(open > 0, 'Mobile menu opens', `active=${open}`);
    await menuBtn.click().catch(() => {});
  } else {
    t.warn('mobile.menu', 'no mobile menu button detected');
  }

  await t.page
    .locator('.quick-view-btn')
    .first()
    .click()
    .catch(() => {});
  await t.page.waitForSelector('#quickViewModal', { timeout: 3000 }).catch(() => {});
  t.check(
    (await t.page.locator('#quickViewModal.active').count()) > 0,
    'Buy path OK on mobile (quick view)',
    'quickview active'
  );

  await t.goto(t.base + '/mapa.html', 3000);
  t.check(
    (await t.page.locator('.leaflet-marker-icon').count()) > 0,
    'Map markers on mobile',
    'markers>0'
  );

  await t.goto(t.base + '/dj-library.html', 7000);
  t.check((await t.page.locator('.dj-card').count()) > 0, 'DJ library on mobile', '.dj-card>0');
});

module.exports = { SCENARIOS };
