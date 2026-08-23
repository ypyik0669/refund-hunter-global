"""
Agent-Reach Discovery — Exa搜索 + Jina Reader
用于发现商户退款政策URL
"""
import os, httpx, asyncio
from typing import List

async def jina_read(url: str) -> str:
    """Jina Reader免费读网页：https://r.jina.ai/http://..."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(f"https://r.jina.ai/http://{url.replace('https://','').replace('http://','')}", headers={"X-Return-Format":"markdown"})
            if r.status_code == 200:
                return r.text[:15000]
    except Exception as e:
        print(f"[jina] fail {url}: {e}")
    return ""

async def exa_search(query: str, num: int = 5) -> List[str]:
    """Exa语义搜索 — 需要EXA_API_KEY，否则fallback到Jina+search"""
    api_key = os.getenv("EXA_API_KEY")
    if not api_key:
        return []
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post("https://api.exa.ai/search", json={"query": query, "numResults": num, "type":"auto"}, headers={"x-api-key": api_key, "Content-Type":"application/json"})
            if r.status_code == 200:
                data = r.json()
                return [item["url"] for item in data.get("results", [])]
    except Exception as e:
        print(f"[exa] fail {query}: {e}")
    return []

async def discover_refund_urls(merchant: str) -> List[str]:
    # 优先用Exa搜，否则返回空让Spider用预设URL
    q = f"{merchant} refund policy cancellation terms"
    urls = await exa_search(q, 3)
    return urls
