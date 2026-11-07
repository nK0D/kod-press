'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AdminShellProps {
  siteName: string;
  user: {
    name?: string | null;
    email?: string | null;
    displayName?: string | null;
    role?: string | null;
  } | null;
  children: React.ReactNode;
}

export default function AdminShell({ siteName, user, children }: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Sync collapsed state from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem('kodpress-sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
    setIsMounted(true);
  }, []);

  const handleSetCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem('kodpress-sidebar-collapsed', String(collapsed));
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-400 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Loading admin console...
        </div>
      </div>
    );
  }

  // Compute sidebar width offset for desktop layout
  const sidebarWidth = isCollapsed ? 68 : 260;

  return (
    <div className="min-h-screen bg-[var(--admin-content-bg)] text-[var(--admin-text-primary)]">
      {/* Sidebar — fixed positioned, so content area needs margin-left on lg+ */}
      <Sidebar
        siteName={siteName}
        isCollapsed={isCollapsed}
        setIsCollapsed={handleSetCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main content area — offset on desktop, full width on mobile */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Override to 0 on mobile handled via the @media logic on sidebar being fixed but hidden */}
        <style>{`
          @media (max-width: 1023px) {
            .admin-main { margin-left: 0 !important; }
          }
        `}</style>

        <Topbar user={user} setIsMobileOpen={setIsMobileOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
