'use client';

import React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import { Plus } from 'lucide-react';

export default function PagesAdmin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pages"
        description="Configure hierarchical structure pages on your website."
        action={{
          label: 'Add New Page',
          href: '/admin/pages/new',
          icon: Plus,
        }}
      />

      <EmptyState
        title="No pages found"
        message="Static pages allow you to manage layouts like 'About Us' or 'Contact'. This will be unlocked in Phase 5: Content."
        action={{
          label: 'Create first page',
          href: '/admin/pages/new',
        }}
      />
    </div>
  );
}
