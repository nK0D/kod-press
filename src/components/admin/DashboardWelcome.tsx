'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, FileText, Settings, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardWelcome() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('depot-welcome-dismissed') === 'true';
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('depot-welcome-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-indigo-900/40 via-violet-950/20 to-slate-900/40 border border-slate-800/80 p-6 sm:p-8 rounded-2xl animate-in fade-in duration-300 select-none">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-350 hover:bg-slate-850/40 transition-all cursor-pointer"
        title="Dismiss welcome panel"
      >
        <X className="h-4.5 w-4.5" />
      </button>

      <div className="flex gap-4 items-start sm:items-center mb-4">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
            Welcome to Depot!
          </h2>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            We've assembled some links to get you started:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Step 1 */}
        <div className="p-4 bg-slate-950/20 hover:bg-slate-950/40 border border-slate-800/50 rounded-xl space-y-2.5 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <FileText className="h-4 w-4" />
            <span>Create Content</span>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
            Write news articles, create custom navigation pages, and build attachments.
          </p>
          <Link
            href="/admin/posts/new"
            className="inline-block text-xs font-bold text-slate-200 hover:text-indigo-400 transition-colors"
          >
            Write your first post &rarr;
          </Link>
        </div>

        {/* Step 2 */}
        <div className="p-4 bg-slate-950/20 hover:bg-slate-950/40 border border-slate-800/50 rounded-xl space-y-2.5 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Home className="h-4 w-4" />
            <span>Setup Frontend</span>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
            Choose what page displays on the front of your website, manage options.
          </p>
          <Link
            href="/admin/settings"
            className="inline-block text-xs font-bold text-slate-200 hover:text-indigo-400 transition-colors"
          >
            Configure reading settings &rarr;
          </Link>
        </div>

        {/* Step 3 */}
        <div className="p-4 bg-slate-950/20 hover:bg-slate-950/40 border border-slate-800/50 rounded-xl space-y-2.5 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Settings className="h-4 w-4" />
            <span>Manage Settings</span>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
            Modify site title, description, permalinks structure, and email credentials.
          </p>
          <Link
            href="/admin/settings"
            className="inline-block text-xs font-bold text-slate-200 hover:text-indigo-400 transition-colors"
          >
            Change site settings &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
