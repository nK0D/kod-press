'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string | number;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normStatus = String(status).toLowerCase();

  let bgClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350 border-slate-200 dark:border-slate-700';
  let label = normStatus;

  switch (normStatus) {
    case 'publish':
    case 'published':
    case 'active':
    case '0':
      bgClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30';
      label = normStatus === '0' || normStatus === 'active' ? 'Active' : 'Published';
      break;

    case 'draft':
      bgClass = 'bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/50';
      label = 'Draft';
      break;

    case 'pending':
    case 'pending_review':
      bgClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30';
      label = 'Pending';
      break;

    case 'trash':
    case 'trashed':
    case 'deleted':
    case '2':
      bgClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30';
      label = normStatus === '2' || normStatus === 'deleted' ? 'Deleted' : 'Trashed';
      break;

    case 'spam':
    case '1':
      bgClass = 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200/50 dark:border-red-900/30';
      label = 'Spam';
      break;

    case 'future':
      bgClass = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30';
      label = 'Scheduled';
      break;

    case 'private':
      bgClass = 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/30';
      label = 'Private';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${bgClass}`}>
      {label}
    </span>
  );
}
