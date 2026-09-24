#!/usr/bin/env python3
"""Batched crawl4ai research for the blog content pillars.

Mandatory stack: Docker crawl4ai (container) + local crawl4ai library.
One process, one batch per pillar — no polling loops.

Usage:
  python3 scripts/research-pillars.py                 # all pillars
  python3 scripts/research-pillars.py atlas           # one pillar
  python3 scripts/research-pillars.py voices          # Red de Voces
  python3 scripts/research-pillars.py emerging --limit 3
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / "research"
CRAWL4AI_URL = os.environ.get("CRAWL4AI_URL", "http://localhost:11235")

# Batched URL lists — public, non-login sources. Expand after first pass.
PILLARS: dict[str, list[str]] = {
    "atlas": [
        # Vinyl / market data & city scenes (non-RA first)
        "https://en.wikipedia.org/wiki/Vinyl_record",
        "https://www.ifpi.org/resources/",
        "https://www.discogs.com/stats/",
        "https://www.beatport.com/label/deep-melodic-house/85774",
        "https://www.intervinilos.com/",
        "https://www.juno.co.uk/news/",
        "https://www.residentadvisor.net/articles",
        "https://ra.co/events",
        # Ticket / market signals (may soft-fail — kept for coverage)
        "https://dice.fm/browse/mexico-city",
        "https://dice.fm/browse/barcelona",
        "https://www.songkick.com/metro-areas/28763-mexico-city/",
        "https://www.songkick.com/metro-areas/26890-barcelona/",
        "https://www.stubhub.com/",
        # Cities / vinyl culture references
        "https://www.timeout.com/barcelona/music/best-record-shops-in-barcelona",
        "https://www.timeout.com/mexico-city/music/best-record-shops-in-mexico-city",
        "https://www.discogs.com/venue/474677-discos-paradiso/",
        "https://www.wahwahdiscos.com/",
    ],
    "emerging": [
        # Seed artists + discovery surfaces
        "https://bandcamp.com/tag/electronic",
        "https://www.beatport.com/chart/best-tracks-of-the-month/777777",
        "https://ra.co/artists",
        "https://soundcloud.com/tags/electronic",
        "https://www.djmag.com/",
        "https://mixmag.net/",
        "https://www.traxsource.com/",
        "https://www.factmag.com/",
        "https://www.xlr8r.com/",
        "https://www.printsandsoundsmag.com/",
        "https://bandcamp.com/discover/electronic",
        "https://www.beatport.com/discover",
    ],
    "culture": [
        # Where DJs buy + DJ life data / interviews
        "https://www.beatport.com/",
        "https://bandcamp.com/",
        "https://www.hypeddit.com/",
        "https://www.traxsource.com/",
        "https://www.djtechtools.com/",
        "https://www.djmag.com/features",
        "https://mixmag.net/features",
        "https://www.xlr8r.com/features",
        "https://www.residentadvisor.net/features",
        "https://ra.co/articles",
        "https://www.cratediggers.com/",
        "https://www.discogs.com/",
    ],
    "voices": [
        "https://www.discogs.com/venue/474677-discos-paradiso/",
        "https://www.timeout.com/barcelona/music/best-record-shops-in-barcelona",
        "https://www.salvadiscos.com/evento/vinilos-viajeros-meets-canela-en-surco-deep-latin-spiritual-house-feat-breixo-martinez-damian-botigue-thomas-kick/",
        "https://sesh.sx/e/516625",
        "https://set79.com/tracklist/soundcloud.com/slow-life/slow-life-friends-podcast-028-thomas-kick",
        "https://mixmag.es/read/yoyaku-atterriza-en-barcelona-este-offbcn-con-un-pop-up-en-bridge48-news",
        "https://granpricevinyl.com/edicion-2024",
        "https://www.musicis4lovers.com/boyanza-records-turn-one-with-compilation-release-interview/",
        "https://www.theclubmap.com/2025/02/02/label-interview-boyanza/",
        "https://ra.co/labels/20571",
        "https://boyanzarecords.bandcamp.com/",
        "https://boyanzarecords.bandcamp.com/music",
        "https://www.beatport.com/label/boyanza-records/88570",
        "https://www.insomniac.com/music/artists/rafatel/",
        "https://soundcloud.com/boyanza_records",
        "https://www.audiodise.com/about",
        "https://trommelmusic.com/news/audiodise-invite-john-dimas-and-vitess-to-their-audio-paradise-in-barcelona/",
        "https://edmdancedirectory.com/events/barcelona/2026-05-24",
        "https://good2b.es/event-post/regresa-audiodise-con-una-experiencia-auditiva-unica-en-un-teatro-emblematico-de-barcelona/",
        "https://ra.co/news/79422",
        "https://oazis.app/en/event/audiodise-x-openlab-pres-edward-giegling-e-lina-and-swann",
        "https://www.youtube.com/watch?v=zs0a6DhPRtM",
        "https://www.oblicuohifibar.com/",
        "https://www.oblicuohifibar.com/category/press/",
        "https://beatburguer.com/entrevista-ivanmaria-vele-de-oblicuo-hi-fi-bar/",
        "https://www.timeout.cat/barcelona/ca/musica/obicuo-hi-fi-bar",
        "https://totgracia.com/oblicuo-hi-fi-bar-el-primer-local-dalta-fidelitat-de-gracia/",
        "https://triennale.org/en/events/oblicuohifi-fatal-hanakito-fog-2026",
        "https://diasdecampofestival.com/",
        "https://diasdecampofestival.com/preguntas-frecuentes/",
        "https://thebasementxxx.com/webapp/noticias/sorpresas-dias-de-campo-2017-montanejos/",
        "https://xceed.me/blog/es/dias-de-campo-2026/",
        "https://electronicgroove.com/dias-de-campo-returns-to-montanejos-with-120-artists-for-2026-edition/",
        "https://www.lasprovincias.es/revista-valencia/jovenes-tras-conciertos-cuelgan-cartel-completo-20231030004804-nt.html",
        "https://www.bahidora.com/lineup",
        "https://www.bahidora.com/blog/descubre-la-distribucion-por-dias-del-lineup-para-2026",
        "https://mixmaglatam.com/read/entrevista-con-inigo-villamil-fundador-de-bahidora-news",
        "https://www.chilango.com/que-hacer/musica/bahidora-2026-todo-lo-que-te-espera-en-el-paraiso-musical/",
        "https://revistakuadro.com/curaduria-riesgo-y-frescura-asi-se-construye-el-cartel-de-bahidora/",
        "https://ra.co/news/83948",
    ],
}


def _slug(url: str) -> str:
    p = urlparse(url)
    host = p.netloc.replace("www.", "")
    path = (p.path or "/").strip("/").replace("/", "_") or "home"
    safe = "".join(c if c.isalnum() or c in "-_" else "-" for c in f"{host}_{path}")
    return safe[:120]


def _load_manifest(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text())
    return {"pillar": None, "crawled_at": None, "pages": []}


def _save_manifest(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


async def _crawl_docker(urls: list[str], out_dir: Path, limit: int) -> list[dict]:
    """Use Docker crawl4ai HTTP API (batched in one request)."""
    import aiohttp

    batch = urls[:limit]
    payload = {"urls": batch, "priority": 0, "crawler_config": {"wait_for": None, "page_timeout": 45000}}
    results: list[dict] = []
    try:
        async with aiohttp.ClientSession() as sess:
            async with sess.post(
                f"{CRAWL4AI_URL}/crawl",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=300),
            ) as resp:
                body = await resp.json(content_type=None)
    except Exception as e:  # noqa: BLE001 — record failure, fall through to local
        print(f"  docker crawl4ai failed: {e}", file=sys.stderr)
        return results

    # API may return list or {results: [...]}
    raw = body if isinstance(body, list) else body.get("results") or body.get("data") or []
    if isinstance(raw, dict):
        raw = [raw]
    for item in raw:
        if not isinstance(item, dict):
            continue
        url = item.get("url") or item.get("requested_url") or ""
        md = item.get("markdown") or {}
        if isinstance(md, dict):
            md_text = md.get("raw") or md.get("content") or ""
        else:
            md_text = str(md or "")
        if not md_text:
            md_text = (
                item.get("cleaned_html")
                or item.get("html")
                or item.get("fit_markdown")
                or ""
            )
            if isinstance(md_text, dict):
                md_text = md_text.get("raw") or md_text.get("content") or ""
            md_text = str(md_text or "")
        success = bool(item.get("success", True))
        err = item.get("error") or (None if success else item.get("status") or "failed")
        if not md_text and not success:
            results.append({"url": url, "ok": False, "error": str(err)[:300], "chars": 0})
            continue
        slug = _slug(url or "unknown")
        md_path = out_dir / f"{slug}.md"
        meta_path = out_dir / f"{slug}.json"
        md_path.write_text(md_text or "", encoding="utf-8")
        meta = {
            "url": url,
            "crawled_at": datetime.now(timezone.utc).isoformat(),
            "chars": len(md_text or ""),
            "success": success,
            "error": err,
            "via": "docker-crawl4ai",
        }
        meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n")
        results.append({"url": url, "ok": bool(md_text) and success, "chars": len(md_text or ""), "error": err})
        print(f"  [docker] {url} → {len(md_text or '')} chars" + ("" if md_text else f" ({err})"))
    return results


async def _crawl_local(urls: list[str], out_dir: Path, limit: int) -> list[dict]:
    """Local crawl4ai library (Playwright) — fallback / primary content pass."""
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

    batch = urls[:limit]
    results: list[dict] = []
    browser_config = BrowserConfig(
        headless=True,
        browser_type="chromium",
        extra_args=[
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--enable-webgl",
            "--use-gl=angle",
            "--ignore-gpu-blocklist",
            "--enable-unsafe-swiftshader",
        ],
    )
    run_config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        page_timeout=60000,
        delay_before_return_html=2.0,
        wait_until="domcontentloaded",
        scan_full_page=False,
        remove_overlay_elements=True,
    )
    async with AsyncWebCrawler(config=browser_config) as crawler:
        for url in batch:
            try:
                result = await crawler.arun(url, config=run_config)
                md_text = ""
                if result and result.markdown:
                    md_text = (
                        result.markdown.raw_markdown
                        if hasattr(result.markdown, "raw_markdown")
                        else str(result.markdown)
                    )
                ok = bool(getattr(result, "success", False) and md_text)
                err = getattr(result, "error_message", None)
                slug = _slug(url)
                if md_text:
                    (out_dir / f"{slug}.md").write_text(md_text, encoding="utf-8")
                meta = {
                    "url": url,
                    "crawled_at": datetime.now(timezone.utc).isoformat(),
                    "chars": len(md_text),
                    "success": ok,
                    "error": err,
                    "via": "local-crawl4ai",
                }
                (out_dir / f"{slug}.json").write_text(
                    json.dumps(meta, indent=2, ensure_ascii=False) + "\n"
                )
                results.append({"url": url, "ok": ok, "chars": len(md_text), "error": err})
                print(f"  [local] {url} → {len(md_text)} chars" + ("" if ok else f" ({err})"))
            except Exception as e:  # noqa: BLE001
                results.append({"url": url, "ok": False, "error": str(e)[:300], "chars": 0})
                print(f"  [local] {url} FAILED: {e}", file=sys.stderr)
            # gentle pacing — not a polling loop; fixed delay within one batch
            await asyncio.sleep(1.5)
    return results


async def run_pillar(name: str, limit: int | None, prefer: str) -> dict:
    urls = PILLARS[name]
    if limit:
        urls = urls[:limit]
    out_dir = RESEARCH / f"pillar-{name}"
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"\n=== pillar {name}: {len(urls)} urls (prefer={prefer}) ===")

    results: list[dict] = []
    if prefer in ("docker", "both"):
        results += await _crawl_docker(urls, out_dir, len(urls))
    # Always finish with local pass for anything failed/empty (one pass, no retry loops)
    need_local = [u for u in urls]
    if prefer == "both":
        failed = {r["url"] for r in results if not r.get("ok")}
        need_local = [u for u in urls if u in failed or not any(r["url"] == u and r.get("ok") for r in results)]
        if prefer == "docker" and not results:
            need_local = urls
    elif prefer == "docker":
        # if docker got nothing usable, fall back once to local
        if not any(r.get("ok") for r in results):
            need_local = urls
        else:
            need_local = [u for u in urls if not any(r["url"] == u and r.get("ok") for r in results)]
    else:
        need_local = urls

    if need_local:
        print(f"  local crawl4ai pass: {len(need_local)} urls")
        # avoid duplicating docker successes
        already = {r["url"] for r in results if r.get("ok")}
        local_targets = [u for u in need_local if u not in already]
        if local_targets:
            results += await _crawl_local(local_targets, out_dir, len(local_targets))

    ok = sum(1 for r in results if r.get("ok"))
    manifest = {
        "pillar": name,
        "crawled_at": datetime.now(timezone.utc).isoformat(),
        "engine": {
            "docker_url": CRAWL4AI_URL,
            "prefer": prefer,
        },
        "ok": ok,
        "total": len(results),
        "pages": results,
    }
    _save_manifest(out_dir / "manifest.json", manifest)
    print(f"  done: {ok}/{len(results)} ok → {out_dir}")
    return manifest


def docker_health() -> bool:
    import urllib.request

    try:
        with urllib.request.urlopen(f"{CRAWL4AI_URL}/health", timeout=5) as r:
            return r.status == 200
    except Exception:  # noqa: BLE001
        return False


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "pillar",
        nargs="?",
        choices=["atlas", "emerging", "culture", "voices", "all"],
        default="all",
    )
    ap.add_argument("--limit", type=int, default=None, help="Max URLs per pillar")
    ap.add_argument(
        "--prefer",
        choices=["docker", "local", "both"],
        default="both",
        help="Primary engine (docker = container API, local = python lib, both = docker then local fallback)",
    )
    args = ap.parse_args()

    RESEARCH.mkdir(exist_ok=True)
    health = docker_health()
    print(f"docker crawl4ai health: {'ok' if health else 'DOWN'} @ {CRAWL4AI_URL}")
    prefer = args.prefer
    if prefer == "both" and not health:
        prefer = "local"
        print("  → falling back to local crawl4ai only")

    names = list(PILLARS) if args.pillar == "all" else [args.pillar]
    t0 = time.time()
    manifests = []
    for n in names:
        manifests.append(asyncio.run(run_pillar(n, args.limit, prefer)))

    summary = {
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "duration_s": round(time.time() - t0, 1),
        "pillars": [
            {"name": m["pillar"], "ok": m["ok"], "total": m["total"]} for m in manifests
        ],
    }
    (RESEARCH / "run-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print("\n" + json.dumps(summary, indent=2))
    return 0 if any(m["ok"] for m in manifests) else 1


if __name__ == "__main__":
    raise SystemExit(main())
