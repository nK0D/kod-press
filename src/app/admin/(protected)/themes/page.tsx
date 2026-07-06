'use client';

import React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';

export default function ThemesAdmin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appearance"
        description="Manage the visual presentation of your Depot site."
      />
      <EmptyState
        title="No themes installed"
        message="Themes control how your site looks to visitors. You can install custom themes and configure menus and widgets. This will be built in Phase 10: Frontend Theming."
      />
    </div>
  );
}
