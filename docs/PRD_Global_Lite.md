# PRD - AI Refund Hunter Global Lite

> **产品名**：Refund Hunter Global / 帮我退钱·全球版  
> **Slogan**：Drop any receipt. We find your money back. 丢进来，我帮你找出能退的钱。  
> **版本**：v1.0 Global Lite | 2026-08-23  
> **目标**：3周上线，全球可用，0法条依赖，15%成功费

---

## 1. 产品概述

### 1.1 一句话
用户把 **Invoice / Receipt / Email / Screenshot** 丢进来，AI自动判断 **有没有退款可能**，生成 **退款申请/客服话术**，成功后抽 **15%**。

### 1.2 为什么做全球版
- 全球痛点：订阅陷阱、重复扣款、价格保护是各国通病，不依赖本地法律
- 全球输入：发票长得都一样，OCR多语言通用
- 全球输出：英文退款邮件模板全球商户都认
- 全球支付：LemonSqueezy/Paddle处理各国税务，收美元

### 1.3 非目标（v1不做）
- ❌ 自动登录邮箱代发（冒充风险）
- ❌ 自动打电话（合规+成本）
- ❌ EU261/DMCCA等地域法条（作为Country Pack v2）
- ❌ 自动分账（先人工审核截图）

---

## 2. 用户与场景

### 2.1 核心用户
- 全球订阅用户：Netflix, Spotify, Adobe, ChatGPT, Notion, Zoom 被意外续费
- 电商买家：重复扣款、错误收费
- 旅行者：机票酒店降价后想追差价

### 2.2 用户故事

| 场景 | 输入 | AI判断 | 输出 |
|---|---|---|---|
| Netflix被续费 | 账单截图 $15.99 | Accidental renewal, 3天内, 可退概率85% | 英文邮件模板 + 在线chat话术 |
| 航班酒店降价 | 酒店确认邮件 | Price drop 12%, 可追$40 | 改价申请模板 |
| App重复扣款 | Apple收据×2 | Duplicate charge, 100%可退 | Apple退款链接+话术 |
| 电商多收 | 账单 vs 实付 | Overcharge $20 | 商家客服模板 |
| 保修期内 | 购买凭证+故障图 | Warranty eligible | 保修申请模板 |

---

## 3. 功能需求

### 3.1 核心流程

```
[上传] → [OCR/解析] → [分类] → [概率评分] → [生成话术] → [用户发送] → [上传退款凭证] → [审核抽成]
  1        2           3         4           5            6              7              8
```

**Step 1 上传**
- 支持：JPG/PNG/PDF, Email粘贴, 截图
- 限制：10MB, 1次1-5张
- 交互：拖拽 + 点击 + 粘贴

**Step 2 OCR/解析**
- 引擎：Claude Vision (主) / GPT-4o-mini (备) + Tesseract fallback
- 提取：商户, 金额, 日期, 订单号, 支付方式, 订阅周期
- 多语言：en/zh/es/fr/de/ja 自动识别

**Step 3 分类（全球3类）**

| 类别 | 关键词信号 | 全球通用理由 |
|---|---|---|
| Duplicate | 同商户同金额24h内2次 | System error, double billing |
| Renewal | trial→paid, annual renewal, "renewal" | Forgot to cancel, accidental renewal |
| Price Drop | 酒店/机票/电商，价格对比 | Price protection, found lower price |
| Overcharge | 金额不符, 额外费用 | Incorrect charge |
| Warranty | 购买日期+故障 | Warranty claim |

**Step 4 概率评分 0-100%**

| 分数 | 含义 | 展示 |
|---|---|---|
| 80-100 | 极高 - 重复扣款/24h内 | 绿色 + "Highly refundable" |
| 60-79 | 高 - 意外续费3天内 | 蓝色 + "Likely refundable" |
| 40-59 | 中 - 价格保护期内 | 黄色 + "Worth trying" |
| 0-39 | 低 - 超期/已使用 | 灰色 + "Low chance" |

