import asyncio, json, httpx, os

OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "")
MODEL = "stealth/ox-alpha"

async def ox_policy(merchant):
    prompt = f"""You are a refund policy expert. For "{merchant}", provide its refund policy in JSON:
{{"merchant":"{merchant}","refund_days":14,"refundable":true,"conditions":["within window"],"contact":"support@{merchant.lower().replace(' ','')}.com","url":"https://{merchant.lower().replace(' ','')}.com/terms","summary":"Refund within X days..."}}
Base on real knowledge if known, else infer typical SaaS 14-day goodwill. Return ONLY JSON, no extra text."""
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post("https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENROUTER_KEY}", "Content-Type":"application/json"},
                json={"model": MODEL, "messages":[{"role":"user","content":prompt}], "max_tokens":400, "temperature":0.2})
            if r.status_code==200:
                j=r.json()
                content=j["choices"][0]["message"]["content"] or j["choices"][0]["message"].get("reasoning","")
                # extract JSON
                import re
                m=re.search(r"\{.*\}", content, re.S)
                if m:
                    return json.loads(m.group(0))
    except Exception as e:
        print(f"ox fail {merchant}: {e}")
    return None

async def main():
    cold = ["Logseq","Akkiflow","Motion","Clockwise","Walling","Kinopio","Scrintal","Anytype","AFFiNE","Capacities","Craft Docs"]
    # Actually test the 11 generic from previous run
    cold = ["Logseq","Akkiflow","Motion","Clockwise","Walling","Kinopio","Scrintal","Anytype","AFFiNE","Roam Research","Craft Docs"]
    for m in cold:
        print(f"Trying {m} via ox-alpha...")
        res = await ox_policy(m)
        if res:
            print(f" -> {res}")
        else:
            print(f" -> no result")
        await asyncio.sleep(0.5)

if __name__=="__main__":
    asyncio.run(main())
