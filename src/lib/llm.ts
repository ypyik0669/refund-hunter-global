// 统一 LLM 入口 — 全 GPT-5.6 家族（Luna/Terra/Sol），无 Gemini
// 通过 OPENAI_BASE_URL 指向任意 OpenAI 兼容代理（官方/中转面板）

export type LLMRole = "vision" | "extract" | "generate" | "appeal";

export interface LLMResult { text: string; model: string; engine: string }

const BASE = () => (envGet("RH_OPENAI_BASE_URL") || envGet("OPENAI_BASE_URL") || "https://api.openai.com/v1").replace(/\/+$/, "");
const KEY = () => envGet("RH_OPENAI_API_KEY") || envGet("OPENAI_API_KEY") || "";

// 运行时 .env.local 兜底（Next某些环境不注入时直接读文件）
import fs from "fs";
import path from "path";
let dotenvCache: Record<string, string> | null = null;
export function envGet(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  if (!dotenvCache) {
    try {
      const raw = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf-8").replace(/^\uFEFF/, "");
      dotenvCache = {};
      for (const line of raw.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq > 0) dotenvCache[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
      }
    } catch {
      dotenvCache = {};
    }
  }
  return dotenvCache[name];
}

async function callOpenAI(model: string, messages: unknown[], maxTokens: number, timeoutMs = 15000): Promise<string | null> {
  const key = KEY();
  if (!key) return null;
  try {
    const r = await fetch(`${BASE()}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.2 }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { choices: { message: { content: string | null; reasoning?: string } }[] };
    return j.choices?.[0]?.message?.content || j.choices?.[0]?.message?.reasoning || null;
  } catch {
    return null;
  }
}

const MAX_TOKENS: Record<LLMRole, number> = { vision: 500, extract: 600, generate: 900, appeal: 900 };
// 角色 → 模型链（0.3x倍率下的最优性价比路由）
const CHAIN: Record<LLMRole, string[]> = {
  vision: ["gpt-5.6-luna"],
  extract: ["gpt-5.6-luna", "gpt-5.6-terra"],
  generate: ["gpt-5.6-terra", "gpt-5.6-sol"],
  appeal: ["gpt-5.6-sol", "gpt-5.6-terra"],
};

export async function llmGenerate(prompt: string, role: LLMRole = "generate"): Promise<LLMResult | null> {
  for (const model of CHAIN[role]) {
    const text = await callOpenAI(model, [{ role: "user", content: prompt }], MAX_TOKENS[role]);
    if (text && text.trim().length > 50) {
      return { text: text.trim(), model, engine: model };
    }
  }
  return null;
}

// Vision：图片(base64) + 提示词 → Luna
export async function llmVision(base64: string, mime: string, prompt: string, maxTokens = 500): Promise<LLMResult | null> {
  const text = await callOpenAI("gpt-5.6-luna", [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: `data:${mime};base64,${base64}`, detail: "auto" } },
      ],
    },
  ], maxTokens, 20000);
  if (text && text.trim().length > 5) return { text: text.trim(), model: "gpt-5.6-luna", engine: "gpt-5.6-luna-vision" };
  return null;
}
