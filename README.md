# Refund Hunter Global — AI 帮我退钱

> **Drop any receipt. We find your money back.**  
> 丢进来，我帮你找出能退的钱。全球可用，免费检测，成功才收15%。

[![Next.js](https://img.shields.io/badge/Next.js-16-black)]()
[![Global](https://img.shields.io/badge/Global-EN%2BZH%2BES%2FFR%2FDE%2FJA-emerald)]()
[![License](https://img.shields.io/badge/License-MIT-zinc)]()

## 一句话

用户把 **Invoice / Receipt / Email / Screenshot** 丢进来，AI自动判断 **有没有退款可能**，生成 **退款申请/客服话术**，成功后抽 **15%**（$5-$50封顶，$2以下免费）。

**3个全球通用模式**（不依赖本地法律）：
- **Duplicate 重复扣款** — 92%成功率
- **Renewal 意外续费** — 3天内85%成功率
- **Price Drop 价格保护** — 酒店/机票/电商差价

---

## 在线体验

```bash
npm install
npm run dev
# http://localhost:3000
```

- `/` — Landing + 上传
- `/app` — 主应用
- `/pricing` — 15%定价页
- `/tools` — 免费工具站引流（Image/PDF/JSON）
- `/api/analyze` — POST {text, fileName} → {analysis, tpl}

**示例测试：**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Netflix $15.99 duplicate charge on 2026-08-22"}'
```

---

## 技术栈

| 层 | 选型 | 成本 |
|---|---|---|
| Frontend | Next.js 16 App Router + Tailwind 4 + shadcn | $0 |
| OCR | Claude Vision (Haiku $0.25/$1.25) + Tesseract fallback | $0.003/次 |
| LLM | Claude 3.5 Haiku (分类) + Sonnet (生成) | 按量 |
| DB | Supabase 500MB免费 | $0 |
| Pay | LemonSqueezy (全球税务) / Stripe | 2.9%+30¢ |
| Deploy | Vercel | 免费 |
| Email | Resend 3K/月免费 | $0 |

**总起步成本 $21.67/月，1个付费用户回本。**

---

## 项目结构

```
refund-hunter-global/
├── docs/
│   ├── 暴利工具深度研究报告.md  # 4大原型+Top10评分+竞品
│   └── PRD_Global_Lite.md       # 全球版PRD
├── src/
│   ├── app/
│   │   ├── page.tsx             # Landing
│   │   ├── app/page.tsx         # App
│   │   ├── pricing/page.tsx
│   │   ├── tools/               # 3个引流工具站
│   │   └── api/analyze/route.ts
│   ├── lib/
│   │   ├── refund-engine.ts     # 核心判定引擎
│   │   └── templates.ts         # EN+ZH话术模板
│   └── components/
│       ├── UploadZone.tsx
│       └── ResultCard.tsx
└── package.json
```

---

## 核心引擎

`src/lib/refund-engine.ts` — 纯前端规则引擎，生产可无缝替换为Claude Vision：

```ts
analyzeRefund(text, fileName) → { score: 0-100, category, reason, details }
generateTemplates(analysis) → { subject, body, chatScript, subjectZh, bodyZh }
```

**评分规则：**
- Duplicate +40, <7天+30
- Renewal 3天内+50, 7天内+30
- Price Drop <24h+40
- <$5 -10

---

## 部署

### Vercel一键部署

1. Fork后导入Vercel
2. 环境变量（可选，MVP无需）：
```
ANTHROPIC_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://refundhunter.global
```
3. 绑定域名，提交sitemap到GSC

### 环境变量

```bash
cp .env.example .env.local
```

### 免费工具SEO

- 每个工具页已含 TDK + Schema JSON-LD
- 构建时自动生成 sitemap
- 关键词：`compress image`, `pdf to word`, `json formatter` (KD<20)

---

## 变现

**漏斗：** 100访问 → 30上传 → 20高概率 → 10发送 → 3成功 → 1付费15%

**模型：** 100单×$40×15% = $600/月起步，AirHelp €32B未领赔偿在35%抽成下仍有300万用户。

- $20退款 → 收$3
- $100退款 → 收$15
- $600航班 → 收$50封顶

**收款：** 用户上传退款到账截图 → 人工审核 → LemonSqueezy链接（v1不自动分账，避免逃单）

---

## 合规

- **只生成，不代发** — 我们不登录你账号，不冒充
- **Authorization** — 用户勾选授权书模板
- **隐私** — 文件7天自动删，GDPR合规
- **免责** — Not a law firm, templates are not legal advice

---

## 路线图

- [x] v1.0 Global Lite — Duplicate/Renewal/Price Drop + EN/ZH
- [ ] v1.1 Country Pack — EU261航班, UK DMCCA 14天
- [ ] v1.2 Gmail一键导入 + 自动监控 (Axel模式)
- [ ] v1.3 Chrome插件

---

## 文档

- [深度研究报告](docs/暴利工具深度研究报告.md)
- [PRD Global Lite](docs/PRD_Global_Lite.md)

---

*Built with vibe coding — 3 weeks to MVP, $100 total cost.*
