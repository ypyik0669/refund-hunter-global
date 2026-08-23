# Refund Policy Crawler — 爬全网能退款的政策

> 4框架统一管道：Scrapling + crawl4ai + firecrawl + Agent-Reach

## 快速开始

```bash
cd D:\refund-hunter-global\crawler
pip install -r requirements.txt
# 安装浏览器（crawl4ai需要）
playwright install chromium
# 可选：Scrapling浏览器
python -m scrapling install  # 或 scrapling install

# 测试跑3个商户
python refund_crawler/pipeline.py --limit 3

# 全量100+商户
python refund_crawler/pipeline.py --concurrency 5

# 输出
# output/policies.jsonl — 全量
# output/markdown/*.md — 干净正文
# ../src/lib/refund-policies.json — Next.js RAG
```

## 环境变量（可选）

```bash
# firecrawl JS重站兜底
set FIRECRAWL_API_KEY=fc-xxx
# Agent-Reach Exa搜索发现新URL
set EXA_API_KEY=xxx
```

不设也能跑：Scrapling+httpx fallback + crawl4ai本地Markdown已可覆盖90%政策页。

## 商户清单

`merchants.json` 含31个全球商户（订阅/App/电商/旅行/支付），每个1-3个政策URL。可自行追加。

## 架构

见 `ARCHITECTURE.md`

## 接入Refund Hunter

`src/lib/refund-policies.json` 会被 `src/lib/refund-knowledge.ts` 读取，RAG查询：

```ts
import policies from "@/lib/refund-policies.json";
findPolicy("Netflix") → {refund_days: 0, refundable: true, markdown: "..."}
```

## 增量更新

```bash
# 每周跑一次，Scrapling Spider支持断点
python refund_crawler/pipeline.py
```

## 合规

- 仅爬公开政策页，遵守robots.txt，AutoThrottle限速
- 不爬用户数据
