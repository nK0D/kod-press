import React from 'react';
import { requireAuth } from '@/lib/auth-utils';
import { getOption } from '@/lib/options';
import AdminShell from '@/components/admin/AdminShell';
import '../admin.css'; // Load admin CSS variables

export const metadata = {
  title: 'Depot Admin Area',
  description: 'Administrator panel for Depot CMS.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  
  // Retrieve site name from Options database
  const siteName = (await getOption('blogname')) || 'Depot';

  // Map Session User properties to shell-friendly contract
  const userProps = user
    ? {
        name: user.name || null,
        email: user.email || null,
        displayName: (user as any).displayName || user.name || null,
        role: (user as any).role || 'subscriber',
      }
    : null;

  return (
    <AdminShell siteName={siteName} user={userProps}>
      {children}
    </AdminShell>
  );
}
