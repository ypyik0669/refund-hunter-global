import { NextRequest, NextResponse } from "next/server";
import { findPolicy, isStale, getStaleDays } from "@/lib/refund-knowledge";
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

  // 1. 先查本地119家 — 但 stale 必须活验证，不可直接信
  const local = findPolicy(merchant);
  if (local && local.markdown.length > 500) {
    const stale = isStale(local);
    const staleDays = getStaleDays(local);
    if (!stale) {
      // 新鲜：直接返回
      const data = { policy: local, source: "local", discovered: false, stale: false, staleDays };
      cache.set(key, { data, ts: Date.now() });
      return NextResponse.json(data);
    }
    // 过期：先返回缓存但标记 stale，同时后台活验证（不阻塞）
    const staleData = {
      policy: local,
      source: "local-stale",
      discovered: false,
      stale: true,
      staleDays,
      warning: `Cached ${staleDays} days ago, may be outdated. Live verification in background. Always check official ${local.url}`,
      verifyUrl: local.url,
    };
    // 后台活验证（fire-and-forget）
    (async () => {
      try {
        const live = await Promise.race([discoverPolicy(merchant), new Promise<null>((r) => setTimeout(() => r(null), 8000))]);
        if (live && live.markdown.length > 400) {
          cache.set(key, { data: { policy: live, source: live.engine, discovered: true, stale: false }, ts: Date.now() });
        }
      } catch {}
    })();
    cache.set(key, { data: staleData, ts: Date.now() });
    return NextResponse.json(staleData);
  }

  // 2. 冷门：实时发现（Jina/Exa/firecrawl）— 8秒超时兜底，错误也兜底为generic
  try {
    const discovered = await Promise.race([
      discoverPolicy(merchant),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
    ]);
    if (discovered && discovered.markdown && discovered.markdown.length > 200) {
      const data = { policy: discovered, source: discovered.engine, discovered: true };
      cache.set(key, { data, ts: Date.now() });
      return NextResponse.json(data);
    }
  } catch (e) {
    console.error("discover fail", merchant, e);
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
