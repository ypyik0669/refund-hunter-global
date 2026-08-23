"use client";
import Link from "next/link";
import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import ResultCard from "@/components/ResultCard";
import { RefundAnalysis } from "@/types/refund";
import { generateTemplates } from "@/lib/templates";

export default function Home() {
  const [analysis, setAnalysis] = useState<RefundAnalysis | null>(null);
  const [tpl, setTpl] = useState<ReturnType<typeof generateTemplates> | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-10 sm:py-14">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" /> GLOBAL • FREE TO CHECK • 15% ONLY IF YOU WIN
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white">
              Drop any receipt.<br />
              <span className="text-emerald-500">We find your money back.</span>
            </h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              丢进来，我帮你找出能退的钱。Invoice / Receipt / Email / Screenshot → AI判断退款概率 → 生成退款申请/客服话术。<br />
              <span className="font-medium text-zinc-900 dark:text-white">Duplicate • Renewal • Price Drop</span> — 3 global patterns, 0 legal jargon.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="bg-white dark:bg-zinc-900 border px-3 py-1.5 rounded-full">Netflix renewal?</span>
              <span className="bg-white dark:bg-zinc-900 border px-3 py-1.5 rounded-full">Duplicate charge?</span>
              <span className="bg-white dark:bg-zinc-900 border px-3 py-1.5 rounded-full">Hotel price dropped?</span>
              <span className="bg-white dark:bg-zinc-900 border px-3 py-1.5 rounded-full">App subscription?</span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="bg-white dark:bg-zinc-900 rounded-xl border p-3">
                <div className="text-xl font-black">92%</div>
                <div className="text-xs text-zinc-500">Duplicate success</div>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-xl border p-3">
                <div className="text-xl font-black">15%</div>
                <div className="text-xs text-zinc-500">Only if you win</div>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-xl border p-3">
                <div className="text-xl font-black">7 days</div>
                <div className="text-xs text-zinc-500">Data auto-delete</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
            {!analysis ? (
              <UploadZone
                onResult={(a, t) => {
                  setAnalysis(a);
                  setTpl(t);
                  window.scrollTo({ top: 600, behavior: "smooth" });
                }}
              />
            ) : (
              <div>
                <button onClick={() => setAnalysis(null)} className="text-sm text-zinc-500 hover:text-zinc-900 mb-3">← Upload another</button>
                {tpl && <ResultCard analysis={analysis} tpl={tpl} />}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="py-10 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold">How it works — 3 steps, 2 minutes</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">1</div>
            <h3 className="mt-3 font-semibold">Drop receipt</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Invoice, email, screenshot, any language. We OCR in 3s.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-5">
            <div className="h-8 w-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold">2</div>
            <h3 className="mt-3 font-semibold">AI checks refund chance</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Scores 0-100 on 3 global patterns. No law degree needed.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-5">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold">3</div>
            <h3 className="mt-3 font-semibold">Copy & send</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">We generate email + chat scripts (EN + your language). You send. We take 15% only if you win.</p>
          </div>
        </div>
        <div className="mt-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm">
          <span className="font-semibold">We generate, you send.</span> We never log into your accounts or impersonate you. GDPR: files auto-deleted in 7 days. Not a law firm.
        </div>
      </section>

      {/* Global */}
      <section className="py-10 border-t border-zinc-200 dark:border-zinc-800">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-500 text-white rounded-2xl p-6">
            <h3 className="font-bold text-lg">Global Lite — why it works everywhere</h3>
            <ul className="mt-3 space-y-2 text-sm text-emerald-50">
              <li>• No local law needed — duplicate/renewal/price are universal merchant policies</li>
              <li>• English template works with every global merchant</li>
              <li>• $5 min / $50 max, LemonSqueezy handles worldwide tax</li>
              <li>• Pure frontend MVP, $21.67/mo to run, 1 paying user = break even</li>
            </ul>
            <Link href="/app" className="mt-4 inline-block bg-white text-emerald-600 px-4 py-2 rounded-full text-sm font-semibold">Try Global Lite →</Link>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-6">
            <h3 className="font-bold">Free tools that feed it (SEO moat)</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Same stack, same SEO, drives traffic to Hunter.</p>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link href="/tools/image-compress" className="border rounded-xl p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex justify-between"><span>🖼️ Image Compress</span><span>→</span></Link>
              <Link href="/tools/pdf-tools" className="border rounded-xl p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex justify-between"><span>📄 PDF Tools</span><span>→</span></Link>
              <Link href="/tools/json-formatter" className="border rounded-xl p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex justify-between"><span>{"{}"} JSON Formatter</span><span>→</span></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
