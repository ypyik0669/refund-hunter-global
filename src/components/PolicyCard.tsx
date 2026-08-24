"use client";
import { findPolicy, isStale, getStaleDays } from "@/lib/refund-knowledge";
import { useEffect, useState } from "react";

export default function PolicyCard({ merchant }: { merchant: string }) {
  const local = findPolicy(merchant);
  const [remote, setRemote] = useState<null | { policy: ReturnType<typeof findPolicy>; source: string; discovered?: boolean; stale?: boolean; staleDays?: number; warning?: string; verifyUrl?: string }>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!merchant || merchant === "Unknown Merchant") return;
    // 即使本地有，也要调API做活验证（API会判断 stale 并后台刷新）
    setLoading(true);
    fetch(`/api/policy?merchant=${encodeURIComponent(merchant)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.policy) setRemote(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [merchant]);

  if (loading) {
    return <div className="rounded-xl border bg-white dark:bg-zinc-900 p-4 text-sm">🔍 Live verifying refund policy for <b>{merchant}</b> — cache + Jina live check...</div>;
  }

  const policy = (remote?.policy as ReturnType<typeof findPolicy>) || local;
  const isRemoteStale = remote?.stale === true;
  const staleDays = remote?.staleDays ?? (local ? getStaleDays(local) : 0);
  const showStaleWarning = isRemoteStale || (local ? isStale(local) : false);

  if (!policy) {
    return (
      <div className="rounded-xl border bg-amber-50 dark:bg-zinc-900 p-4 text-sm">
        <p className="font-semibold">No crawled policy for {merchant}</p>
        <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">Using generic goodwill template. Our crawler covers 31 merchants — add your merchant to merchants.json and re-run pipeline.</p>
      </div>
    );
  }
  const badge = remote?.source === "local-stale" ? `STALE ${staleDays}d` : remote?.discovered ? "LIVE VERIFIED" : remote?.source === "generic" ? "GENERIC FALLBACK" : "CACHED";
  const freshness = (policy as {crawled_at?:string}).crawled_at ? `${(policy as {crawled_at?:string}).crawled_at?.slice(0,10)}${showStaleWarning ? ` • ⚠️ ${staleDays}d ago` : " • fresh"}` : "live";
  return (
    <div className={`rounded-xl border p-4 ${showStaleWarning ? "bg-amber-50 dark:bg-amber-950/20 border-amber-300" : "bg-white dark:bg-zinc-900"}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">📄 {policy.merchant} — {badge}</h4>
        <span className="text-xs bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-2 py-1 rounded-full">{(policy as {category?:string}).category || "unknown"}</span>
      </div>
      <p className="text-xs text-zinc-500 mt-1">Source: <a href={policy.url} target="_blank" className="underline">{policy.url}</a> • {freshness} • {policy.engine} {remote?.source ? `• via ${remote.source}` : ""}</p>
      {showStaleWarning && (
        <div className="mt-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 rounded-lg p-2 text-xs">
          ⚠️ 缓存已过期 {staleDays}天，政策可能已变更。已后台活验证，请以 <a href={policy.url} target="_blank" className="underline font-semibold">官方链接</a> 为准。提交前请复核。我们不保证100%可退。
        </div>
      )}
      {!showStaleWarning && (
        <div className="mt-2 text-xs text-zinc-500">✓ 7天内验证，请以官方为准 <a href={policy.url} target="_blank" className="underline">Verify official</a></div>
      )}
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2 text-center">
          <div className="font-bold text-emerald-700 dark:text-emerald-400">{policy.extracted.refund_days ?? "—"} days</div>
          <div className="text-zinc-500">window</div>
        </div>
        <div className={`rounded-lg p-2 text-center ${policy.extracted.refundable ? "bg-blue-50 dark:bg-blue-950/30" : "bg-zinc-100 dark:bg-zinc-800"}`}>
          <div className="font-bold">{policy.extracted.refundable ? "Refundable" : "Check"}</div>
          <div className="text-zinc-500">{policy.extracted.conditions.join(", ") || "general"}</div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-2 text-center">
          <div className="font-bold truncate">{policy.extracted.contact || "via site"}</div>
          <div className="text-zinc-500">contact</div>
        </div>
      </div>
      <details className="mt-2">
        <summary className="text-xs text-zinc-500 cursor-pointer">Show crawled markdown (first 500 chars)</summary>
        <pre className="mt-2 text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded border whitespace-pre-wrap max-h-40 overflow-auto">{policy.markdown.slice(0,500)}</pre>
      </details>
    </div>
  );
}
