# 部署清单 — Refund Hunter Global

## 本地验证（已通过）

```bash
npm install
npm run build  # ✓ Compiled successfully
npm run dev    # http://localhost:3000 200 OK
curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d '{"text":"Netflix renewal"}' # 200
```

所有路由 200：
- / 
- /app
- /pricing
- /tools
- /tools/image-compress
- /tools/json-formatter
- /tools/pdf-tools
- /api/analyze

## Vercel部署（推荐，免费）

1. 推送到GitHub
   ```bash
   git init
   git add .
   git commit -m "feat: refund hunter global lite v1"
   git branch -M main
   git remote add origin https://github.com/YOUR/refund-hunter-global.git
   git push -u origin main
   ```

2. Vercel导入
   - https://vercel.com/new 选仓库
   - Framework: Next.js
   - Build Command: `npm run build`
   - 不填环境变量也能跑（MVP纯前端）

3. 绑定域名
   - refundhunter.global / refundhunter.cn
   - 自动HTTPS

4. 生产环境变量（可选）
   - `ANTHROPIC_API_KEY` — 接Claude Vision后OCR更准
   - `NEXT_PUBLIC_SUPABASE_URL` — 存任务
   - `LEMONSQUEEZY_API_KEY` — 收15%

## SEO提交

- 生成sitemap：Next.js自动 `/sitemap.xml`
- 提交到 Google Search Console + Bing
- 每个工具页已含：
  - `<title>` 含关键词 `compress image` / `pdf to word` / `json formatter`
  - `description` + `Schema.org JSON-LD`
  - OG/Twitter Card

## 运营冷启动（0成本）

1. Reddit: r/personalfinance, r/subscriptions 发 "I built a free tool to find refunds"
2. 知乎: 回答 "Netflix如何退款" 贴工具链接
3. Product Hunt: 免费工具猎人
4. 工具站互导：每个工具底部挂 `Found money? → Refund Hunter`

## 成本

- Vercel: $0
- Supabase: $0 (500MB)
- Resend: $0 (3K/月)
- 域名: $10/年
- API: $0.003/次，$20/月起步
- **1个年费退款（$29×15%=$4.35）即回本**

## 监控

- Vercel Analytics 免费
- Sentry (可选) 接错误
- 每周看 GSC 关键词排名

## 下一步

- 接Claude Vision：替换 `src/lib/refund-engine.ts` 的 `parseOcrFromText` 为真实API
- 接Supabase：替换localStorage为DB
- 接LemonSqueezy：审核后生成支付链接
