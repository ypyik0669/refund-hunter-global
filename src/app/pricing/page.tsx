import { PRICING } from "@/lib/pricing";

export default function Pricing() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black">Free check. ${PRICING.caseUnlock} to win.</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mt-2">检测永远免费。大部分退款赢在追讨序列，不在第一封邮件。</p>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-6">
          <h3 className="font-bold">Free Check</h3>
          <div className="text-3xl font-black mt-2">$0</div>
          <ul className="mt-3 text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
            <li>• 无限收据检测（任意公司）</li>
            <li>• 退款概率评分 0-100</li>
            <li>• 第一封邮件模板 EN（带水印）</li>
            <li>• 政策来源官方链接核验</li>
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Unlock 单次</h3>
            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">最受欢迎</span>
          </div>
          <div className="text-3xl font-black mt-2">${PRICING.caseUnlock}<span className="text-sm font-normal">/单</span></div>
          <ul className="mt-3 text-sm space-y-1">
            <li>• ⚔️ 三连追讨序列（坚定版+最后通牒）</li>
            <li>• 💬 中英客服话术</li>
            <li>• 📧 中文第一封 + 全套中文追讨</li>
            <li>• 去水印</li>
          </ul>
          <a href={PRICING.checkoutCase || "#"} target={PRICING.checkoutCase ? "_blank" : undefined} className="mt-4 block text-center bg-emerald-500 text-white py-2.5 rounded-full font-semibold">
            ${PRICING.caseUnlock} 解锁本单
          </a>
        </div>
        <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-6">
          <h3 className="font-bold">Unlimited 月订阅</h3>
          <div className="text-3xl font-black mt-2">${PRICING.monthly}<span className="text-sm font-normal">/月</span></div>
          <ul className="mt-3 text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
            <li>• 单次解锁全部功能</li>
            <li>• 无限 case</li>
            <li>• 适合多个订阅在手的人</li>
            <li>• 随时取消</li>
          </ul>
          <a href={PRICING.checkoutMonthly || "#"} target={PRICING.checkoutMonthly ? "_blank" : undefined} className="mt-4 block text-center border py-2.5 rounded-full font-semibold">
            ${PRICING.monthly}/月
          </a>
        </div>
      </div>
      <div className="mt-6 bg-zinc-900 text-white rounded-xl p-4 text-sm">
        大额索赔（航班/年费 &gt;$100）：成功后抽成模式即将推出 — 不赢不收费。
      </div>
    </div>
  );
}
