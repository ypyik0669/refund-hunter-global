# Refund Policy Crawler — 全球退款政策爬虫架构

> 目标：爬全网能退款的商户政策，建成 RAG 知识库，供 Refund Hunter 判断「能不能退」

## 4框架分工（已克隆评估）

| 框架 | 定位 | 强项 | 在本项目角色 | 成本 |
|---|---|---|---|---|
| **Scrapling** | 高性能Python爬虫框架 | StealthyFetcher绕过Cloudflare、Spider并发+断点续爬、比Scrapy快 | **主力Fetch层**：并发爬500+商户的 `/refund` `/terms` `/support` 页，抗封 | 免费，本地 |
| **crawl4ai** | LLM友好爬虫 | 输出干净Markdown、fitMarkdown噪声过滤、LLM结构化抽取 | **Transform层**：HTML→Markdown→RAG，抽取「退款天数/条件」结构化字段 | 免费，本地 |
| **firecrawl** | 托管API | 96%覆盖JS重页、零配置、Search/Scrape/Crawl/Map全能力 | **备用+发现层**：JS重站兜底、批量Crawl、Search发现新商户 | 需API Key，按量 |
| **Agent-Reach** | 能力路由层 | Jina Reader免费读网页、Exa语义搜索、多后端自动切换 | **Discovery层**：Exa搜 `"<merchant> refund policy"`、Jina快速正文提取 | 免费 |

## 架构

```
[Merchant List 100+]
      │
      ├─► [Agent-Reach: Exa Search] ──► 发现退款政策URL (search "Netflix refund policy")
      │          + Jina Reader 快速验证
      │
      └─► [Scrapling Spider] ──► 并发抓取 (Stealthy, 10并发, AutoThrottle, robots.txt)
                │
                ├─ 静态页 → Fetcher (TLS指纹伪装)
                └─ 动态/Cloudflare → StealthyFetcher (headless)
                │
                ▼
      [crawl4ai] ──► HTML → clean Markdown + fitMarkdown
                │         └─► LLMExtraction: {refund_window, conditions, fee, email}
                │
                ├─► 本地存储: output/policies.jsonl + output/markdown/*.md
                │
                └─► 同步到 Next.js: src/lib/refund-policies.json (RAG)

[firecrawl] ──► JS重站兜底 (当Scrapling/crawl4ai失败时)
```

## 商户清单（100+，分5类，全球）

- **订阅**: Netflix, Spotify, YouTube Premium, Adobe CC, ChatGPT Plus, Notion, Figma, Zoom, Dropbox, Microsoft 365, Canva, Duolingo, Strava, Headspace
- **App商店**: Apple App Store, Google Play, Steam
- **电商**: Amazon, eBay, AliExpress, Shopify, Etsy, Walmart
- **旅行**: Booking.com, Airbnb, Expedia, Trip.com, Uber, Agoda, Ryanair, Emirates, Delta, United
- **支付/其他**: PayPal, Stripe, Patreon, Substack, Slack, Linear

每个商户 1-3个政策URL：`/refund`, `/return`, `/terms`, `/help`, `/support`

## 输出

- `output/policies.jsonl` — 每行 {merchant, url, title, markdown, extracted: {refund_days, refundable, contact}}
- `output/markdown/*.md` — 干净正文
- `src/lib/refund-policies.json` — Next.js RAG用
- `src/lib/refund-knowledge.ts` — 查询接口

## 调度

- 首次全量：Spider并发10，约30分钟爬完100商户
- 增量：每周跑一次，Scrapling断点续爬
- 失败重试：自动切firecrawl

## 合规

- 遵守robots.txt (Scrapling `robots_txt_obey=True`)
- 速率限制 AutoThrottle
- 仅爬公开政策页，不爬用户数据
