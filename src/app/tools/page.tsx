import Link from "next/link";
export default function Tools() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black">Free Tools — Global SEO Moat</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mt-2">Same stack, same traffic, feeds Refund Hunter. Pure frontend, $0 server cost.</p>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Link href="/tools/image-compress" className="bg-white dark:bg-zinc-900 rounded-2xl border p-6 hover:shadow">
          <div className="text-2xl">🖼️</div>
          <h3 className="font-bold mt-2">Image Compress</h3>
          <p className="text-sm text-zinc-500">Browser Canvas, 0 server. SEO: compress image</p>
          <span className="text-sm text-emerald-600 mt-2 inline-block">Open →</span>
        </Link>
        <Link href="/tools/pdf-tools" className="bg-white dark:bg-zinc-900 rounded-2xl border p-6 hover:shadow">
          <div className="text-2xl">📄</div>
          <h3 className="font-bold mt-2">PDF Tools</h3>
          <p className="text-sm text-zinc-500">Merge, split, compress. SEO: pdf to word</p>
          <span className="text-sm text-emerald-600 mt-2 inline-block">Open →</span>
        </Link>
        <Link href="/tools/json-formatter" className="bg-white dark:bg-zinc-900 rounded-2xl border p-6 hover:shadow">
          <div className="text-2xl">{"{}"}</div>
          <h3 className="font-bold mt-2">JSON Formatter</h3>
          <p className="text-sm text-zinc-500">JSON.parse/stringify. SEO: json formatter</p>
          <span className="text-sm text-emerald-600 mt-2 inline-block">Open →</span>
        </Link>
      </div>
      <div className="mt-8 bg-zinc-900 text-white rounded-xl p-5 text-sm">
        AdSense: 10K UV × $10 CPM = $100/mo per tool. 20 tools = $2K/mo. One explodes = $10K+.
      </div>
    </div>
  );
}
