'use client';

import React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import { Plus } from 'lucide-react';

export default function PostsAdmin() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Posts"
        description="Create, edit, delete, or organize your site posts."
        action={{
          label: 'Add New Post',
          href: '/admin/posts/new',
          icon: Plus,
        }}
      />

      <EmptyState
        title="No posts found"
        message="You haven't written any posts yet. Post publishing, categories, and tags will be fully functional in Phase 5: Content."
        action={{
          label: 'Create first post',
          href: '/admin/posts/new',
        }}
      />
    </div>
  );
}
