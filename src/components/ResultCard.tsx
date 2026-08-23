"use client";
import { RefundAnalysis } from "@/types/refund";
import { generateTemplates } from "@/lib/templates";
import { useState } from "react";
import PolicyCard from "./PolicyCard";

export default function ResultCard({ analysis, tpl }: { analysis: RefundAnalysis; tpl: ReturnType<typeof generateTemplates> }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Score */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-widest text-zinc-500">REFUND SCORE</div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl font-black text-zinc-900 dark:text-white">{analysis.score}</span>
              <span className="text-zinc-500">/ 100</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${analysis.color}`}>{analysis.labelText}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{analysis.reason}</p>
            <p className="text-xs text-zinc-500">{analysis.reasonEn}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">EST. REFUND</div>
            <div className="text-2xl font-bold text-emerald-600">{analysis.estimatedRefund}</div>
            <div className="text-xs text-zinc-500">{analysis.ocr.merchant} • {analysis.ocr.date}</div>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          {analysis.details.map((d, i) => (
            <li key={i} className="flex gap-2"><span>•</span><span>{d}</span></li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">{analysis.ocr.merchant}</span>
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">{analysis.ocr.amount} {analysis.ocr.currency}</span>
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">{analysis.ocr.orderId}</span>
          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full">{analysis.category}</span>
        </div>
      </div>

      {/* Knowledge */}
      <PolicyCard merchant={analysis.ocr.merchant} />

      {/* Templates */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h3 className="font-semibold">📧 Email Template (English)</h3>
          <p className="text-xs text-zinc-500 mt-1">Subject: {tpl.subject}</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl border text-zinc-800 dark:text-zinc-100 max-h-64 overflow-auto">{tpl.body}</pre>
          <div className="mt-3 flex gap-2">
            <button onClick={() => copy(`Subject: ${tpl.subject}\n\n${tpl.body}`, "email")} className="flex-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-2 rounded-full text-sm font-medium">
              {copied === "email" ? "Copied ✓" : "Copy Email"}
            </button>
            <a href={`mailto:?subject=${encodeURIComponent(tpl.subject)}&body=${encodeURIComponent(tpl.body)}`} className="flex-1 text-center border py-2 rounded-full text-sm">Open in Gmail</a>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <h3 className="font-semibold">💬 Live Chat Script</h3>
          <p className="text-xs text-zinc-500 mt-1">Short version for chat/calls</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl border text-zinc-800 dark:text-zinc-100">{tpl.chatScript}</pre>
          <button onClick={() => copy(tpl.chatScript, "chat")} className="mt-3 w-full bg-emerald-500 text-white py-2 rounded-full text-sm font-medium">
            {copied === "chat" ? "Copied ✓" : "Copy Chat Script"}
          </button>
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-sm">中文对照</h4>
            <p className="text-xs text-zinc-500">{tpl.subjectZh}</p>
            <pre className="mt-2 whitespace-pre-wrap text-sm bg-amber-50 dark:bg-zinc-800 p-3 rounded-xl border">{tpl.bodyZh}</pre>
            <button onClick={() => copy(`${tpl.subjectZh}\n\n${tpl.bodyZh}`, "zh")} className="mt-2 w-full border py-2 rounded-full text-sm">
              {copied === "zh" ? "已复制 ✓" : "复制中文版"}
            </button>
          </div>
        </div>
      </div>

      {/* Monetization */}
      <div className="rounded-2xl bg-emerald-500 text-white p-5 sm:p-6">
        <h3 className="font-bold">Success fee — 15% only if you get refund</h3>
        <p className="text-sm text-emerald-50 mt-1">No win, no fee. If this template gets you ${analysis.ocr.amount} back, we ask for 15% ({analysis.ocr.currency === "CNY" ? "¥" : "$"}{(parseFloat(analysis.ocr.amount) * 0.15).toFixed(2)}). You keep 85%.</p>
        <div className="mt-3 flex gap-2">
          <button onClick={() => alert("Demo: In production, you upload refund proof → we verify → LemonSqueezy payment link for 15% is generated.")} className="bg-white text-emerald-600 px-4 py-2 rounded-full text-sm font-semibold">I got refund → Pay 15%</button>
          <button onClick={() => copy(window.location.href, "link")} className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm">{copied === "link" ? "Link copied ✓" : "Share result"}</button>
        </div>
        <p className="text-xs text-emerald-100 mt-2">$5 min, $50 max. Small refunds under $2 free. GDPR: data deleted in 7 days.</p>
      </div>
    </div>
  );
}
