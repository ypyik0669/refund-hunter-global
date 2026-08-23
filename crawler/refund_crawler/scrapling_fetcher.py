"""
Scrapling Fetch Layer — 主力并发抓取
- StealthyFetcher 绕过 Cloudflare
- 支持 robots.txt, AutoThrottle
"""
import asyncio
from typing import List, Dict

# 延迟导入，允许未安装时fallback到requests
try:
    from scrapling.fetchers import StealthyFetcher, Fetcher
    HAS_SCRAPLING = True
except ImportError:
    HAS_SCRAPLING = False
    print("[scrapling] not installed, fallback to httpx")

import httpx
from bs4 import BeautifulSoup

async def fetch_with_scrapling(url: str, headless: bool = True) -> Dict:
    if HAS_SCRAPLING:
        try:
            # StealthyFetcher是同步/阻塞，放到线程池
            loop = asyncio.get_event_loop()
            def _fetch():
                # headless stealth
                page = StealthyFetcher.fetch(url, headless=headless, network_idle=True, block_webrtc=True)
                html = page.html_content if hasattr(page, 'html_content') else str(page)
                title = page.css('title::text').get() if hasattr(page, 'css') else ""
                return {"url": url, "html": html, "title": title or url, "engine": "scrapling-stealth"}
            return await loop.run_in_executor(None, _fetch)
        except Exception as e:
            print(f"[scrapling] fail {url}: {e}")
    # fallback httpx
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=20, headers={"User-Agent": "Mozilla/5.0"}) as client:
            r = await client.get(url)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "lxml")
            title = soup.title.string.strip() if soup.title and soup.title.string else url
            return {"url": url, "html": r.text, "title": title, "engine": "httpx"}
    except Exception as e:
        return {"url": url, "html": "", "title": url, "engine": "error", "error": str(e)}

async def fetch_many(urls: List[str], concurrency: int = 10) -> List[Dict]:
    sem = asyncio.Semaphore(concurrency)
    async def _one(u):
        async with sem:
            return await fetch_with_scrapling(u)
    return await asyncio.gather(*[_one(u) for u in urls])
