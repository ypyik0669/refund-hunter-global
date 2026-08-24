"use client";
import { useState, useCallback } from "react";
import { analyzeRefund } from "@/lib/refund-engine";
import { generateTemplates } from "@/lib/templates";
import { RefundAnalysis } from "@/types/refund";

export default function UploadZone({ onResult }: { onResult: (a: RefundAnalysis, t: ReturnType<typeof generateTemplates>) => void }) {
  const [text, setText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>();

  const [visionLoading, setVisionLoading] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() && !fileName) return;
    // 若有图，先走Vision API (Gemini 3.7 Flash / GPT-5.6 Luna)
    let effectiveText = text;
    let effectiveFileName = fileName;
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')?.files?.[0];
    if (fileInput && fileInput.size > 0 && fileInput.type.startsWith("image")) {
      setVisionLoading(true);
      try {
        const fd = new FormData();
        fd.append("file", fileInput);
        const r = await fetch("/api/vision", { method: "POST", body: fd });
        if (r.ok) {
          const j = (await r.json()) as { ocr?: { merchant?: string; amount?: string; rawText?: string } };
          if (j.ocr) {
            const o = j.ocr;
            effectiveText = `${o.merchant || ""} ${o.amount || ""} ${o.rawText || text}`.trim() || text;
            effectiveFileName = o.merchant || fileName;
          }
        }
      } catch {}
      setVisionLoading(false);
    }
    // LLM-first：调 /api/analyze（Gemini/OpenAI 找问题 + 4框架爬），失败回退本地
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: effectiveText, fileName: effectiveFileName }),
      });
      if (r.ok) {
        const j = (await r.json()) as { analysis: RefundAnalysis; tpl: ReturnType<typeof generateTemplates>; problem?: { searchQueries?: string[] }; discovered?: { engine: string } };
        if (j.analysis && j.tpl) {
          onResult(j.analysis, j.tpl);
          localStorage.setItem("rh_last", JSON.stringify(j));
          return;
        }
      }
    } catch {}
    // 回退本地规则
    const analysis = analyzeRefund(effectiveText, effectiveFileName);
    const tpl = generateTemplates(analysis);
    onResult(analysis, tpl);
    localStorage.setItem("rh_last", JSON.stringify({ analysis, tpl }));
  }, [text, fileName, onResult]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFileName(f.name);
      // For MVP, read as text if possible, else just use name
      if (f.type.startsWith("text") || f.name.endsWith(".txt") || f.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (ev) => setText(String(ev.target?.result || ""));
        reader.readAsText(f);
      } else {
        setText((prev) => prev || `File: ${f.name} | Amount: $29.99 | Date: 2026-08-20 | Order: ORD-${Math.random().toString(36).slice(2,8).toUpperCase()} | Merchant: ${f.name.split(".")[0]}`);
      }
    }
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      setText((prev) => prev || `File: ${f.name} | Amount: $29.99 | Date: 2026-08-20 | Order: ORD-${Math.random().toString(36).slice(2,8).toUpperCase()}`);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition ${dragOver ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"}`}
      >
        <div className="mx-auto max-w-md">
          <div className="text-3xl mb-2">🧾</div>
          <p className="font-semibold text-zinc-900 dark:text-white">Drop Invoice / Receipt / Screenshot</p>
          <p className="text-sm text-zinc-500 mt-1">JPG, PNG, PDF, Email text — up to 10MB</p>
          <label className="mt-4 inline-flex cursor-pointer bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-2.5 rounded-full text-sm font-medium">
            Choose file
            <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf,.txt" onChange={onFile} />
          </label>
          {fileName && <p className="mt-3 text-xs text-emerald-600">Selected: {fileName}</p>}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Or paste email / invoice text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste here: e.g. 'Netflix $15.99 charged on 2026-08-20, I didn't intend to renew, order ORD-12345'  or '酒店预订 Booking.com $199，被重复扣款两次' or 'Amazon duplicate charge $49.99'"
          className="mt-2 w-full min-h-[110px] rounded-xl border border-zinc-300 bg-white p-3 text-sm dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={() => setText("Netflix subscription $15.99 charged on 2026-08-22, auto-renewal, I forgot to cancel trial, order ORD-9K2L1M")} className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5 rounded-full">Example: Netflix renewal</button>
          <button onClick={() => setText("Apple App Store charged $29.99 twice on 2026-08-22 for same purchase, duplicate charge, order ML4K9Q")} className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5 rounded-full">Example: Duplicate</button>
          <button onClick={() => setText("Booking.com hotel $199 on 2026-08-18, now same room $149, price drop, want price protection refund")} className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5 rounded-full">Example: Price drop</button>
          <button onClick={() => setText("Adobe $52.99 charged after renewal yesterday, haven't used, request refund")} className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5 rounded-full">Example: Adobe</button>
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={(!text.trim() && !fileName) || visionLoading}
        className="mt-5 w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition"
      >
        {visionLoading ? "👁️ GPT-5.6 Luna reading image..." : "🔍 Analyze — Find my refund chance"}
      </button>
      <p className="text-xs text-center text-zinc-500 mt-1">Vision: GPT-5.6 Luna (no key → filename fallback)</p>
      <p className="text-xs text-center text-zinc-500 mt-2">Free to check • No signup • Data deleted in 7 days</p>
    </div>
  );
}
