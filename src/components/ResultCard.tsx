"use client";
import { RefundAnalysis } from "@/types/refund";
import { RefundTemplates } from "@/lib/templates";
import { PRICING } from "@/lib/pricing";
import { useEffect, useState } from "react";

export default function ResultCard({ analysis, tpl }: { analysis: RefundAnalysis; tpl: RefundTemplates }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  useEffect(() => {
    setUnlocked(localStorage.getItem("rh_unlocked") === "1");
  }, []);

  const unlock = () => {
    if (PRICING.checkoutCase) {
      window.open(PRICING.checkoutCase, "_blank");
      return;
    }
    // checkout 未配置：Beta 解锁（上线前替换为真实支付回调）
    localStorage.setItem("rh_unlocked", "1");
    setUnlocked(true);
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
          {analysis.details.map((d, i) => (<li key={i} className="flex gap-2"><span>•</span><span>{d}</span></li>))}
        </ul>
      </div>

      {/* FREE: 第一封邮件 EN */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">📧 Email #1 — Free</h3>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">FREE</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Subject: {tpl.subject}</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl border text-zinc-800 dark:text-zinc-100 max-h-64 overflow-auto">{tpl.body}</pre>
          <div className="mt-3 flex gap-2">
            <button onClick={() => copy(`Subject: ${tpl.subject}\n\n${tpl.body}`, "email")} className="flex-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-2 rounded-full text-sm font-medium">
              {copied === "email" ? "Copied ✓" : "Copy Email"}
            </button>
            <a href={`mailto:?subject=${encodeURIComponent(tpl.subject)}&body=${encodeURIComponent(tpl.body)}`} className="flex-1 text-center border py-2 rounded-full text-sm">Open in Gmail</a>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">中文版在解锁包内 • 大部分退款赢在追讨序列，不在第一封</p>
        </div>

        {/* FREE中文第一封 */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">📧 中文第一封 — 免费</h3>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">FREE</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">{tpl.subjectZh}</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl border max-h-64 overflow-auto">{tpl.bodyZh}</pre>
          <button onClick={() => copy(`${tpl.subjectZh}\n\n${tpl.bodyZh}`, "emailzh")} className="mt-3 w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-2 rounded-full text-sm font-medium">
            {copied === "emailzh" ? "已复制 ✓" : "复制中文第一封"}
          </button>
        </div>
      </div>

      {/* PREMIUM: 追讨序列 */}
      <div className="relative rounded-2xl border-2 border-emerald-500 bg-white dark:bg-zinc-900 p-5 sm:p-6 overflow-hidden">
        <div className={!unlocked ? "select-none blur-sm pointer-events-none opacity-60" : ""}>
          <h3 className="font-bold">⚔️ 追讨序列 — 商户拒绝后用（赢退款的关键）</h3>
          {tpl.premium.followUps.map((f, i) => (
            <div key={i} className="mt-4 border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-amber-600">{f.label}</p>
                <button onClick={() => copy(`Subject: ${f.subject}\n\n${f.body}`, `fu${i}`)} className="text-xs bg-zinc-900 text-white px-3 py-1 rounded-full">{copied === `fu${i}` ? "Copied ✓" : "Copy"}</button>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Subject: {f.subject}</p>
              <pre className="mt-2 whitespace-pre-wrap text-sm bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg border max-h-48 overflow-auto">{f.body}</pre>
            </div>
          ))}
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <p className="text-xs font-bold text-blue-600">💬 Live Chat Script (EN)</p>
              <pre className="mt-2 whitespace-pre-wrap text-sm bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg border">{tpl.premium.chatScript}</pre>
              <button onClick={() => copy(tpl.premium.chatScript, "chat")} className="mt-2 w-full bg-blue-500 text-white py-2 rounded-full text-sm">{copied === "chat" ? "Copied ✓" : "Copy Chat"}</button>
            </div>
            <div className="border rounded-xl p-4">
              <p className="text-xs font-bold text-blue-600">💬 中文客服话术 + 中文追讨</p>
              <pre className="mt-2 whitespace-pre-wrap text-sm bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg border">{tpl.premium.chatScriptZh}</pre>
              <button onClick={() => copy(tpl.premium.zhFollowUps.map(f => `${f.label}\n${f.subject}\n\n${f.body}`).join("\n\n---\n\n") + `\n\n${tpl.premium.chatScriptZh}`, "zhprem")} className="mt-2 w-full bg-blue-500 text-white py-2 rounded-full text-sm">{copied === "zhprem" ? "已复制 ✓" : "复制中文追讨全套"}</button>
            </div>
          </div>
        </div>

        {!unlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-white/95 dark:from-zinc-950/95 to-transparent p-6 text-center">
            <div className="text-3xl">⚔️</div>
            <h3 className="mt-2 font-black text-lg">三连追讨序列 + 客服话术</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-md">第2封坚定版 + 第3封chargeback最后通牒 + 中英客服话术。<b>大部分退款赢在追讨，不在第一封。</b></p>
            <button onClick={unlock} className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-full text-lg">
              解锁本单 — ${PRICING.caseUnlock}
            </button>
            <p className="text-xs text-zinc-500 mt-2">或 <a href="/pricing" className="underline font-medium">$ {PRICING.monthly}/月无限单 →</a></p>
          </div>
        )}
      </div>

      {/* Share */}
      <div className="rounded-2xl bg-zinc-900 text-white p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">Refund成功了吗？</p>
          <p className="text-xs text-zinc-400">分享给同样被乱扣钱的朋友 — 检测永久免费</p>
        </div>
        <button onClick={() => copy(window.location.href, "link")} className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm">{copied === "link" ? "Link copied ✓" : "Share result"}</button>
      </div>
    </div>
  );
}
