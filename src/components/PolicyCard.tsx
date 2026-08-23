"use client";
import { findPolicy } from "@/lib/refund-knowledge";
import { useEffect, useState } from "react";

export default function PolicyCard({ merchant }: { merchant: string }) {
  const local = findPolicy(merchant);
  const [remote, setRemote] = useState<null | { policy: ReturnType<typeof findPolicy>; source: string; discovered?: boolean }>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (local && local.markdown.length > 500) return; // 已有高质量本地库，不用拉
    if (!merchant || merchant === "Unknown Merchant") return;
    setLoading(true);
    fetch(`/api/policy?merchant=${encodeURIComponent(merchant)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.policy) setRemote(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [merchant, local]);

  const policy = local && local.markdown.length > 500 ? local : (remote?.policy as ReturnType<typeof findPolicy>) || local;

  if (loading) {
    return <div className="rounded-xl border bg-white dark:bg-zinc-900 p-4 text-sm">🔍 Searching refund policy for <b>{merchant}</b> — Jina+Exa+firecrawl live discovery...</div>;
  }

  if (!policy) {
    return (
      <div className="rounded-xl border bg-amber-50 dark:bg-zinc-900 p-4 text-sm">
        <p className="font-semibold">No crawled policy for {merchant}</p>
        <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">Using generic goodwill template. Our crawler covers 31 merchants — add your merchant to merchants.json and re-run pipeline.</p>
      </div>
    );
  }
  const badge = remote?.discovered ? "LIVE DISCOVERED" : remote?.source === "generic" ? "GENERIC FALLBACK" : "CRAWLED";
  return (
    <div className="rounded-xl border bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">📄 {policy.merchant} — {badge}</h4>
        <span className="text-xs bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-2 py-1 rounded-full">{(policy as {category?:string}).category || "unknown"}</span>
      </div>
      <p className="text-xs text-zinc-500 mt-1">Source: <a href={policy.url} target="_blank" className="underline">{policy.url}</a> • {(policy as {crawled_at?:string}).crawled_at?.slice(0,10) || "live"} • {policy.engine} {remote?.source ? `• via ${remote.source}` : ""}</p>
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
