export default function Pricing() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black">Pricing — No win, no fee</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mt-2">Free to check. 15% only if you get money back.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-6">
          <h3 className="font-bold">Free Check</h3>
          <div className="text-3xl font-black mt-2">$0</div>
          <ul className="mt-3 text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
            <li>• Unlimited receipt checks</li>
            <li>• Refund score 0-100</li>
            <li>• Email + chat templates (EN+ZH)</li>
            <li>• Copy & send yourself</li>
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 p-6">
          <h3 className="font-bold">Success Fee</h3>
          <div className="text-3xl font-black mt-2">15% <span className="text-sm font-normal">of refund</span></div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">$5 min / $50 max. Under $2 free.</p>
          <ul className="mt-3 text-sm space-y-1">
            <li>• $20 refund → you pay $3</li>
            <li>• $100 refund → you pay $15</li>
            <li>• $600 flight → you pay $50 (capped)</li>
            <li>• Lose → pay $0</li>
          </ul>
          <p className="text-xs mt-3 text-zinc-500">You upload proof → we verify → LemonSqueezy link. No card upfront.</p>
        </div>
      </div>
      <div className="mt-6 bg-zinc-900 text-white rounded-xl p-4 text-sm">
        Example: 100 refunds × $40 avg × 15% = <span className="font-bold text-emerald-400">$600/mo</span> on autopilot. AirHelp does €32B unclaimed at 35% — we do it at 15% globally.
      </div>
    </div>
  );
}
