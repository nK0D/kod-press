'use client';

import React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';

export default function CommentsAdmin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Comments"
        description="Moderate discussion lists, check spam reports, and approve articles."
      />

      <EmptyState
        title="No comments found"
        message="Discussion moderation allows authors to filter spam and answer reader comments. This will be built in Phase 12: Comments."
      />
    </div>
  );
}
