import { getAllPolicies, getPolicyStats } from "@/lib/refund-knowledge";

export default function PoliciesPage() {
  const policies = getAllPolicies();
  const stats = getPolicyStats();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-black">Refund Policies — Crawled Knowledge Base</h1>
      <p className="text-sm text-zinc-500 mt-1">
        31 merchants • 62 pages • 4-framework pipeline (Scrapling + crawl4ai + firecrawl + Agent-Reach) • Updated {stats.crawledAt?.slice(0,10)}
      </p>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-3 text-center">
          <div className="text-2xl font-black">{stats.total}</div>
          <div className="text-xs text-zinc-500">merchants</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-emerald-600">{stats.refundable}</div>
          <div className="text-xs text-zinc-500">refundable</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-3 text-center">
          <div className="text-sm font-bold">{Object.entries(stats.byCategory).map(([k,v])=>`${k}:${v}`).join(" • ")}</div>
          <div className="text-xs text-zinc-500">by category</div>
        </div>
        <div className="bg-emerald-500 text-white rounded-xl p-3 text-center">
          <div className="text-sm font-bold">Scrapling + crawl4ai</div>
          <div className="text-xs text-emerald-100">live crawl</div>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {policies.map((p) => (
          <div key={p.merchant} className="bg-white dark:bg-zinc-900 border rounded-xl p-4">
            <div className="flex justify-between">
              <h3 className="font-bold">{p.merchant}</h3>
              <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">{p.category} • {p.extracted.refund_days ?? "?"}d</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 truncate"><a href={p.url} target="_blank" className="underline">{p.url}</a></p>
            <p className="text-xs mt-2 line-clamp-3 text-zinc-600 dark:text-zinc-400">{p.markdown.slice(0,200)}</p>
            <div className="mt-2 text-xs flex gap-2">
              <span className={`px-2 py-1 rounded-full ${p.extracted.refundable ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100"}`}>{p.extracted.refundable ? "Refundable" : "Check"}</span>
              <span className="bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-full">{p.extracted.conditions.join(", ") || "general"}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-zinc-900 text-white rounded-xl p-5 text-sm">
        <h4 className="font-bold">How this knowledge is built</h4>
        <ul className="list-disc ml-5 mt-2 text-zinc-300 space-y-1">
          <li><b>Scrapling Spider</b> — 并发10，Stealthy绕过Cloudflare，AutoThrottle，62页全量约3分钟</li>
          <li><b>crawl4ai</b> — HTML→clean Markdown + PruningContentFilter</li>
          <li><b>firecrawl</b> — JS重站兜底（需API Key，可选）</li>
          <li><b>Agent-Reach</b> — Exa搜索发现新URL + Jina验证</li>
        </ul>
        <p className="text-xs text-zinc-400 mt-2">Run: <code>python refund_crawler/pipeline.py</code> in crawler/ — outputs to output/ and src/lib/refund-policies.json</p>
      </div>
    </div>
  );
}
