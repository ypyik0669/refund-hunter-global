import json, asyncio, httpx, pathlib

JINA = "https://r.jina.ai/http://"

async def jina_fetch(url):
    try:
        async with httpx.AsyncClient(timeout=12) as c:
            r = await c.get(JINA + url.replace("https://","").replace("http://",""), headers={"X-Return-Format":"markdown"})
            if r.status_code==200:
                t=r.text
                if len(t)>400 and "refund" in t.lower() or "return" in t.lower() or "terms" in t.lower():
                    return t[:8000]
                elif len(t)>800:
                    return t[:8000]
    except: pass
    return ""

async def fix():
    policies=json.load(open(r"D:/refund-hunter-global/src/lib/refund-policies.json",encoding="utf-8"))
    merchants=json.load(open(r"D:/refund-hunter-global/crawler/merchants.json",encoding="utf-8"))
    m_map={m["merchant"]:m for m in merchants}
    fixed=0
    shorts=[p for p in policies if len(p["markdown"])<500]
    print(f"Fixing {len(shorts)} shorts concurrently...")
    async def fix_one(p):
        nonlocal fixed
        m=m_map.get(p["merchant"])
        if not m: return
        # try all URLs concurrently
        tasks=[jina_fetch(url) for url in m["urls"]]
        results=await asyncio.gather(*tasks)
        best_md=p["markdown"]
        best_len=len(best_md)
        best_url=p["url"]
        for url, md in zip(m["urls"], results):
            if len(md)>best_len and len(md)>400:
                best_md=md
                best_url=url
                best_len=len(md)
        if best_len>=500 and best_len>len(p["markdown"]):
            p["markdown"]=best_md[:8000]
            p["url"]=best_url
            p["engine"]="jina-fix"
            p["title"]=p["merchant"]+" (jina)"
            fixed+=1
            print(f" FIXED {p['merchant']} {best_url} {best_len}")

    await asyncio.gather(*[fix_one(p) for p in shorts])
    # second pass for still shorts with heuristic
    still=[p for p in policies if len(p["markdown"])<500]
    print(f"Still shorts {len(still)}, trying heuristic...")
    async def fix_heuristic(p):
        nonlocal fixed
        merchant=p["merchant"]
        slug=merchant.lower().replace(" ","").replace(".","").replace("-","")
        urls=[]
        for domain in [f"{slug}.com", f"help.{slug}.com"][:1]:
            for path in ["/refund", "/terms", "/legal/terms"][:2]:
                urls.append(f"https://{domain}{path}")
        results=await asyncio.gather(*[jina_fetch(u) for u in urls])
        for url, md in zip(urls, results):
            if len(md)>len(p["markdown"]) and len(md)>500 and ("refund" in md.lower() or "return" in md.lower()):
                p["markdown"]=md[:8000]
                p["url"]=url
                p["engine"]="jina-heuristic"
                fixed+=1
                print(f" HEURISTIC {merchant} {url} {len(md)}")
                break

    await asyncio.gather(*[fix_heuristic(p) for p in still])
    json.dump(policies, open(r"D:/refund-hunter-global/src/lib/refund-policies.json","w",encoding="utf-8"), ensure_ascii=False, indent=2)
    json.dump(policies, open(r"D:/refund-hunter-global/crawler/output/policies_fixed.json","w",encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Fixed {fixed}, total good {sum(1 for x in policies if len(x['markdown'])>=500)}/{len(policies)}")

if __name__=="__main__":
    asyncio.run(fix())
