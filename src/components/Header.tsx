"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">R</div>
          <span className="font-semibold tracking-tight text-zinc-900 dark:text-white">Refund Hunter</span>
          <span className="hidden sm:inline text-xs bg-zinc-900 text-white px-2 py-0.5 rounded-full dark:bg-white dark:text-zinc-900">GLOBAL</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/#how" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">How it works</Link>
          <Link href="/tools" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">Free Tools</Link>
          <Link href="/pricing" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">Pricing</Link>
          <Link href="/app" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full font-medium transition">Start Hunting →</Link>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2">
          <div className="space-y-1">
            <div className="w-5 h-0.5 bg-zinc-800 dark:bg-white" />
            <div className="w-5 h-0.5 bg-zinc-800 dark:bg-white" />
            <div className="w-5 h-0.5 bg-zinc-800 dark:bg-white" />
          </div>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t bg-white dark:bg-zinc-950 px-4 py-4 space-y-3">
          <Link href="/#how" className="block text-sm">How it works</Link>
          <Link href="/tools" className="block text-sm">Free Tools</Link>
          <Link href="/pricing" className="block text-sm">Pricing</Link>
          <Link href="/app" className="block bg-emerald-500 text-white text-center py-2 rounded-full">Start Hunting →</Link>
        </div>
      )}
    </header>
  );
}
