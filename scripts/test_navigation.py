"""
Playwright Test Protocols — Navigation Integrity
Run after any navigation changes to verify correctness.
"""
from playwright.sync_api import sync_playwright
import os, sys

BASE = "file://" + "/home/alb/projects/muntaner336/website-build"
PASS = 0
FAIL = 0

def check(condition, msg):
    global PASS, FAIL
    if condition:
        PASS += 1
    else:
        FAIL += 1
        print(f"  FAIL: {msg}")

def test_page(page, name, path, expected):
    url = BASE + "/" + path
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(1500)
    except Exception as e:
        check(False, f"{name}: Failed to load ({e})")
        return

    print(f"\n[{name}]")

    # Header exists
    header = page.query_selector("header.header")
    check(header is not None, f"{name}: Missing header")

    # Logo link consistent
    logo = page.query_selector("a.logo")
    if logo:
        href = logo.get_attribute("href")
        check(href == "/3tres6muntanerRecords/", f"{name}: Logo href is '{href}', expected '/3tres6muntanerRecords/'")

    # Main nav exists
    main_nav = page.query_selector("nav.main-nav")
    check(main_nav is not None, f"{name}: Missing main-nav")

    # Mobile menu button (on all pages)
    mobile_btn = page.query_selector("button.mobile-menu-btn")
    check(mobile_btn is not None, f"{name}: Missing mobile-menu-btn")

    # Mobile nav (on all pages)
    mobile_nav = page.query_selector("nav.mobile-nav")
    check(mobile_nav is not None, f"{name}: Missing mobile-nav")

    # Sub-nav (on DJ Hub pages)
    is_dj_hub = expected.get("subnav", False)
    subnav = page.query_selector("nav.dj-hub-subnav")
    if is_dj_hub:
        check(subnav is not None, f"{name}: Expected subnav but missing")
        if subnav:
            back = subnav.query_selector(".subnav-back, a[href*='muntanerRecords']")
            check(back is not None, f"{name}: Subnav missing back-to-store link")
    else:
        check(subnav is None, f"{name}: Unexpected subnav present")

    # Footer exists
    footer = page.query_selector("footer.footer")
    check(footer is not None, f"{name}: Missing footer")

    # Cart icon
    cart = page.query_selector(".cart-icon, #cartIcon")
    check(cart is not None, f"{name}: Missing cart icon")

    # Single h1
    h1s = page.query_selector_all("h1")
    check(len(h1s) == 1, f"{name}: Found {len(h1s)} h1 tags, expected 1")

    # Main landmark
    main = page.query_selector("main")
    check(main is not None, f"{name}: Missing <main> landmark")

    # Canonical tag
    canonical = page.query_selector('link[rel="canonical"]')
    check(canonical is not None, f"{name}: Missing canonical tag")

    # OG title
    og = page.query_selector('meta[property="og:title"]')
    check(og is not None, f"{name}: Missing og:title meta tag")

    # No dead footer links (check known dead paths)
    if footer:
        dead_links = footer.query_selector_all('a[href*="/condiciones"], a[href*="/envios"], a[href*="/contacto"]')
        check(len(dead_links) == 0, f"{name}: Footer has {len(dead_links)} dead links (condiciones/envios/contacto)")

def test_mobile_menu(page):
    print("\n[Mobile Menu Toggle]")
    url = BASE + "/index.html"
    page.goto(url, wait_until="domcontentloaded", timeout=15000)
    page.wait_for_timeout(1500)
    page.set_viewport_size({"width": 375, "height": 812})
    page.wait_for_timeout(500)

    btn = page.query_selector("button.mobile-menu-btn")
    check(btn is not None, "Mobile: hamburger button missing")

    mobile_nav = page.query_selector("nav.mobile-nav")
    if mobile_nav:
        # Initially hidden
        is_hidden = page.evaluate("""
            (el) => {
                const s = window.getComputedStyle(el);
                return s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0';
            }
        """, mobile_nav)
        check(is_hidden, "Mobile: nav should be hidden initially")

        # Click hamburger
        if btn:
            btn.click()
            page.wait_for_timeout(500)
            is_visible = page.evaluate("""
                (el) => {
                    const s = window.getComputedStyle(el);
                    return s.display !== 'none' && s.visibility !== 'hidden';
                }
            """, mobile_nav)
            check(is_visible, "Mobile: nav should be visible after click")

def test_subnav_consistency(page):
    print("\n[Sub-nav Consistency]")
    dj_hub_pages = [
        ("blog", "blog.html"),
        ("dj-library", "dj-library.html"),
        ("3d-brain", "3d-brain.html"),
        ("toolhub", "toolhub/index.html"),
        ("dj-chaos", "dj/chaos-in-the-cbd.html"),
    ]
    for name, path in dj_hub_pages:
        url = BASE + "/" + path
        page.goto(url, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(1500)

        subnav = page.query_selector("nav.dj-hub-subnav")
        if not subnav:
            check(False, f"{name}: subnav missing")
            continue

        links = subnav.query_selector_all("a")
        texts = [l.inner_text().strip().upper() for l in links]

        # All DJ Hub pages should have the same tabs
        expected_tabs = ["TIENDA", "BLOG", "DJ LIBRARY", "NEURAL", "HERRAMIENTAS", "EQUIPO DJ"]
        for tab in expected_tabs:
            check(tab in texts, f"{name}: subnav missing '{tab}'")

        # Back link should point to store
        back_links = subnav.query_selector_all('a[href*="muntanerRecords"], .subnav-back')
        check(len(back_links) > 0, f"{name}: no back-to-store link in subnav")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()

    # Define expected features per page
    pages = {
        "index": {"path": "index.html", "subnav": False},
        "blog": {"path": "blog.html", "subnav": True},
        "product": {"path": "product.html", "subnav": False},
        "dj-library": {"path": "dj-library.html", "subnav": True},
        "3d-brain": {"path": "3d-brain.html", "subnav": True},
        "toolhub": {"path": "toolhub/index.html", "subnav": True},
        "dj-chaos": {"path": "dj/chaos-in-the-cbd.html", "subnav": True},
        "dj-floorplan": {"path": "dj/floorplan.html", "subnav": True},
        "dj-kettama": {"path": "dj/kettama.html", "subnav": True},
        "dj-peggy-gou": {"path": "dj/peggy-gou.html", "subnav": True},
        "dj-helena-hauff": {"path": "dj/helena-hauff.html", "subnav": True},
        "dj-folamour": {"path": "dj/folamour.html", "subnav": True},
        "dj-kerri-chandler": {"path": "dj/kerri-chandler.html", "subnav": True},
        "dj-mall-grab": {"path": "dj/mall-grab.html", "subnav": True},
        "dj-hunee": {"path": "dj/hunee.html", "subnav": True},
        "dj-david-august": {"path": "dj/david-august.html", "subnav": True},
    }

    for name, cfg in pages.items():
        test_page(page, name, cfg["path"], cfg)

    test_mobile_menu(page)
    test_subnav_consistency(page)

    browser.close()

    print(f"\n{'='*50}")
    print(f"Results: {PASS} passed, {FAIL} failed")
    print(f"{'='*50}")
    sys.exit(1 if FAIL > 0 else 0)
