'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ComponentType<any>;
  };
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  const ActionIcon = action?.icon || Plus;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--admin-border)] pb-5 mb-6 select-none">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--admin-text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-[var(--admin-text-secondary)] font-semibold">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] rounded-xl shadow-sm transition-colors"
        >
          <ActionIcon className="h-4 w-4" />
          <span>{action.label}</span>
        </Link>
      )}
    </div>
  );
}
