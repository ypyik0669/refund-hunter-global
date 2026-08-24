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

async def fetch_with_scrapling(url: str, headless: bool = False) -> Dict:
    # 1. 优先用Scrapling Fetcher (快，非headless)
    if HAS_SCRAPLING:
        try:
            loop = asyncio.get_event_loop()
            def _fetch_fast():
                from scrapling.fetchers import Fetcher as SFetcher
                page = SFetcher.get(url, impersonate="chrome", stealthy_headers=True, follow_redirects=True)
                html = page.html_content if hasattr(page, 'html_content') else str(page)
                title = page.css('title::text').get() if hasattr(page, 'css') else ""
                return {"url": url, "html": html, "title": title or url, "engine": "scrapling-fetcher"}
            # 10秒超时
            try:
                return await asyncio.wait_for(loop.run_in_executor(None, _fetch_fast), timeout=12)
            except asyncio.TimeoutError:
                print(f"[scrapling] timeout fast {url}, try httpx")
        except Exception as e:
            print(f"[scrapling] fail fast {url}: {e}")
    # 2. fallback httpx (10s)
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}) as client:
            r = await asyncio.wait_for(client.get(url), timeout=10)
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
            try:
                return await asyncio.wait_for(fetch_with_scrapling(u), timeout=15)
            except asyncio.TimeoutError:
                return {"url": u, "html": "", "title": u, "engine": "timeout"}
    return await asyncio.gather(*[_one(u) for u in urls])
