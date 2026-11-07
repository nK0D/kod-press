import React from 'react';
import { requireAuth } from '@/lib/auth-utils';
import { getOption } from '@/lib/options';
import AdminShell from '@/components/admin/AdminShell';
import '../admin.css'; // Load admin CSS variables

export const metadata = {
  title: 'KodPress Admin Area',
  description: 'Administrator panel for KodPress CMS.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  
  // Retrieve site name from Options database
  const siteName = (await getOption('blogname')) || 'KodPress';

  // Map Session User properties to shell-friendly contract
  const userProps = user
    ? {
        name: user.name || null,
        email: user.email || null,
        displayName: user.displayName || user.name || null,
        role: user.role || 'subscriber',
      }
    : null;

  return (
    <AdminShell siteName={siteName} user={userProps}>
      {children}
    </AdminShell>
  );
}
