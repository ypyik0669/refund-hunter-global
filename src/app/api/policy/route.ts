import { NextRequest, NextResponse } from "next/server";
import { findPolicy } from "@/lib/refund-knowledge";
import { discoverPolicy } from "@/lib/policy-discovery";

// 内存缓存（生产应换Supabase/Redis）
const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 1000 * 60 * 60 * 24; // 24h

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchant = (searchParams.get("merchant") || "").trim();
  if (!merchant) return NextResponse.json({ error: "merchant required" }, { status: 400 });
  if (merchant.length > 80) return NextResponse.json({ error: "merchant too long" }, { status: 400 });

  const key = merchant.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) {
    return NextResponse.json({ ...(hit.data as object), cached: true });
  }

  // 1. 先查本地31家
  const local = findPolicy(merchant);
  if (local && local.markdown.length > 500) {
    const data = { policy: local, source: "local", discovered: false };
    cache.set(key, { data, ts: Date.now() });
    return NextResponse.json(data);
  }

  // 2. 冷门：实时发现（Jina/Exa/firecrawl）— 8秒超时兜底
  try {
    const discovered = await Promise.race([
      discoverPolicy(merchant),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
    ]);
    if (discovered) {
      const data = { policy: discovered, source: discovered.engine, discovered: true };
      cache.set(key, { data, ts: Date.now() });
      return NextResponse.json(data);
    }
  } catch (e) {
    console.error("discover fail", e);
  }

  // 3. 兜底：返回通用模板信息
  const fallback = {
    merchant,
    url: `https://${merchant.toLowerCase().replace(/\s+/g, "")}.com/terms`,
    title: `${merchant} (generic)`,
    markdown: `${merchant} general refund: Try goodwill request within 7 days, attach receipt, mention duplicate/accidental renewal.`,
    engine: "generic-fallback",
    extracted: { refund_days: 7, refundable: true, conditions: ["generic", "goodwill"], contact: "" },
  };
  const data = { policy: fallback, source: "generic", discovered: false, note: "No crawled policy found, using generic. Add to merchants.json and re-crawl for precision." };
  cache.set(key, { data, ts: Date.now() });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const merchant = String(body.merchant || "").trim();
    if (!merchant) return NextResponse.json({ error: "merchant required" }, { status: 400 });
    // 复用GET逻辑
    const url = new URL(req.url);
    url.searchParams.set("merchant", merchant);
    const fakeReq = new NextRequest(url.toString(), { method: "GET" });
    return GET(fakeReq);
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
}
