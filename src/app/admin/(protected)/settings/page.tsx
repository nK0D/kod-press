'use client';

import React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';

export default function SettingsAdmin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure general, writing, reading, discussion, and permalink options."
      />
      <EmptyState
        title="Settings configuration coming soon"
        message="Full settings management including site title, tagline, permalinks, and timezone will be available in Phase 9: Settings & Permalink System."
      />
    </div>
  );
}
