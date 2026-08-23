export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-sm text-zinc-500">
        <p className="font-medium text-zinc-900 dark:text-white">Refund Hunter Global • 帮我退钱</p>
        <p className="mt-1">Free to check. 15% only if you get refund. No win, no fee. • Not a law firm, not affiliated with merchants.</p>
        <p className="mt-2 text-xs">We generate templates — you send them. Your data is deleted in 7 days. GDPR compliant.</p>
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <a href="/pricing" className="underline">Pricing</a>
          <a href="/tools" className="underline">Free Tools</a>
          <a href="mailto:hello@refundhunter.global" className="underline">Contact</a>
        </div>
      </div>
    </footer>
  );
}
