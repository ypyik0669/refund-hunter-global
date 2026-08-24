// Universal Discovery — 兼容全世界任意公司，零Key也能搜
// DuckDuckGo HTML搜索（免费无Key）→ Jina读正文 → 过滤退款政策

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

export function extractResultUrls(html: string, limit = 5): string[] {
  const urls: string[] = [];
  // DDG html版结果: href="//duckduckgo.com/l/?uddg=<enc>&rut=..."
  const re = /uddg=([^&"]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && urls.length < limit * 2) {
    try {
      const u = decodeURIComponent(m[1]);
      if (/^https?:\/\//.test(u) && !u.includes("duckduckgo.com")) urls.push(u);
    } catch {}
  }
  return [...new Set(urls)].slice(0, limit);
}

export async function searchDDG(query: string, timeoutMs = 4500): Promise<string[]> {
  try {
    const r = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!r.ok) return [];
    return extractResultUrls(await r.text(), 5);
  } catch {
    return [];
  }
}

// Bing 备用引擎（DDG被限流时）。真实URL藏在 /ck/a?...&u=a1<base64url>
export async function searchBing(query: string, timeoutMs = 4500): Promise<string[]> {
  try {
    const r = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}&count=10`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!r.ok) return [];
    const html = await r.text();
    const urls: string[] = [];
    const re = /<h2[^>]*>\s*<a[^>]+href="(https?:\/\/[^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) && urls.length < 8) {
      const raw = m[1].replace(/&amp;/g, "&"); // Bing HTML转义
      if (/bing\.com\/ck\/a/i.test(raw)) {
        // 解码 u=a1<base64url> 参数
        try {
          const um = raw.match(/[?&]u=a1([^&]+)/);
          if (um) {
            const b64 = um[1].replace(/-/g, "+").replace(/_/g, "/");
            const decoded = Buffer.from(b64, "base64").toString("utf-8");
            if (/^https?:\/\/(?!www\.bing)/.test(decoded)) urls.push(decoded);
          }
        } catch {}
      } else if (!raw.includes("bing.com") && !raw.includes("microsoft")) {
        urls.push(raw);
      }
    }
    return [...new Set(urls)];
  } catch {
    return [];
  }
}

export async function searchWeb(query: string): Promise<string[]> {
  // Node fetch下Bing最稳（DDG对Node返回202挑战页），DDG做备选
  const bing = await searchBing(query);
  if (bing.length > 0) return bing;
  return searchDDG(query);
}

export async function jinaRead(url: string, timeoutMs = 5000): Promise<string> {
  try {
    const r = await fetch(`https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`, {
      headers: { "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!r.ok) return "";
    const t = await r.text();
    if (t.includes("403 Forbidden") || (/Page not found/i.test(t) && t.length < 500)) return "";
    return t;
  } catch {
    return "";
  }
}

const REFUND_RE = /refund|return policy|money.?back|cancellation|退款|退货|退款政策/i;
const BAD_RE = /domain for sale|404 page|page not found|just a moment|captcha/i;
// 非官方来源：论坛/应用商店/社媒（只在无官方来源时才用）
const UNOFFICIAL_RE = /forum|reddit|play\.google|apps\.apple|youtube|facebook|twitter|x\.com|quora|lowyat|medium\.com|trustpilot/i;

function isOfficial(url: string): boolean {
  return !UNOFFICIAL_RE.test(url);
}

// 给定任意查询，全网找退款政策正文（免费链路，并行读）
export async function universalSearchRead(queries: string[], maxUrls = 6): Promise<{ url: string; markdown: string } | null> {
  const seen = new Set<string>();
  const allUrls: string[] = [];
  // 先并行拿2个query的URL（DDG→Bing自动切换）
  const urlLists = await Promise.all(queries.slice(0, 2).map((q) => searchWeb(q)));
  for (const urls of urlLists) {
    for (const u of urls) {
      if (!seen.has(u)) {
        seen.add(u);
        allUrls.push(u);
      }
      if (allUrls.length >= maxUrls) break;
    }
    if (allUrls.length >= maxUrls) break;
  }
  // 并行Jina读，优先官方来源，论坛/商店仅兜底
  const results = await Promise.all(allUrls.slice(0, maxUrls).map(async (url) => ({ url, official: isOfficial(url), md: await jinaRead(url, 5000) })));
  const ok = results.filter((r) => r.md.length > 400 && REFUND_RE.test(r.md) && !BAD_RE.test(r.md));
  const official = ok.find((r) => r.official);
  if (official) return { url: official.url, markdown: official.md };
  const any = ok[0];
  return any ? { url: any.url, markdown: any.md } : null;
}
