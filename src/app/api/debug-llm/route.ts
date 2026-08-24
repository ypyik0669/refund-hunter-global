import { NextResponse } from "next/server";
import { envGet } from "@/lib/llm";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = envGet("RH_OPENAI_API_KEY") || envGet("OPENAI_API_KEY") || "";
  const base = envGet("RH_OPENAI_BASE_URL") || envGet("OPENAI_BASE_URL") || "(default openai)";
  const t0 = Date.now();
  let probe = "no-key";
  try {
    if (key) {
      const r = await fetch(`${base.replace(/\/+$/, "")}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-5.6-luna", messages: [{ role: "user", content: "Say OK" }], max_tokens: 10 }),
        signal: AbortSignal.timeout(15000),
      });
      probe = r.ok ? `OK ${Date.now() - t0}ms :: ${(await r.json()).choices?.[0]?.message?.content}` : `HTTP ${r.status}: ${(await r.text()).slice(0, 150)}`;
    }
  } catch (e) {
    probe = `ERR ${String(e).slice(0, 120)}`;
  }
  return NextResponse.json({ base, keySet: key.length > 0, keyPrefix: key.slice(0, 6), probe });
}
