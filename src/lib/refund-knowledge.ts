import policies from "./refund-policies.json";

export interface Policy {
  merchant: string;
  category: string;
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

const list = policies as Policy[];

export function findPolicy(merchantQuery: string): Policy | null {
  const q = merchantQuery.toLowerCase().trim();
  // 精确匹配优先
  let hit = list.find((p) => p.merchant.toLowerCase() === q);
  if (hit) return hit;
  // 包含匹配
  hit = list.find((p) => p.merchant.toLowerCase().includes(q) || q.includes(p.merchant.toLowerCase()));
  if (hit) return hit;
  // 模糊：Netflix/Netflix.com等
  hit = list.find((p) => q.includes(p.merchant.toLowerCase().split(" ")[0]));
  return hit || null;
}

export function searchPolicies(keyword: string): Policy[] {
  const k = keyword.toLowerCase();
  return list.filter(
    (p) =>
      p.merchant.toLowerCase().includes(k) ||
      p.markdown.toLowerCase().includes(k) ||
      p.extracted.conditions.join(" ").toLowerCase().includes(k)
  );
}

export function getAllPolicies(): Policy[] {
  return list;
}

export function getPolicyStats() {
  return {
    total: list.length,
    refundable: list.filter((p) => p.extracted.refundable).length,
    byCategory: list.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {}),
    crawledAt: list[0]?.crawled_at || null,
  };
}
