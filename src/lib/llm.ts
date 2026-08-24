// 统一 LLM 入口 — 只用 Gemini + OpenAI，去掉 Anthropic
// 优先级：Gemini 3.7 Flash 主（$0.75/$3.75，60% AnalystAgent，340tps）→ GPT-5.6 Terra/Sol 备

export type LLMRole = "vision" | "extract" | "generate" | "appeal";

export interface LLMResult { text: string; model: string; engine: string }

function getEnv(name: string): string | undefined {
  return (process.env[name] || (globalThis as unknown as { process?: { env?: Record<string, string> } })?.process?.env?.[name])?.trim();
}

// OpenAI 兼容调用（OpenAI 直连 或 OpenRouter 中转）
async function callOpenAI(model: string, prompt: string, maxTokens = 800): Promise<string | null> {
  const key = getEnv("OPENAI_API_KEY") || getEnv("OPENROUTER_API_KEY");
  if (!key) return null;
  const base = getEnv("OPENROUTER_API_KEY") ? (getEnv("OPENROUTER_BASE_URL") || "https://openrouter.ai/api/v1") : "https://api.openai.com/v1";
  try {
    const r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: maxTokens, temperature: 0.2 }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { choices: { message: { content: string | null; reasoning?: string } }[] };
    return j.choices?.[0]?.message?.content || j.choices?.[0]?.message?.reasoning || null;
  } catch { return null; }
}

async function callGemini(model: string, prompt: string, maxTokens = 800): Promise<string | null> {
  const key = getEnv("GEMINI_API_KEY") || getEnv("GOOGLE_API_KEY");
  if (!key) return null;
  // Gemini API: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=...
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens, temperature: 0.2 } }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return j.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch { return null; }
}

export async function llmGenerate(prompt: string, role: LLMRole = "generate"): Promise<LLMResult | null> {
  // 角色路由：vision/extract 用 Flash，generate 用 Terra/Sol，appeal 用 Sol
  const candidates: { fn: () => Promise<string | null>; model: string; engine: string }[] = [];

  if (role === "vision") {
    candidates.push({ fn: () => callGemini("gemini-3.7-flash", prompt, 400), model: "gemini-3.7-flash", engine: "gemini-vision" });
    candidates.push({ fn: () => callOpenAI("gpt-5.6-luna", prompt, 400), model: "gpt-5.6-luna", engine: "openai-vision" });
  } else if (role === "extract") {
    candidates.push({ fn: () => callGemini("gemini-3.7-flash", prompt, 500), model: "gemini-3.7-flash", engine: "gemini-extract" });
    candidates.push({ fn: () => callOpenAI("gpt-5.6-terra", prompt, 500), model: "gpt-5.6-terra", engine: "openai-extract" });
    candidates.push({ fn: () => callOpenAI("stealth/ox-alpha", prompt, 500), model: "stealth/ox-alpha", engine: "ox-alpha-extract" });
    candidates.push({ fn: () => callOpenAI("nvidia/nemotron-3.5-lightning:free", prompt, 500), model: "nvidia/nemotron-3.5-lightning:free", engine: "nemotron-extract" });
  } else if (role === "generate") {
    // 主：Gemini Flash（文档强 60% AnalystAgent + $0.75/$3.75），备：GPT-5.6 Terra（均衡 $2/$12，DeepSWE 69.6）
    candidates.push({ fn: () => callGemini("gemini-3.7-flash", prompt, 800), model: "gemini-3.7-flash", engine: "gemini-generate" });
    candidates.push({ fn: () => callOpenAI("gpt-5.6-terra", prompt, 800), model: "gpt-5.6-terra", engine: "openai-generate" });
    candidates.push({ fn: () => callOpenAI("stealth/ox-alpha", prompt, 800), model: "stealth/ox-alpha", engine: "ox-alpha-generate" });
    candidates.push({ fn: () => callOpenAI("nvidia/nemotron-3.5-lightning:free", prompt, 800), model: "nvidia/nemotron-3.5-lightning:free", engine: "nemotron-generate" });
  } else if (role === "appeal") {
    // 二封用更强的 Sol
    candidates.push({ fn: () => callOpenAI("gpt-5.6-sol", prompt, 800), model: "gpt-5.6-sol", engine: "openai-appeal" });
    candidates.push({ fn: () => callGemini("gemini-3.7-flash", prompt, 800), model: "gemini-3.7-flash", engine: "gemini-appeal" });
  }

  for (const c of candidates) {
    const text = await c.fn();
    if (text && text.trim().length > 50) return { text: text.trim(), model: c.model, engine: c.engine };
  }
  return null;
}
