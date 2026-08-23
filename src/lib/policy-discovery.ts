// 任意冷门商户实时发现 — 4框架思想的TS实现
// Scrapling(启发式URL) + Agent-Reach(Jina/Exa) + crawl4ai(清洗) + firecrawl(兜底)

export interface DiscoveredPolicy {
  merchant: string;
  url: string;
  title: string;
  markdown: string;
  engine: string;
  extracted: {
    refund_days: number | null;
    refundable: boolean;
    conditions: string[];
    contact: string;
  };
}

// 启发式：冷门商户也大概率把政策放在这几个路径
function candidateUrls(merchant: string, domainHint?: string): string[] {
  const slug = merchant.toLowerCase().replace(/[^a-z0-9]/g, "");
  const domains: string[] = [];
  if (domainHint && domainHint.includes(".")) domains.push(domainHint.replace(/^https?:\/\//, "").split("/")[0]);
  domains.push(`${slug}.com`, `${slug}.io`, `${slug}.co`, `${slug}.app`, `help.${slug}.com`, `support.${slug}.com`);
  const uniq = [...new Set(domains)];
  const paths = ["/refund", "/refund-policy", "/refunds", "/terms", "/terms-of-service", "/legal/terms", "/help", "/support/refund", "/policies/refund", "/return"];
  const urls: string[] = [];
  for (const d of uniq.slice(0, 3)) {
    for (const p of paths.slice(0, 3)) {
      urls.push(`https://${d}${p}`);
    }
  }
  // 也试 merchant 原样
  if (!uniq.includes(merchant.toLowerCase())) {
    urls.unshift(`https://${merchant.toLowerCase().replace(/\s+/g, "")}.com/refund-policy`);
  }
  return [...new Set(urls)].slice(0, 6);
}

function toJinaUrl(url: string): string {
  // Jina Reader: https://r.jina.ai/http://example.com/path
  return `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`;
}

function extractRefundFields(markdown: string) {
  const text = markdown.toLowerCase();
  const m = text.match(/(\d+)\s*(day|days|天)/);
  const refund_days = m ? parseInt(m[1], 10) : null;
  const refundable = /refund|退款|money back|return|reimbursement/i.test(markdown);
  const conditions: string[] = [];
  if (/within|天内/.test(text)) conditions.push("within window");
  if (/unused|未使用/.test(text)) conditions.push("unused service");
  if (/goodwill|善意/.test(text)) conditions.push("goodwill");
  const emailMatch = markdown.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  const contact = emailMatch ? emailMatch[0] : "";
  return { refund_days, refundable, conditions, contact };
}

export async function discoverPolicy(merchant: string): Promise<DiscoveredPolicy | null> {
  const m = merchant.trim();
  if (!m || m === "Unknown Merchant") return null;

  // 1. Exa搜索（若有Key）—— 对应Agent-Reach
  const exaKey = process.env.EXA_API_KEY;
  if (exaKey) {
    try {
      const r = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: { "x-api-key": exaKey, "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${m} refund policy`, numResults: 3, type: "auto" }),
      });
      if (r.ok) {
        const data = (await r.json()) as { results?: { url: string; title?: string }[] };
        const urls = (data.results || []).map((x) => x.url);
        for (const url of urls) {
          const md = await fetchViaJina(url);
          if (md && md.length > 500) {
            return {
              merchant: m,
              url,
              title: data.results?.find((x) => x.url === url)?.title || m,
              markdown: md.slice(0, 8000),
              engine: "exa+jina",
              extracted: extractRefundFields(md),
            };
          }
        }
      }
    } catch {}
  }

  // 2. firecrawl search（若有Key）
  const fcKey = process.env.FIRECRAWL_API_KEY || process.env.FC_API_KEY;
  if (fcKey) {
    try {
      const r = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${m} refund policy`, limit: 3 }),
      });
      if (r.ok) {
        const data = (await r.json()) as { data?: { web?: { url: string; title?: string; markdown?: string }[] } };
        const items = data.data?.web || [];
        for (const it of items) {
          if (it.markdown && it.markdown.length > 500) {
            return {
              merchant: m,
              url: it.url,
              title: it.title || m,
              markdown: it.markdown.slice(0, 8000),
              engine: "firecrawl-search",
              extracted: extractRefundFields(it.markdown),
            };
          }
        }
      }
    } catch {}
  }

  // 3. 启发式URL + Jina（对应Scrapling Spider思想，不依赖Key，最稳）— 并行+快速失败
  const urls = candidateUrls(m).slice(0, 4); // 冷门只试前4个，最快
  const results = await Promise.all(urls.map((u) => fetchViaJina(u)));
  for (let i = 0; i < urls.length; i++) {
    const md = results[i];
    const url = urls[i];
    if (md && md.length > 400 && /refund|return|terms|退款/i.test(md)) {
      return {
        merchant: m,
        url,
        title: `${m} Policy`,
        markdown: md.slice(0, 8000),
        engine: "heuristic+jina",
        extracted: extractRefundFields(md),
      };
    }
  }

  // 4. 最后兜底：直接Jina读 merchant.com 首页（仅当包含退款关键词才算命中）
  const fallback = `https://${m.toLowerCase().replace(/\s+/g, "")}.com`;
  const md = await fetchViaJina(fallback);
  if (md && md.length > 400 && /refund|return|terms|退款|退货|退款政策/i.test(md) && !/Domain for sale|404 page|Page not found/.test(md)) {
    return {
      merchant: m,
      url: fallback,
      title: m,
      markdown: md.slice(0, 8000),
      engine: "jina-fallback",
      extracted: extractRefundFields(md),
    };
  }

  return null;
}

async function fetchViaJina(url: string): Promise<string> {
  try {
    const jinaUrl = toJinaUrl(url);
    const r = await fetch(jinaUrl, {
      headers: { "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return "";
    const text = await r.text();
    if (text.includes("403 Forbidden") || (text.includes("Page not found") && text.length < 500)) return "";
    return text;
  } catch {
    return "";
  }
}
