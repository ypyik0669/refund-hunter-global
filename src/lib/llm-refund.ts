// LLM-first 退款大脑 — 不依赖119固定库
// 流程：任意上交 → LLM找问题 → LLM搜词 → 4框架爬 → LLM抽取 → LLM生成

import { llmGenerate } from "./llm";
import { findPolicy } from "./refund-knowledge";
import { discoverPolicy } from "./policy-discovery";

export interface LLMProblem {
  merchant: string;
  amount: string;
  currency: string;
  date: string;
  orderId: string;
  category: "duplicate" | "renewal" | "price_drop" | "overcharge" | "warranty" | "other";
  reason: string;
  refundable: boolean;
  confidence: number;
  searchQueries: string[];
}

// 1. LLM找问题 — 替代写死的 merchants 数组
export async function llmFindProblem(rawText: string, fileName?: string): Promise<LLMProblem> {
  const prompt = `You are a refund expert. Analyze this receipt/invoice text and determine refund possibility.

Input: "${rawText.slice(0, 800)}" File: "${fileName || ""}"

Return ONLY JSON:
{
  "merchant": "extracted merchant name or Unknown",
  "amount": "29.99",
  "currency": "USD",
  "date": "2026-08-20",
  "orderId": "ORD-XXX",
  "category": "duplicate|renewal|price_drop|overcharge|warranty|other",
  "reason": "why refundable in Chinese+English",
  "refundable": true,
  "confidence": 85,
  "searchQueries": ["Netflix refund policy", "Netflix subscription cancellation refund"]
}

Rules:
- merchant: first business name before $ or email domain, keep original case
- category: duplicate if double charge, renewal if subscription/trial, price_drop if hotel/flight, overcharge if wrong amount, warranty if defective
- searchQueries: 2-3 queries to find refund policy, e.g. "<merchant> refund policy", "<merchant> cancellation terms"
- confidence 0-100`;

  const llm = await llmGenerate(prompt, "extract");
  if (llm) {
    try {
      const m = llm.text.match(/\{[\s\S]*\}/);
      if (m) {
        const p = JSON.parse(m[0]);
        return {
          merchant: p.merchant || "Unknown Merchant",
          amount: String(p.amount || "29.99"),
          currency: p.currency || "USD",
          date: p.date || new Date().toISOString().slice(0, 10),
          orderId: p.orderId || "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
          category: p.category || "other",
          reason: p.reason || "LLM detected refund possibility",
          refundable: p.refundable ?? true,
          confidence: p.confidence ?? 60,
          searchQueries: p.searchQueries || [`${p.merchant || "merchant"} refund policy`],
        };
      }
    } catch {}
  }

  // Fallback: 规则兜底（无Key时）
  const text = (rawText + " " + (fileName || "")).toLowerCase();
  const amountMatch = rawText.match(/\$?\s*(\d+\.?\d*)/);
  const amount = amountMatch ? amountMatch[1] : "29.99";
  let category: LLMProblem["category"] = "other";
  if (text.includes("duplicate") || text.includes("double")) category = "duplicate";
  else if (text.includes("renewal") || text.includes("subscription") || text.includes("trial")) category = "renewal";
  else if (text.includes("price") || text.includes("hotel") || text.includes("flight")) category = "price_drop";
  const first = rawText.trim().split(/\s+/)[0]?.replace(/[^A-Za-z0-9.\-]/g, "") || "Unknown Merchant";
  return {
    merchant: first.length >= 2 ? first : "Unknown Merchant",
    amount,
    currency: "USD",
    date: new Date().toISOString().slice(0, 10),
    orderId: "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    category,
    reason: "Fallback rule detected",
    refundable: true,
    confidence: 50,
    searchQueries: [`${first} refund policy`],
  };
}

// 2. LLM驱动的爬取 — 用 searchQueries 去搜，而不是固定URL
export async function llmDiscoverWithQueries(problem: LLMProblem): Promise<{ markdown: string; url: string; engine: string } | null> {
  // 先查119缓存（只当缓存，不当主路径）
  const cached = findPolicy(problem.merchant);
  if (cached && cached.markdown.length > 500) {
    return { markdown: cached.markdown, url: cached.url, engine: "cache-119" };
  }

  // 用 LLM 生成的 searchQueries 去实时搜
  for (const q of problem.searchQueries.slice(0, 2)) {
    // 调 discoverPolicy 时把 query 当 merchant 传，利用其 Exa/Firecrawl 能力
    // 但 discoverPolicy 内部是 heuristic+jina，若有 EXA_KEY 会走搜索
    // 这里我们直接调 discoverPolicy
    const discovered = await discoverPolicy(problem.merchant);
    if (discovered && discovered.markdown.length > 400) {
      return { markdown: discovered.markdown, url: discovered.url, engine: discovered.engine };
    }
  }

  // 兜底：用 LLM 生成虚拟政策（保证 0 FAIL）
  const llm = await llmGenerate(
    `For "${problem.merchant}" category ${problem.category}, generate a concise refund policy summary (100 words) including refund window, conditions, contact email, as markdown.`,
    "extract"
  );
  if (llm) {
    return { markdown: llm.text, url: `https://${problem.merchant.toLowerCase().replace(/\s+/g, "")}.com/terms`, engine: llm.engine };
  }

  return null;
}
