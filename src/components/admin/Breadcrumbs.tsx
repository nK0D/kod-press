'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Split path segments
  const segments = pathname
    .split('/')
    .filter((segment) => segment !== '');

  // Skip rendering if at root admin or guest pages
  if (segments.length <= 1) {
    return (
      <span className="text-xs font-bold text-[var(--admin-text-primary)]">
        Dashboard Overview
      </span>
    );
  }

  // Format segment strings for user display (e.g. 'new-post' -> 'New Post')
  const formatSegment = (str: string) => {
    return decodeURIComponent(str)
      .replace(/-|_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[var(--admin-text-secondary)] font-semibold select-none">
      <Link
        href="/admin"
        className="hover:text-[var(--admin-accent)] transition-colors text-[var(--admin-text-secondary)]"
      >
        Admin
      </Link>
      
      {segments.slice(1).map((segment, index) => {
        const isLast = index === segments.length - 2;
        const href = '/admin/' + segments.slice(1, index + 2).join('/');
        const name = formatSegment(segment);

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
            {isLast ? (
              <span className="text-[var(--admin-text-primary)] font-bold">
                {name}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-[var(--admin-accent)] transition-colors text-[var(--admin-text-secondary)]"
              >
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
