import json, pathlib

base = json.load(open("merchants.json", encoding="utf-8"))
existing = {x["merchant"].lower() for x in base}

# 70+ 新增冷门/长尾，保证全球各品类
extra = [
  # AI
  ("Perplexity", "subscription", ["https://www.perplexity.ai/hub/legal/terms-of-service", "https://www.perplexity.ai/help-center"], 14),
  ("Midjourney", "subscription", ["https://docs.midjourney.com/docs/terms-of-service", "https://www.midjourney.com/legal/terms"], 14),
  ("Runway", "subscription", ["https://runwayml.com/terms-of-use", "https://help.runwayml.com"], 14),
  ("Pika", "subscription", ["https://pika.art/terms", "https://pika.art/privacy"], 14),
  ("Jasper", "subscription", ["https://www.jasper.ai/legal/terms", "https://help.jasper.ai"], 7),
  ("Copy.ai", "subscription", ["https://www.copy.ai/terms", "https://help.copy.ai"], 7),
  ("Replicate", "subscription", ["https://replicate.com/terms", "https://replicate.com/docs"], 14),
  ("Hugging Face", "subscription", ["https://huggingface.co/terms-of-service", "https://huggingface.co/docs/hub/security-tos"], 14),
  ("Anthropic", "subscription", ["https://www.anthropic.com/legal/consumer-terms", "https://support.anthropic.com"], 14),
  ("Character.AI", "subscription", ["https://character.ai/tos", "https://character.ai/privacy"], 7),
  # Dev/SaaS
  ("Vercel", "subscription", ["https://vercel.com/legal/terms", "https://vercel.com/support/articles/refunds"], 14),
  ("Netlify", "subscription", ["https://www.netlify.com/legal/terms-of-use/", "https://docs.netlify.com/billing/manage-billing/"], 14),
  ("Supabase", "subscription", ["https://supabase.com/terms", "https://supabase.com/docs/guides/platform/billing"], 14),
  ("Railway", "subscription", ["https://railway.app/legal/terms", "https://docs.railway.app/reference/pricing/refunds"], 14),
  ("Render", "subscription", ["https://render.com/terms", "https://docs.render.com/billing"], 14),
  ("PlanetScale", "subscription", ["https://planetscale.com/legal/terms", "https://planetscale.com/docs/billing"], 14),
  ("GitHub", "subscription", ["https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-copilot/about-billing-for-github-copilot", "https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"], 14),
  ("GitLab", "subscription", ["https://about.gitlab.com/terms/", "https://docs.gitlab.com/subscriptions/"], 14),
  ("Bitbucket", "subscription", ["https://www.atlassian.com/legal/cloud-terms-of-service", "https://support.atlassian.com/billing/"], 14),
  ("Linear", "subscription", ["https://linear.app/terms", "https://linear.app/pricing"], 14),
  ("Miro", "subscription", ["https://miro.com/legal/terms-of-service/", "https://help.miro.com/hc/en-us/articles/360020675533"], 14),
  ("Monday", "subscription", ["https://monday.com/terms/tos", "https://support.monday.com/hc/en-us/articles/360002546300"], 14),
  ("Asana", "subscription", ["https://asana.com/terms", "https://asana.com/guide/help/premium/billing"], 14),
  ("Trello", "subscription", ["https://www.atlassian.com/legal/cloud-terms-of-service", "https://support.atlassian.com/trello/"], 14),
  ("ClickUp", "subscription", ["https://clickup.com/terms", "https://help.clickup.com/hc/en-us/articles/6300301843342"], 14),
  ("Loom", "subscription", ["https://www.loom.com/terms", "https://support.loom.com/hc/en-us/articles/360002708834"], 14),
  ("Calendly", "subscription", ["https://calendly.com/terms", "https://help.calendly.com/hc/en-us/articles/223195628"], 14),
  ("Typeform", "subscription", ["https://www.typeform.com/terms-service", "https://www.typeform.com/help/billing/"], 14),
  ("Intercom", "subscription", ["https://www.intercom.com/legal/terms-and-policies", "https://www.intercom.com/help/en/articles/180-billing"], 14),
  ("Zendesk", "subscription", ["https://www.zendesk.com/company/agreements-and-terms/terms-of-use/", "https://support.zendesk.com/hc/en-us/articles/4408883018903"], 14),
  ("Framer", "subscription", ["https://www.framer.com/legal/terms-of-service/", "https://www.framer.com/help/"], 14),
  ("Webflow", "subscription", ["https://webflow.com/legal/terms", "https://help.webflow.com/hc/en-us/articles/33961289368723"], 14),
  ("Bubble", "subscription", ["https://bubble.io/terms", "https://manual.bubble.io/help-guides/billing"], 14),
  ("Airtable", "subscription", ["https://www.airtable.com/company/tos", "https://support.airtable.com/docs/billing"], 14),
  ("ClickHouse", "subscription", ["https://clickhouse.com/legal/agreement", "https://clickhouse.com/docs/billing"], 14),
  ("Datadog", "subscription", ["https://www.datadoghq.com/legal/terms/", "https://docs.datadoghq.com/billing/"], 14),
  ("New Relic", "subscription", ["https://newrelic.com/termsandconditions/terms", "https://docs.newrelic.com/docs/billing/"], 14),
  # Ecommerce
  ("Etsy", "ecommerce", ["https://www.etsy.com/legal/policy", "https://www.etsy.com/help/article/9"], 14),
  ("Shopify Plus", "ecommerce", ["https://www.shopify.com/legal/terms", "https://help.shopify.com/en/manual/your-account/manage-billing"], 14),
  ("Walmart", "ecommerce", ["https://www.walmart.com/help/article/return-policy/90c57665d354452086a3ea362f6197db", "https://www.walmart.com/help/article/walmart-refund-policy"], 30),
  ("Target", "ecommerce", ["https://www.target.com/c/returns/-/N-mh8a2", "https://help.target.com/help/subcategoryarticle?childcat=Returns"], 30),
  ("Best Buy", "ecommerce", ["https://www.bestbuy.com/site/misc/finance-rewards/best-buy-return-exchange/pcmcat260800050014.c", "https://www.bestbuy.com/site/help-topics/best-buy-return-policy/pcmcat260800050014.c"], 14),
  ("Shein", "ecommerce", ["https://www.shein.com/return-policy-a-281.html", "https://www.shein.com/terms-and-conditions-a-399.html"], 30),
  ("Temu", "ecommerce", ["https://www.temu.com/return-policy.html", "https://www.temu.com/terms.html"], 30),
  # Travel more
  ("Trip.com", "travel", ["https://www.trip.com/help/article/cancellation-policy-14086.html", "https://www.trip.com/terms/"], 7),
  ("Agoda", "travel", ["https://www.agoda.com/info/agoda-terms.html", "https://www.agoda.com/en-gb/cancellation"], 7),
  ("Skyscanner", "travel", ["https://www.skyscanner.com/terms", "https://www.skyscanner.net/help"], 7),
  ("Klook", "travel", ["https://www.klook.com/en-US/terms/", "https://www.klook.com/en-US/help/"], 7),
  ("GetYourGuide", "travel", ["https://www.getyourguide.com/terms-and-conditions/", "https://www.getyourguide.com/cancellation-policy/"], 7),
  # Payment
  ("Stripe", "payment", ["https://stripe.com/legal/ssa", "https://stripe.com/resources/refunds"], 14),
  ("LemonSqueezy", "payment", ["https://www.lemonsqueezy.com/terms", "https://docs.lemonsqueezy.com/help/billing/refunds"], 14),
  ("Paddle", "payment", ["https://www.paddle.com/legal/terms", "https://www.paddle.com/help/sell/billing"], 14),
  ("Gumroad", "payment", ["https://gumroad.com/terms", "https://help.gumroad.com/article/67-gumroad-refund-policy"], 14),
  # Niche
  ("Teachable", "subscription", ["https://support.teachable.com/en/articles/1190889-refund-policy", "https://teachable.com/terms-of-use"], 14),
  ("Kajabi", "subscription", ["https://kajabi.com/policies/terms", "https://help.kajabi.com/hc/en-us/articles/360037151054"], 14),
  ("Thinkific", "subscription", ["https://www.thinkific.com/terms", "https://support.thinkific.com/hc/en-us/articles/360030355654"], 14),
  ("Podia", "subscription", ["https://www.podia.com/terms", "https://help.podia.com/en/articles/1150011"], 14),
  ("Circle", "subscription", ["https://circle.so/legal/terms", "https://community.circle.so/help"], 14),
  ("Discord Nitro", "subscription", ["https://discord.com/terms", "https://support.discord.com/hc/en-us/articles/360012668831"], 7),
  ("Twitch", "subscription", ["https://www.twitch.tv/p/legal/terms-of-service/", "https://help.twitch.tv/s/article/how-to-request-a-refund"], 14),
  ("OnlyFans", "subscription", ["https://onlyfans.com/terms", "https://onlyfans.com/help"], 7),
  ("Patreon", "payment", ["https://www.patreon.com/policy/legal", "https://support.patreon.com/hc/en-us/articles/360004058731-Refunds"], 30),
  # Extend obscure
  ("Namecheap", "subscription", ["https://www.namecheap.com/legal/general/terms-of-service/", "https://www.namecheap.com/help-center/returns/"], 14),
  ("GoDaddy", "subscription", ["https://www.godaddy.com/legal/agreements", "https://www.godaddy.com/help/refunds-1234"], 14),
  ("Cloudflare", "subscription", ["https://www.cloudflare.com/terms/", "https://support.cloudflare.com/hc/en-us/articles/200168156"], 14),
  ("DigitalOcean", "subscription", ["https://www.digitalocean.com/terms", "https://docs.digitalocean.com/products/billing/"], 14),
  ("Heroku", "subscription", ["https://www.heroku.com/policy/tos", "https://help.heroku.com/billing"], 14),
  ("Framer", "subscription", ["https://www.framer.com/legal/terms-of-service/", "https://www.framer.com/help/"], 14),
  ("Whimsical", "subscription", ["https://whimsical.com/terms", "https://help.whimsical.com"], 14),
  ("Mural", "subscription", ["https://www.mural.co/terms", "https://support.mural.co"], 14),
  ("Balsamiq", "subscription", ["https://balsamiq.com/company/terms/", "https://balsamiq.com/wireframes/cloud/billing/"], 14),
]

added = 0
for name, cat, urls, days in extra:
    if name.lower() in existing:
        continue
    base.append({"merchant": name, "category": cat, "urls": urls, "refund_days": days})
    existing.add(name.lower())
    added += 1

# 去重后
print(f"added {added}, total {len(base)}")
json.dump(base, open("merchants.json","w",encoding="utf-8"), ensure_ascii=False, indent=2)
