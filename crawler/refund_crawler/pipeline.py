"""
Unified Pipeline — 调度4框架，完成全球退款政策爬取
"""
import asyncio, json, pathlib, datetime, re
from config import load_merchants, OUTPUT_DIR, MARKDOWN_DIR, POLICIES_JSONL, NEXT_JSON
from scrapling_fetcher import fetch_many
from crawl4ai_processor import process_with_crawl4ai, extract_refund_structured, html_to_markdown_simple
from firecrawl_fallback import scrape_with_firecrawl

async def crawl_merchant(merchant_entry: dict) -> list:
    merchant = merchant_entry["merchant"]
    category = merchant_entry.get("category","other")
    urls = merchant_entry["urls"]
    print(f"[{merchant}] crawling {len(urls)} urls")
    # 1. Scrapling并发抓
    fetched = await fetch_many(urls, concurrency=5)
    results = []
    for item in fetched:
        url = item["url"]
        html = item.get("html","")
        title = item.get("title", merchant)
        if not html or len(html) < 500:
            # 2. firecrawl兜底
            fc = scrape_with_firecrawl(url)
            if fc.get("markdown"):
                md = fc["markdown"]
                engine = "firecrawl"
            else:
                md = html_to_markdown_simple(html, url) if html else ""
                engine = item.get("engine","unknown")
        else:
            # 3. crawl4ai转markdown
            proc = await process_with_crawl4ai(url, html)
            md = proc.get("markdown","") or html_to_markdown_simple(html, url)
            engine = proc.get("engine","bs4")
        # 4. 结构化抽取
        structured = extract_refund_structured(md)
        # 用 merchants.json的refund_days补全
        if structured["refund_days"] is None:
            structured["refund_days"] = merchant_entry.get("refund_days")
        rec = {
            "merchant": merchant,
            "category": category,
            "url": url,
            "title": title,
            "markdown": md[:8000],
            "engine": engine,
            "extracted": structured,
            "crawled_at": datetime.datetime.utcnow().isoformat(),
        }
        # 写markdown文件（按URL分文件，避免并发冲突）
        safe_m = re.sub(r"[^a-zA-Z0-9]", "_", merchant)[:20]
        safe_u = re.sub(r"[^a-zA-Z0-9]", "_", url.split("/")[-1])[:20] or "index"
        out_md = MARKDOWN_DIR / f"{safe_m}_{safe_u}.md"
        MARKDOWN_DIR.mkdir(parents=True, exist_ok=True)
        out_md.write_text(f"# {merchant}\n\nSource: {url}\n\n{md[:15000]}", encoding="utf-8")
        results.append(rec)
        print(f"  [{merchant}] {url} -> {len(md)} chars, {structured}")
    return results

async def main(limit: int = 0, concurrency_merchants: int = 5):
    merchants = load_merchants()
    if limit:
        merchants = merchants[:limit]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    MARKDOWN_DIR.mkdir(parents=True, exist_ok=True)
    all_results = []
    # 分批并发商户
    for i in range(0, len(merchants), concurrency_merchants):
        batch = merchants[i:i+concurrency_merchants]
        tasks = [crawl_merchant(m) for m in batch]
        batch_results = await asyncio.gather(*tasks)
        for rs in batch_results:
            all_results.extend(rs)
        print(f"Progress {min(i+concurrency_merchants, len(merchants))}/{len(merchants)} merchants, {len(all_results)} pages")
    # 写jsonl
    with open(POLICIES_JSONL, "w", encoding="utf-8") as f:
        for r in all_results:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    # 写Next.js用 — 合并seed + crawled，优先保留有内容的爬取结果
    NEXT_JSON.parent.mkdir(parents=True, exist_ok=True)
    # 先加载seed（merchants.json转的31条）
    import json as _json
    seed_path = pathlib.Path(__file__).parent.parent.parent / "src" / "lib" / "refund-policies.json"
    # 但此时seed已被覆盖，所以从merchants.json重建
    from config import load_merchants as _load_m
    seed_merchants = _load_m()
    seed_map = {m["merchant"]: {"merchant": m["merchant"], "category": m["category"], "url": m["urls"][0], "title": m["merchant"]+" Refund Policy (seed)", "markdown": m["merchant"]+" refund: "+",".join(m["urls"]), "engine":"seed", "extracted":{"refund_days":m.get("refund_days"),"refundable":True,"conditions":["within window"],"contact":m["urls"][0]}, "crawled_at":"2026-08-23T00:00:00"} for m in seed_merchants}
    # 用爬到的覆盖seed（仅当markdown>500）
    dedup = seed_map.copy()
    for r in all_results:
        m = r["merchant"]
        if len(r.get("markdown","")) > 500:
            dedup[m] = r
        elif m not in dedup:
            dedup[m] = r
    next_data = list(dedup.values())
    with open(NEXT_JSON, "w", encoding="utf-8") as f:
        _json.dump(next_data, f, ensure_ascii=False, indent=2)
    print(f"Done: {len(all_results)} pages, {len(next_data)} merchants (seed {len(seed_map)} + crawled {len(all_results)}) -> {POLICIES_JSONL} and {NEXT_JSON}")

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--limit", type=int, default=0, help="limit merchants for test")
    p.add_argument("--concurrency", type=int, default=5)
    args = p.parse_args()
    asyncio.run(main(limit=args.limit, concurrency_merchants=args.concurrency))
