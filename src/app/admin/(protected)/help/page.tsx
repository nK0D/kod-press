'use client';

import React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';

export default function HelpAdmin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & Documentation"
        description="Get started guides, reference articles, and troubleshooting tips."
      />
      <EmptyState
        title="Documentation coming soon"
        message="An integrated help center with guides covering posts, pages, themes, plugins, and settings will be built in Phase 15: Admin Help & Documentation."
      />
    </div>
  );
}
