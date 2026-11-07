'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Menu,
  Plus,
  ExternalLink,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';

interface TopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    displayName?: string | null;
    role?: string | null;
  } | null;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Topbar({ user, setIsMobileOpen }: TopbarProps) {
  const pathname = usePathname();
  const [isThemeDark, setIsThemeDark] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const newMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load and apply theme from localStorage on load
  useEffect(() => {
    const savedTheme = localStorage.getItem('kodpress-admin-theme') || 'light';
    const isDark = savedTheme === 'dark';
    setIsThemeDark(isDark);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  // Toggle theme handler
  const toggleTheme = () => {
    const newTheme = !isThemeDark ? 'dark' : 'light';
    setIsThemeDark(!isThemeDark);
    localStorage.setItem('kodpress-admin-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(event.target as Node)) {
        setIsNewMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-[var(--admin-topbar-bg)] border-b border-[var(--admin-border)] flex items-center justify-between px-4 sm:px-6 shadow-sm select-none transition-all duration-200">
      {/* Left side: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--admin-text-secondary)]"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Dynamic Breadcrumbs */}
        <Breadcrumbs />
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Visit site link */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Visit Site</span>
        </Link>

        {/* "New" Dropdown */}
        <div className="relative" ref={newMenuRef}>
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          
          {isNewMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl py-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-100">
              <Link
                href="/admin/posts/new"
                onClick={() => setIsNewMenuOpen(false)}
                className="block px-4 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--admin-text-primary)]"
              >
                Post
              </Link>
              <Link
                href="/admin/pages/new"
                onClick={() => setIsNewMenuOpen(false)}
                className="block px-4 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--admin-text-primary)]"
              >
                Page
              </Link>
              <Link
                href="/admin/media/new"
                onClick={() => setIsNewMenuOpen(false)}
                className="block px-4 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--admin-text-primary)]"
              >
                Media
              </Link>
              <Link
                href="/admin/users/new"
                onClick={() => setIsNewMenuOpen(false)}
                className="block px-4 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--admin-text-primary)]"
              >
                User
              </Link>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[var(--admin-border)]" />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--admin-text-secondary)] transition-colors cursor-pointer"
          title="Toggle color theme"
        >
          {isThemeDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {/* Mock/Initials Avatar */}
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-black text-xs flex items-center justify-center uppercase">
              {user?.displayName ? user.displayName.slice(0, 2) : (user?.name ? user.name.slice(0, 2) : 'AD')}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-[var(--admin-text-primary)]">
              {user?.displayName || user?.name || 'Administrator'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl py-2.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-100">
              <div className="px-4 py-1.5 border-b border-[var(--admin-border)] pb-2 mb-2">
                <p className="text-xs font-bold text-[var(--admin-text-primary)] truncate">
                  {user?.displayName || user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-[var(--admin-text-secondary)] truncate">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
              <Link
                href="/admin/users/profile"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--admin-text-primary)]"
              >
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                <span>Your Profile</span>
              </Link>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-red-500/10 text-red-500 hover:text-red-400 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
