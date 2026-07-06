'use client';

import React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import { Upload } from 'lucide-react';

export default function MediaAdmin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Organize pictures, documents, videos, and music clips."
        action={{
          label: 'Upload New Media',
          href: '/admin/media/new',
          icon: Upload,
        }}
      />

      <EmptyState
        title="No media files found"
        message="Drag and drop or upload files to save them in Depot's file assets store. This will be implemented in Phase 6: Media Library."
        action={{
          label: 'Add first attachment',
          href: '/admin/media/new',
        }}
      />
    </div>
  );
}
