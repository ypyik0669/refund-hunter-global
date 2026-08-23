"""
firecrawl Fallback — JS重站兜底
需要 FIRECRAWL_API_KEY 时才启用，否则跳过
"""
import os
from typing import Dict

try:
    from firecrawl import Firecrawl
    HAS_FIRECRAWL = True
except ImportError:
    HAS_FIRECRAWL = False

def scrape_with_firecrawl(url: str) -> Dict:
    api_key = os.getenv("FIRECRAWL_API_KEY") or os.getenv("FC_API_KEY")
    if not HAS_FIRECRAWL or not api_key:
        return {"url": url, "markdown": "", "engine": "firecrawl-skip", "reason": "no api key"}
    try:
        app = Firecrawl(api_key=api_key)
        doc = app.scrape(url, formats=["markdown"])
        md = getattr(doc, "markdown", "") or ""
        return {"url": url, "markdown": md[:20000], "engine": "firecrawl"}
    except Exception as e:
        return {"url": url, "markdown": "", "engine": "firecrawl-error", "error": str(e)}
