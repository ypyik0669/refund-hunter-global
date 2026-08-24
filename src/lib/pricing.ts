// 定价常量 — 数字之后可调，只改这里
export const PRICING = {
  caseUnlock: 0.99,
  monthly: 3.99,
  currency: "USD",
  // LemonSqueezy/Stripe checkout 链接（.env 配置；为空时前端显示"即将开通"）
  checkoutCase: process.env.NEXT_PUBLIC_CHECKOUT_CASE_URL || "",
  checkoutMonthly: process.env.NEXT_PUBLIC_CHECKOUT_MONTHLY_URL || "",
};
