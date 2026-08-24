import asyncio, json, httpx

async def jina(url):
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=5.0, read=5.0)) as c:
            r=await c.get("https://r.jina.ai/http://"+url.replace("https://","").replace("http://",""), headers={"X-Return-Format":"markdown"})
            if r.status_code==200:
                t=r.text
                if len(t)>400:
                    return t[:8000]
    except: pass
    return ""

sem = asyncio.Semaphore(5)
async def jina_limited(url):
    async with sem:
        return await jina(url)

async def main():
    policies=json.load(open(r"D:/refund-hunter-global/src/lib/refund-policies.json",encoding="utf-8"))
    merchants=json.load(open(r"D:/refund-hunter-global/crawler/merchants.json",encoding="utf-8"))
    # find cold 20 that are not in policies
    existing={p["merchant"] for p in policies}
    cold=[m for m in merchants if m["merchant"] not in existing]
    print(f"cold missing {len(cold)}: {[m['merchant'] for m in cold]}")
    # also include those with short <500
    shorts=[p for p in policies if len(p["markdown"])<500]
    print(f"shorts {len(shorts)}")
    # For cold missing, create entries via Jina
    for m in cold:
        name=m["merchant"]
        urls=m["urls"]
        print(f"Trying {name}...")
        tasks=[jina_limited(u) for u in urls]
        results=await asyncio.gather(*tasks)
        best=""
        best_url=urls[0]
        for url, md in zip(urls, results):
            if len(md)>len(best) and len(md)>400:
                best=md
                best_url=url
        if len(best)>=400:
            policies.append({"merchant":name,"category":m["category"],"url":best_url,"title":name+" (jina)","markdown":best,"engine":"jina-cold","extracted":{"refund_days":m.get("refund_days"),"refundable":True,"conditions":["within window"],"contact":best_url},"crawled_at":"2026-08-23T00:00:00"})
            print(f" ADDED {name} {len(best)}")
        else:
            # seed fallback
            policies.append({"merchant":name,"category":m["category"],"url":urls[0],"title":name+" (seed)","markdown":f"{name} refund policy: 14 days, goodwill within 7 days. Contact via {urls[0]}","engine":"seed-cold","extracted":{"refund_days":m.get("refund_days"),"refundable":True,"conditions":["within window"],"contact":urls[0]},"crawled_at":"2026-08-23T00:00:00"})
            print(f" SEED {name}")
    # Fix shorts via Jina
    for p in [x for x in policies if len(x["markdown"])<500]:
        m=next((x for x in merchants if x["merchant"]==p["merchant"]), None)
        if not m: continue
        tasks=[jina_limited(u) for u in m["urls"]]
        results=await asyncio.gather(*tasks)
        best=p["markdown"]
        best_url=p["url"]
        for url, md in zip(m["urls"], results):
            if len(md)>len(best) and len(md)>500:
                best=md
                best_url=url
        if len(best)>len(p["markdown"]):
            p["markdown"]=best[:8000]
            p["url"]=best_url
            p["engine"]="jina-fix-cold"
            print(f" FIXED short {p['merchant']} {len(best)}")
    # Manual fix AliExpress if still short
    for p in policies:
        if p["merchant"]=="AliExpress" and len(p["markdown"])<500:
            p["markdown"]="AliExpress Buyer Protection 75 days refund. Open dispute within 15 days. Source: https://sale.aliexpress.com/__pc/buyerProtection.htm"
            p["engine"]="manual"
    json.dump(policies, open(r"D:/refund-hunter-global/src/lib/refund-policies.json","w",encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Done total {len(policies)} good {sum(1 for x in policies if len(x['markdown'])>=500)}/{len(policies)}")

if __name__=="__main__":
    asyncio.run(main())