规则：
- Duplicate：+40分，<7天+30分
- Renewal：3天内+50分，7天内+30分，30天内+10分
- Price Drop：<24h +40分，7天内+20分
- 金额<$5 -10分（客服不受理）

**Step 5 生成话术**
- 模板：英文主模板 + 用户语言翻译
- 包含：Subject, Body, 订单号, 金额, 礼貌请求, 威胁升级（"consider chargeback" 轻度）
- 2种：Email正式版 + Live Chat简短版
- 复制按钮 + Gmail一键打开

**Step 6 用户发送**
- 提示：提供商户客服邮箱/链接（静态库）
- 免责：这是模板，需你自己发送，我们不代发

**Step 7-8 变现**
- 用户上传退款到账截图（Stripe/银行/PayPal）
- 后台人工审核（v1），通过后生成LemonSqueezy支付链接 15%
- $5封底 $50封顶，小额$2以下不收

### 3.2 页面结构

```
/                 Landing + 上传
/app              主应用（上传→结果）
/app/result/:id   结果页（评分+话术）可分享
/success          成功案例墙（SEO）
/tools            工具站导流
/pricing          定价：Free to check, 15% on success
/about            How it works, 免责
```

### 3.3 多语言

- UI：en主，zh/es/fr/de/ja切换（Next-intl）
- 话术：始终生成英文 + 用户语言对照
- SEO：/en /zh 目录

---

## 4. 非功能

- **性能**：OCR <5s, 生成 <3s
- **隐私**：上传文件7天自动删，不存PII到第三方，符合GDPR
- **安全**：文件类型校验, 10MB limit, 速率限制
- **可用**：Vercel部署，99.9%

---

## 5. 技术方案

```
Frontend: Next.js 14 App Router + Tailwind + shadcn
OCR: Claude Vision API (Haiku $0.25/$1.25) / Tesseract.js fallback
LLM: Claude 3.5 Haiku (分类) + Sonnet (生成)
DB: Supabase (免费500MB) - 存储任务+结果
Auth: Supabase Auth / NextAuth
Pay: LemonSqueezy (全球税务) / Stripe
Deploy: Vercel (免费)
Email: Resend (免费3K/月)
Analytics: Plausible / PostHog
```

**数据库表**

```sql
tasks (id, user_id, files, ocr_text, category, score, reason, created_at)
templates (id, task_id, email_subject, email_body, chat_script, lang)
refunds (id, task_id, amount, proof_url, status: pending/approved/rejected, fee)
users (id, email, locale)
```

---

## 6. 运营与增长

**冷启动**
- Reddit: r/personalfinance, r/assholedesign, r/subscriptions 发 "I built a tool to find refunds"
- 知乎/小红书：回答"如何退款Netflix/Adobe"
- Product Hunt：Free tool hunt
- 工具站SEO：`how to get refund for [Netflix]` 长尾

**转化漏斗**
```
100访问 → 30上传 → 20高概率 → 10发送 → 3成功 → 1付费(15%)
```

**里程碑**
- W1：MVP上线，50种子用户，验证>10%发送率
- M1：500上传，50成功案例，$300/月
- M2：加Country Pack (EU261)，$2000/月

---

## 7. 验收标准

- [ ] 上传JPG/PDF 5s内出结果
- [ ] 3类分类准确率>85%（20个测试用例）
- [ ] 复制话术可用，直接发给客服能用
- [ ] 移动端适配
- [ ] 隐私提示 + Authorization勾选

---

## 8. 风险

| 风险 | 缓解 |
|---|---|
| 冒充法律风险 | 只生成，不代发；用户勾选授权书 |
| 商户拒绝 | 话术含升级路径，提示chargeback |
| 恶意上传 | 文件校验+限流 |
| 抽成逃单 | 先展示价值，再收小额；高概率才提示付费 |

---

*下一步：按此PRD脚手架Next.js*
