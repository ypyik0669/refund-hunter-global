import asyncio, json, httpx, re
from pathlib import Path

# 9 remaining shorts
targets = ["Dropbox","AliExpress","Typeform","Bubble","ClickHouse","Trip.com","Circle","Twitch","DigitalOcean"]

async def jina(url):
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r=await c.get("https://r.jina.ai/http://"+url.replace("https://","").replace("http://",""), headers={"X-Return-Format":"markdown"})
            if r.status_code==200:
                t=r.text
                if len(t)>300:
                    return t[:8000]
    except: pass
    return ""

async def scrapling_fetch(url):
    try:
        from scrapling.fetchers import Fetcher
        loop=asyncio.get_event_loop()
        def _f():
            p=Fetcher.get(url, impersonate="chrome", stealthy_headers=True, follow_redirects=True)
            html=p.html_content if hasattr(p,'html_content') else str(p)
            # simple markdown
            from bs4 import BeautifulSoup
            soup=BeautifulSoup(html,"lxml")
            for tag in soup(["script","style","nav","footer"]):
                tag.decompose()
            text=soup.get_text(separator="\n", strip=True)
            return text[:8000]
        return await asyncio.wait_for(loop.run_in_executor(None, _f), timeout=12)
    except: return ""

async def main():
    policies=json.load(open(r"D:/refund-hunter-global/src/lib/refund-policies.json",encoding="utf-8"))
    merchants=json.load(open(r"D:/refund-hunter-global/crawler/merchants.json",encoding="utf-8"))
    m_map={m["merchant"]:m for m in merchants}
    # alternative URL pools for each short
    alt_urls={
        "Dropbox": ["https://help.dropbox.com/plans", "https://www.dropbox.com/business/terms","https://help.dropbox.com/billing", "https://www.dropbox.com/terms/business"],
        "AliExpress": ["https://www.aliexpress.com/p/buyer-protection/index.html","https://sale.aliexpress.com/__pc/buyerProtection.htm","https://www.aliexpress.com/item/100500.html"],
        "Typeform": ["https://www.typeform.com/help/billing","https://www.typeform.com/terms-of-service","https://help.typeform.com/hc/en-us"],
        "Bubble": ["https://bubble.io/pricing","https://manual.bubble.io/help-guides/billing","https://bubble.io/terms-of-service"],
        "ClickHouse": ["https://clickhouse.com/legal/terms","https://clickhouse.com/docs/billing","https://clickhouse.cloud/legal"],
        "Trip.com": ["https://www.trip.com/help/article/14086.html","https://www.trip.com/terms/","https://us.trip.com/help"],
        "Circle": ["https://circle.so/pricing","https://help.circle.so","https://www.circle.com/terms"],
        "Twitch": ["https://www.twitch.tv/p/legal/terms-of-service/","https://help.twitch.tv/s/article/how-to-request-a-refund","https://www.twitch.tv/p/legal/refund-policy/"],
        "DigitalOcean": ["https://www.digitalocean.com/pricing","https://docs.digitalocean.com/products/billing/","https://www.digitalocean.com/legal/terms-of-service-agreement"],
    }
    fixed=0
    for p in policies:
        if p["merchant"] not in targets:
            continue
        m=m_map[p["merchant"]]
        urls=m["urls"]+alt_urls.get(p["merchant"],[])
        print(f"Trying {p['merchant']} ({len(urls)} urls)...")
        best=p["markdown"]
        best_url=p["url"]
        # try jina + scrapling concurrently for all urls
        tasks=[]
        for url in urls[:6]:
            tasks.append(jina(url))
            tasks.append(scrapling_fetch(url))
        results=await asyncio.gather(*tasks)
        for url, md in zip(urls[:6]*2, results): # actually zip not correct, need flat
            pass
        # simpler: gather per url both methods and pick longest
        best_len=len(best)
        for url in urls[:6]:
            md1=await jina(url)
            md2=await scrapling_fetch(url)
            for md in [md1, md2]:
                if len(md)>best_len and len(md)>500 and ("refund" in md.lower() or "return" in md.lower() or "terms" in md.lower()):
                    best=md
                    best_url=url
                    best_len=len(md)
                    print(f"  -> {url} {len(md)} via {'jina' if md==md1 else 'scrapling'}")
        if best_len>len(p["markdown"]) and best_len>=500:
            p["markdown"]=best[:8000]
            p["url"]=best_url
            p["engine"]="fix2"
            fixed+=1
            print(f" FIXED {p['merchant']} -> {best_len}")
    json.dump(policies, open(r"D:/refund-hunter-global/src/lib/refund-policies.json","w",encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Fixed {fixed}, total good {sum(1 for x in policies if len(x['markdown'])>=500)}/{len(policies)}")

if __name__=="__main__":
    asyncio.run(main())
