// 动态政策库 — 自学习：任意公司被发现后持久化，下次直接命中
// 本地写 .data/dynamic-policies.json；Vercel只读FS时自动降级为内存

import fs from "fs";
import path from "path";

export interface StoredPolicy {
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
  crawled_at: string;
}

const TTL = 3 * 24 * 60 * 60 * 1000; // 与 POLICY_TTL_DAYS 一致
const mem = new Map<string, { data: StoredPolicy; ts: number }>();
let fileOk: boolean | null = null;

function filePath(): string {
  return path.join(process.cwd(), ".data", "dynamic-policies.json");
}

function loadFile(): void {
  if (fileOk !== null) return;
  try {
    const raw = fs.readFileSync(filePath(), "utf-8");
    const obj = JSON.parse(raw) as Record<string, { data: StoredPolicy; ts: number }>;
    for (const [k, v] of Object.entries(obj)) {
      if (!mem.has(k)) mem.set(k, v);
    }
    fileOk = true;
  } catch {
    fileOk = false; // 只读FS或不存在
  }
}

function saveFile(): void {
  if (fileOk === false) return;
  try {
    fs.mkdirSync(path.dirname(filePath()), { recursive: true });
    const obj: Record<string, unknown> = {};
    for (const [k, v] of mem.entries()) obj[k] = v;
    fs.writeFileSync(filePath(), JSON.stringify(obj), "utf-8");
    fileOk = true;
  } catch {
    fileOk = false; // Vercel只读 → 内存兜底
  }
}

export function getDynamic(merchant: string): StoredPolicy | null {
  loadFile();
  const hit = mem.get(merchant.toLowerCase());
  if (!hit) return null;
  if (Date.now() - hit.ts > TTL) return null; // 过期视为无，走活验证
  return hit.data;
}

export function setDynamic(policy: StoredPolicy): void {
  loadFile();
  mem.set(policy.merchant.toLowerCase(), { data: policy, ts: Date.now() });
  saveFile();
}

export function dynamicStats() {
  loadFile();
  let fresh = 0;
  for (const [, v] of mem.entries()) if (Date.now() - v.ts <= TTL) fresh++;
  return { total: mem.size, fresh, persisted: fileOk === true };
}
