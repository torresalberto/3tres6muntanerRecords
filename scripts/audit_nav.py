"""
Navigation Architecture Audit — 3TRES6 Records
Uses file:// URLs (no server needed for static HTML)
"""
from playwright.sync_api import sync_playwright
import json, os

BASE = "/home/alb/projects/muntaner336/website-build"
OUTPUT = "/tmp/nav_audit"
os.makedirs(OUTPUT, exist_ok=True)

PAGES = [
    ("index", "index.html"),
    ("blog", "blog.html"),
    ("product", "product.html"),
    ("dj-library", "dj-library.html"),
    ("3d-brain", "3d-brain.html"),
    ("toolhub", "toolhub/index.html"),
    ("dj-chaos", "dj/chaos-in-the-cbd.html"),
    ("dj-floorplan", "dj/floorplan.html"),
    ("dj-kettama", "dj/kettama.html"),
    ("dj-peggy-gou", "dj/peggy-gou.html"),
    ("dj-helena-hauff", "dj/helena-hauff.html"),
    ("dj-folamour", "dj/folamour.html"),
    ("dj-kerri-chandler", "dj/kerri-chandler.html"),
    ("dj-mall-grab", "dj/mall-grab.html"),
    ("dj-hunee", "dj/hunee.html"),
    ("dj-david-august", "dj/david-august.html"),
]

BREAKPOINTS = [
    ("desktop", 1440, 900),
    ("tablet", 1024, 768),
    ("mobile", 375, 812),
]

def audit_page(page, name, path):
    url = "file://" + os.path.join(BASE, path)
    result = {"name": name, "path": path, "elements": {}, "links": []}

    try:
        page.goto(url, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(1500)
    except Exception as e:
        result["error"] = str(e)
        return result

    # Header
    header = page.query_selector("header.header")
    result["elements"]["header_exists"] = header is not None

    # Logo
    logo = page.query_selector("a.logo")
    result["elements"]["logo_href"] = logo.get_attribute("href") if logo else None

    # Main nav
    main_nav = page.query_selector("nav.main-nav")
    result["elements"]["main_nav_exists"] = main_nav is not None
    if main_nav:
        items = main_nav.query_selector_all("a.nav-item")
        result["elements"]["main_nav_items"] = [{"text": a.inner_text().strip(), "href": a.get_attribute("href")} for a in items]

    # Mobile menu
    mobile_btn = page.query_selector("button.mobile-menu-btn")
    result["elements"]["mobile_menu_btn"] = mobile_btn is not None
    mobile_nav = page.query_selector("nav.mobile-nav")
    result["elements"]["mobile_nav"] = mobile_nav is not None
    if mobile_nav:
        links = mobile_nav.query_selector_all("a")
        result["elements"]["mobile_nav_links"] = [{"text": a.inner_text().strip(), "href": a.get_attribute("href")} for a in links]

    # DJ Hub sub-nav
    subnav = page.query_selector("nav.dj-hub-subnav")
    result["elements"]["subnav_exists"] = subnav is not None
    if subnav:
        links = subnav.query_selector_all("a")
        result["elements"]["subnav_links"] = [
            {"text": a.inner_text().strip(), "href": a.get_attribute("href"), "active": "active" in (a.get_attribute("class") or "")}
            for a in links
        ]
        back = subnav.query_selector(".subnav-back")
        result["elements"]["subnav_back"] = back is not None

    # Footer
    footer = page.query_selector("footer.footer")
    result["elements"]["footer_exists"] = footer is not None
    if footer:
        f_links = footer.query_selector_all("a")
        result["elements"]["footer_links"] = [{"text": a.inner_text().strip(), "href": a.get_attribute("href")} for a in f_links]

    # Cart
    cart = page.query_selector(".cart-icon, #cartIcon")
    result["elements"]["cart_exists"] = cart is not None

    # Headings
    h1s = page.query_selector_all("h1")
    result["elements"]["h1_count"] = len(h1s)
    result["elements"]["h1_texts"] = [h.inner_text().strip()[:80] for h in h1s]

    # Main landmark
    result["elements"]["main_landmark"] = page.query_selector("main") is not None

    # Canonical
    canonical = page.query_selector('link[rel="canonical"]')
    result["elements"]["canonical"] = canonical.get_attribute("href") if canonical else None

    # OG
    og = page.query_selector('meta[property="og:title"]')
    result["elements"]["og_title"] = og.get_attribute("content") if og else None

    return result

def take_screenshots(page, name, path):
    url = "file://" + os.path.join(BASE, path)
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(1500)
    except:
        return
    for bp, w, h in BREAKPOINTS:
        page.set_viewport_size({"width": w, "height": h})
        page.wait_for_timeout(400)
        page.screenshot(path=f"{OUTPUT}/{name}_{bp}.png", full_page=False)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context()
    page = ctx.new_page()

    results = []
    for name, path in PAGES:
        print(f"Auditing: {name}...")
        r = audit_page(page, name, path)
        results.append(r)
        take_screenshots(page, name, path)

    with open(f"{OUTPUT}/nav_audit.json", "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    browser.close()
    print(f"\nDone. {OUTPUT}/nav_audit.json")
