'use client';

import React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import { Plus } from 'lucide-react';

export default function PluginsAdmin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plugins"
        description="Extend Depot's functionality with plugins."
        action={{
          label: 'Add New Plugin',
          href: '/admin/plugins/new',
          icon: Plus,
        }}
      />
      <EmptyState
        title="No plugins installed"
        message="Plugins add custom features, integrations, and extensions to your CMS. This will be built in Phase 11: Plugin System."
        action={{
          label: 'Browse plugins',
          href: '/admin/plugins/new',
        }}
      />
    </div>
  );
}
