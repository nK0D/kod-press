'use client';

import React from 'react';
import { Inbox, FolderOpen } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center select-none bg-[var(--admin-card-bg)] border border-dashed border-[var(--admin-border)] rounded-2xl">
      <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-4 shadow-sm">
        <FolderOpen className="h-6 w-6" />
      </div>
      
      <h3 className="text-sm font-extrabold text-[var(--admin-text-primary)] mb-1.5">
        {title}
      </h3>
      
      <p className="text-xs text-[var(--admin-text-secondary)] font-medium max-w-sm leading-relaxed mb-5">
        {message}
      </p>

      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] rounded-xl shadow-sm transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
