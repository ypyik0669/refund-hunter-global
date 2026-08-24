import asyncio, json
import sys
sys.path.insert(0, "refund_crawler")
from refund_crawler.pipeline import crawl_merchant
from refund_crawler.config import load_merchants, OUTPUT_DIR, MARKDOWN_DIR, POLICIES_JSONL, NEXT_JSON
import pathlib

async def main():
    merchants = load_merchants()
    cold = merchants[-20:]  # last 20 added
    print(f"Crawling cold 20: {[m['merchant'] for m in cold]}")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    MARKDOWN_DIR.mkdir(parents=True, exist_ok=True)
    # Load existing policies
    existing = json.load(open(NEXT_JSON, encoding="utf-8"))
    existing_map = {p["merchant"]: p for p in existing}
    all_new = []
    for m in cold:
        res = await crawl_merchant(m)
        all_new.extend(res)
        # update existing_map if better
        for r in res:
            if len(r["markdown"]) > len(existing_map.get(r["merchant"], {}).get("markdown","")) and len(r["markdown"])>400:
                existing_map[r["merchant"]] = r
                print(f" UPDATED {r['merchant']} {len(r['markdown'])}")
            elif r["merchant"] not in existing_map:
                existing_map[r["merchant"]] = r
    # also load all previous policies.jsonl and merge
    # write back
    final = list(existing_map.values())
    # ensure all merchants from json are in final (with seed fallback if missing)
    for m in merchants:
        if m["merchant"] not in existing_map:
            final.append({"merchant": m["merchant"], "category": m["category"], "url": m["urls"][0], "title": m["merchant"]+" (seed)", "markdown": m["merchant"]+" refund", "engine":"seed", "extracted":{"refund_days":m.get("refund_days"),"refundable":True,"conditions":["within window"],"contact":m["urls"][0]}, "crawled_at":"2026-08-23T00:00:00"})
    json.dump(final, open(NEXT_JSON,"w",encoding="utf-8"), ensure_ascii=False, indent=2)
    # append to policies.jsonl
    with open(POLICIES_JSONL, "a", encoding="utf-8") as f:
        for r in all_new:
            f.write(json.dumps(r, ensure_ascii=False)+"\n")
    print(f"Done cold 20: {len(all_new)} pages, total merchants {len(final)}, good {sum(1 for x in final if len(x['markdown'])>=500)}/{len(final)}")

if __name__=="__main__":
    asyncio.run(main())
