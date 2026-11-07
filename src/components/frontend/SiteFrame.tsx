import React from 'react';
import Link from 'next/link';
import type { SiteInfo } from '@/lib/site';

/**
 * Placeholder public layout until the theming system (Phase 10) replaces it.
 */
export default function SiteFrame({ site, children }: { site: SiteInfo; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-white hover:text-indigo-300">
            {site.title}
          </Link>
          <Link href="/admin" className="text-xs font-semibold text-slate-400 hover:text-white">
            Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">{children}</main>
      <footer className="border-t border-slate-800/80">
        <p className="mx-auto max-w-3xl px-6 py-6 text-xs text-slate-500">
          {site.title} · Powered by KodPress
        </p>
      </footer>
    </div>
  );
}

export function formatPublicDate(date: Date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
