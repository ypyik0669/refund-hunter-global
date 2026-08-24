// 真浏览器渲染 — 解决SPA/JS重站（Jina拿壳的站）
// 本地Playwright Chromium免费；Vercel无Chromium时优雅返回null

import type { Browser, Page } from "playwright";

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser | null> {
  if (!browserPromise) {
    browserPromise = (async () => {
      const { chromium } = await import("playwright");
      return chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-blink-features=AutomationControlled"],
      });
    })();
  }
  try {
    return await browserPromise;
  } catch {
    return null; // Vercel/无浏览器环境
  }
}

export interface RenderedPage { url: string; text: string; title: string }

export async function renderPage(url: string, timeoutMs = 12000): Promise<RenderedPage | null> {
  let page: Page | null = null;
  try {
    const browser = await getBrowser();
    if (!browser) return null;
    page = await browser.newPage({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
    });
    // 屏蔽重资源提速
    await page.route("**/*", (route) => {
      const t = route.request().resourceType();
      if (["image", "font", "media"].includes(t)) return route.abort();
      return route.continue();
    });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    const title = await page.title().catch(() => "");
    // 滚动触发懒加载
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
    await page.waitForTimeout(400);
    const text = await page.evaluate(() => document.body?.innerText?.slice(0, 15000) || "");
    if (!text || text.length < 200) return null;
    return { url, text, title };
  } catch {
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    try { (await browserPromise).close(); } catch {}
    browserPromise = null;
  }
}
