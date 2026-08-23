"use client";
import { useState } from "react";

export default function PdfTools() {
  const [files, setFiles] = useState<string[]>([]);
  const [text, setText] = useState("");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []).map((f) => f.name);
    setFiles(list);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black">PDF Tools — Merge / Split (Frontend Demo)</h1>
      <p className="text-sm text-zinc-500">Production uses pdf-lib.js pure frontend, no server. SEO: pdf to word, merge pdf</p>
      <div className="mt-4 border-2 border-dashed rounded-xl p-8 bg-zinc-50 dark:bg-zinc-900 text-center">
        <p className="font-medium">Drop PDFs to merge</p>
        <label className="mt-3 inline-block bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-2 rounded-full text-sm cursor-pointer">
          Choose PDFs
          <input type="file" multiple accept=".pdf" className="hidden" onChange={onFile} />
        </label>
        {files.length > 0 && <p className="text-sm text-emerald-600 mt-2">{files.join(", ")}</p>}
      </div>
      <div className="mt-6">
        <h3 className="font-semibold">PDF to Text (demo)</h3>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste PDF text or just demo: type 'Receipt $29.99'" className="w-full mt-2 border rounded-xl p-3 min-h-[100px] dark:bg-zinc-900" />
        <button onClick={() => alert("In prod, pdf-lib merges in browser and downloads. This is UI demo. Integrate: import { PDFDocument } from 'pdf-lib'")} className="mt-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm">Merge & Download (demo)</button>
      </div>
      <div className="mt-6 text-xs text-zinc-500">
        Need refund for PDF tool subscription? → <a href="/app" className="underline text-emerald-600">Refund Hunter</a>
      </div>
    </div>
  );
}
