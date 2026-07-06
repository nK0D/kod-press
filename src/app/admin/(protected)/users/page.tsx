'use client';

import React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import { UserPlus } from 'lucide-react';

export default function UsersAdmin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage site administrators, editors, authors, and subscribers."
        action={{
          label: 'Add New User',
          href: '/admin/users/new',
          icon: UserPlus,
        }}
      />
      <EmptyState
        title="User management coming soon"
        message="Create and assign roles to users who can contribute content. Full user management will be built in Phase 8: Users & Roles."
        action={{
          label: 'Add new user',
          href: '/admin/users/new',
        }}
      />
    </div>
  );
}
