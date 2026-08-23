"use client";
import UploadZone from "@/components/UploadZone";
import ResultCard from "@/components/ResultCard";
import { useState } from "react";
import { RefundAnalysis } from "@/types/refund";
import { generateTemplates } from "@/lib/templates";

export default function AppPage() {
  const [analysis, setAnalysis] = useState<RefundAnalysis | null>(null);
  const [tpl, setTpl] = useState<ReturnType<typeof generateTemplates> | null>(null);
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black">Refund Hunter App</h1>
      <p className="text-sm text-zinc-500">Global Lite • Duplicate • Renewal • Price Drop</p>
      <div className="mt-6 bg-white dark:bg-zinc-900 rounded-2xl border p-5 sm:p-6">
        {!analysis ? (
          <UploadZone onResult={(a, t) => { setAnalysis(a); setTpl(t); }} />
        ) : (
          <div>
            <button onClick={() => setAnalysis(null)} className="text-sm text-zinc-500 mb-3">← New check</button>
            {tpl && <ResultCard analysis={analysis} tpl={tpl} />}
          </div>
        )}
      </div>
      <div className="mt-6 text-xs text-zinc-500 text-center">
        Demo engine runs 100% in browser. Production swaps to Claude Vision without UI change.
      </div>
    </div>
  );
}
