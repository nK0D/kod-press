import React from 'react';
import './admin.css'; // Shared admin CSS variables — loaded for all /admin/** routes

/**
 * Root admin layout — intentionally minimal.
 *
 * Does NOT call requireAuth() here. Authentication is enforced in:
 *   - src/app/admin/(protected)/layout.tsx  — for all authenticated admin pages
 *   - src/proxy.ts                          — edge-level route protection
 *
 * Login pages under /admin/login/** are intentionally public and must NOT
 * be wrapped in any auth check at this level.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
