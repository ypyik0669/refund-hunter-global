"""
crawl4ai Transform Layer — HTML → clean Markdown + 结构化抽取
fallback到BeautifulSoup/trafilatura如果未安装
"""
import re
from typing import Dict

try:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
    from crawl4ai.content_filter_strategy import PruningContentFilter
    from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
    HAS_CRAWL4AI = True
except ImportError:
    HAS_CRAWL4AI = False

from bs4 import BeautifulSoup

def html_to_markdown_simple(html: str, url: str = "") -> str:
    soup = BeautifulSoup(html, "lxml")
    # 移除script/style/nav/footer
    for tag in soup(["script","style","nav","footer","aside"]):
        tag.decompose()
    # 简单转markdown
    text = soup.get_text(separator="\n", strip=True)
    # 清理多空行
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text[:20000]  # 截断

async def process_with_crawl4ai(url: str, html: str = None) -> Dict:
    if HAS_CRAWL4AI and html is None:
        try:
            browser_config = BrowserConfig(headless=True, verbose=False)
            run_config = CrawlerRunConfig(
                cache_mode=CacheMode.BYPASS,
                markdown_generator=DefaultMarkdownGenerator(
                    content_filter=PruningContentFilter(threshold=0.48)
                ),
            )
            async with AsyncWebCrawler(config=browser_config) as crawler:
                result = await crawler.arun(url=url, config=run_config)
                md = result.markdown.fit_markdown or result.markdown.raw_markdown or ""
                return {"url": url, "markdown": md[:20000], "engine": "crawl4ai"}
        except Exception as e:
            print(f"[crawl4ai] fail {url}: {e}")
    # fallback
    if html:
        md = html_to_markdown_simple(html, url)
        return {"url": url, "markdown": md, "engine": "bs4"}
    return {"url": url, "markdown": "", "engine": "none"}

def extract_refund_structured(markdown: str) -> Dict:
    """简单规则抽取：退款天数、是否可退、联系方式"""
    text = markdown.lower()
    # refund window
    m = re.search(r"(\d+)\s*(day|days|天)", text)
    refund_days = int(m.group(1)) if m else None
    # keywords
    refundable = any(k in text for k in ["refund", "退款", "money back", "return", "reimbursement"])
    conditions = []
    if "within" in text or "天内" in text:
        conditions.append("within window")
    if "unused" in text or "未使用" in text:
        conditions.append("unused service")
    if "goodwill" in text or "善意" in text:
        conditions.append("goodwill")
    # contact
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", markdown)
    contact = email_match.group(0) if email_match else ""
    return {
        "refund_days": refund_days,
        "refundable": refundable,
        "conditions": conditions,
        "contact": contact,
    }
