'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Image,
  Layers,
  MessageSquare,
  Palette,
  Plug,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  siteName: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface SubMenuItem {
  title: string;
  href: string;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  submenu?: SubMenuItem[];
}

export default function Sidebar({
  siteName,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Navigation Items
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'Posts',
      href: '/admin/posts',
      icon: FileText,
      submenu: [
        { title: 'All Posts', href: '/admin/posts' },
        { title: 'Add New Post', href: '/admin/posts/new' },
        { title: 'Categories', href: '/admin/posts/categories' },
        { title: 'Tags', href: '/admin/posts/tags' },
      ],
    },
    {
      title: 'Media',
      href: '/admin/media',
      icon: Image,
      submenu: [
        { title: 'Library', href: '/admin/media' },
        { title: 'Add New Media', href: '/admin/media/new' },
      ],
    },
    {
      title: 'Pages',
      href: '/admin/pages',
      icon: Layers,
      submenu: [
        { title: 'All Pages', href: '/admin/pages' },
        { title: 'Add New Page', href: '/admin/pages/new' },
      ],
    },
    {
      title: 'Comments',
      href: '/admin/comments',
      icon: MessageSquare,
    },
    {
      title: 'Appearance',
      href: '/admin/themes',
      icon: Palette,
      submenu: [
        { title: 'Themes', href: '/admin/themes' },
        { title: 'Menus', href: '/admin/themes/menus' },
        { title: 'Widgets', href: '/admin/themes/widgets' },
      ],
    },
    {
      title: 'Plugins',
      href: '/admin/plugins',
      icon: Plug,
      submenu: [
        { title: 'Installed Plugins', href: '/admin/plugins' },
        { title: 'Add New Plugin', href: '/admin/plugins/new' },
      ],
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users,
      submenu: [
        { title: 'All Users', href: '/admin/users' },
        { title: 'Add New User', href: '/admin/users/new' },
        { title: 'Your Profile', href: '/admin/users/profile' },
      ],
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      submenu: [
        { title: 'General', href: '/admin/settings' },
        { title: 'Writing', href: '/admin/settings/writing' },
        { title: 'Reading', href: '/admin/settings/reading' },
        { title: 'Discussion', href: '/admin/settings/discussion' },
        { title: 'Media', href: '/admin/settings/media' },
        { title: 'Permalinks', href: '/admin/settings/permalinks' },
      ],
    },
    {
      title: 'Help',
      href: '/admin/help',
      icon: HelpCircle,
    },
  ];

  // Auto-open active menu on load
  useEffect(() => {
    const updated: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.submenu) {
        const isChildActive = item.submenu.some(
          (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
        );
        if (isChildActive) {
          updated[item.title] = true;
        }
      }
    });
    setOpenMenus((prev) => ({ ...prev, ...updated }));
  }, [pathname]);

  const toggleSubmenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isItemActive = (item: MenuItem) => {
    if (item.href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(item.href);
  };

  const isSubItemActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Core */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0f172a] text-slate-400 border-r border-slate-800/80 transition-all duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-[68px]' : 'w-[260px]'}`}
      >
        {/* Branding header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800/85">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-black tracking-wider text-slate-100 select-none"
          >
            <span className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-sm text-white font-extrabold shadow-md shadow-indigo-600/35">
              D
            </span>
            {!isCollapsed && (
              <span className="text-sm font-bold truncate max-w-[170px] uppercase text-slate-200">
                {siteName}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-200"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {menuItems.map((item) => {
            const active = isItemActive(item);
            const subOpen = openMenus[item.title];
            const Icon = item.icon;

            return (
              <div key={item.title} className="space-y-1">
                {item.submenu ? (
                  // Item with submenus
                  <div>
                    {isCollapsed ? (
                      // Collapsed Hover Dropdown Wrapper
                      <div className="relative group">
                        <button
                          onClick={() => {
                            setIsCollapsed(false);
                            toggleSubmenu(item.title);
                          }}
                          className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer
                            ${active ? 'bg-indigo-600/10 text-white font-semibold' : 'hover:bg-slate-800/50 hover:text-slate-200'}`}
                        >
                          <Icon className={`h-5 w-5 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                        </button>
                        {/* Hover Tooltip/Menu */}
                        <div className="absolute left-full top-0 ml-2 hidden group-hover:flex flex-col bg-slate-950 border border-slate-800 rounded-xl py-2 px-1 shadow-2xl w-48 z-[60]">
                          <div className="px-3 py-1 text-xs font-bold text-slate-400 border-b border-slate-850 pb-1 mb-1">
                            {item.title}
                          </div>
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              className="px-3 py-1.5 text-xs rounded-lg hover:bg-slate-800 hover:text-slate-100 transition-colors text-slate-400"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Expanded Collapsible Item
                      <>
                        <button
                          onClick={() => toggleSubmenu(item.title)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-sm font-semibold cursor-pointer
                            ${active ? 'bg-indigo-600/10 text-white' : 'hover:bg-slate-800/50 hover:text-slate-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4.5 w-4.5 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                            <span>{item.title}</span>
                          </div>
                          {subOpen ? (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                          )}
                        </button>

                        {/* Submenu links */}
                        {subOpen && (
                          <div className="pl-9 pr-2 py-1.5 space-y-1 bg-slate-950/20 rounded-xl mt-1 border-l-2 border-slate-800/50 ml-5">
                            {item.submenu.map((sub) => {
                              const subActive = isSubItemActive(sub.href);
                              return (
                                <Link
                                  key={sub.title}
                                  href={sub.href}
                                  className={`block py-1.5 px-3 text-xs font-medium rounded-lg transition-colors
                                    ${subActive ? 'text-indigo-400 bg-indigo-500/5 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                  {sub.title}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  // Simple Item
                  <div className="relative group">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl transition-all font-semibold
                        ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 text-sm'}
                        ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'hover:bg-slate-800/50 hover:text-slate-200'}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>

                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 shadow-2xl text-xs font-bold text-slate-100 z-50 whitespace-nowrap">
                        {item.title}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info & toggle button */}
        <div className="border-t border-slate-800/80 bg-slate-950/20 p-3 space-y-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 text-[10px] text-slate-500 font-bold select-none uppercase tracking-wider">
              <span>Depot CMS</span>
              <span>v1.0.0</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center py-2 px-3 hover:bg-slate-800/60 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer lg:flex hidden"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse menu</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
