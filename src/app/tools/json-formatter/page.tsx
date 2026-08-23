"use client";
import { useState } from "react";

export default function JsonFormatter() {
  const [input, setInput] = useState('{"name":"refund hunter","amount":29.99,"refundable":true}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const format = () => {
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj, null, 2));
      setError("");
    } catch (e: unknown) {
      setError(String((e as Error).message));
      setOutput("");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black">JSON Formatter — Free, Instant</h1>
      <p className="text-sm text-zinc-500">SEO: json formatter, json pretty print. Pure JS, no server.</p>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Input</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full mt-1 border rounded-xl p-3 min-h-[280px] font-mono text-sm dark:bg-zinc-900" />
          <button onClick={format} className="mt-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm w-full">Format / Validate</button>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Output</label>
          <pre className="w-full mt-1 border rounded-xl p-3 min-h-[280px] bg-zinc-50 dark:bg-zinc-800 overflow-auto text-sm">{output || "Formatted JSON will appear here"}</pre>
          {output && <button onClick={() => navigator.clipboard.writeText(output)} className="mt-2 border px-4 py-2 rounded-full text-sm w-full">Copy</button>}
        </div>
      </div>
      <div className="mt-6 text-xs text-zinc-500">
        Dev? Save $29 → <a href="/app" className="underline text-emerald-600">Check if your dev tool subscription is refundable</a>
      </div>
    </div>
  );
}
