"use client";
import { findPolicy } from "@/lib/refund-knowledge";

export default function PolicyCard({ merchant }: { merchant: string }) {
  const policy = findPolicy(merchant);
  if (!policy) {
    return (
      <div className="rounded-xl border bg-amber-50 dark:bg-zinc-900 p-4 text-sm">
        <p className="font-semibold">No crawled policy for {merchant}</p>
        <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">Using generic goodwill template. Our crawler covers 31 merchants — add your merchant to merchants.json and re-run pipeline.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">📄 {policy.merchant} — Crawled Policy</h4>
        <span className="text-xs bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-2 py-1 rounded-full">{policy.category}</span>
      </div>
      <p className="text-xs text-zinc-500 mt-1">Source: <a href={policy.url} target="_blank" className="underline">{policy.url}</a> • {policy.crawled_at.slice(0,10)} • {policy.engine}</p>
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
