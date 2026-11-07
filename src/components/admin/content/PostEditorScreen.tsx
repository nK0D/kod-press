import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { AccessDenied, can } from '@/lib/access';
import { requireActor } from '@/lib/auth-utils';
import { content, ContentError, getPostType, supports, type PostDetail } from '@/lib/content';
import PostEditor from './PostEditor';
import { treeOrder } from './tree';

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function noticeMessage(key: string | undefined, post: PostDetail | null, singular: string): string | undefined {
  if (key === 'revision-restored') return 'Revision restored.';
  if (key !== 'created' || !post) return undefined;
  if (post.status === 'publish') return `${singular} published.`;
  if (post.status === 'pending') return `${singular} submitted for review.`;
  if (post.status === 'private') return `${singular} saved as private.`;
  return 'Draft saved.';
}

export default async function PostEditorScreen({
  type,
  params,
  searchParams,
}: {
  type: string;
  params?: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const definition = getPostType(type);
  if (!definition) notFound();
  const actor = await requireActor();
  if (!can(actor, definition.caps.edit)) redirect('/admin');

  let post: PostDetail | null = null;
  if (params) {
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id <= 0) notFound();
    try {
      post = await content.get(actor, id);
    } catch (error) {
      if (error instanceof ContentError && error.code === 'not_found') notFound();
      if (error instanceof AccessDenied) redirect(`${definition.adminPath}?error=${encodeURIComponent(error.message)}`);
      throw error;
    }
    if (post.type !== definition.name) {
      const actual = getPostType(post.type);
      redirect(actual ? `${actual.adminPath}/${post.id}` : definition.adminPath);
    }
    if (post.status === 'trash') {
      redirect(`${definition.adminPath}?status=trash&error=${encodeURIComponent(`“${post.title || '(no title)'}” is in the Trash. Restore it to edit.`)}`);
    }
  }

  const hasCategories = definition.taxonomies.includes('category');
  const hasTags = definition.taxonomies.includes('post_tag');
  const [categories, tags, revisions, siblings] = await Promise.all([
    hasCategories ? content.terms.list('category') : [],
    hasTags ? content.terms.list('post_tag') : [],
    post && supports(definition, 'revisions') ? content.revisions(actor, post.id) : [],
    definition.hierarchical ? content.list(actor, { type: definition.name, status: 'all', perPage: 100 }) : null,
  ]);

  // A page cannot be nested under itself or its descendants, so leave that branch out of the choices.
  const excluded = new Set<number>(post ? [post.id] : []);
  const parentOptions = siblings
    ? treeOrder(siblings.items)
        .filter(({ item }) => {
          if (excluded.has(item.id) || excluded.has(item.parent)) {
            excluded.add(item.id);
            return false;
          }
          return true;
        })
        .map(({ item, depth }) => ({ id: item.id, title: item.title, depth }))
    : [];

  const query = await searchParams;
  const error = first(query.error);
  const success = noticeMessage(first(query.notice), post, definition.singular);
  const notice = error ? { tone: 'error' as const, message: error } : success ? { tone: 'success' as const, message: success } : undefined;

  return (
    <PostEditor
      key={post?.id ?? 'new'}
      type={{
        name: definition.name,
        singular: definition.singular,
        label: definition.label,
        adminPath: definition.adminPath,
        hasCategories,
        hasTags,
        hasExcerpt: supports(definition, 'excerpt'),
        hasComments: supports(definition, 'comments'),
        hasPageAttributes: supports(definition, 'page-attributes'),
      }}
      post={post}
      categories={categories}
      tagSuggestions={tags.map((tag) => tag.name)}
      parentOptions={parentOptions}
      revisions={revisions}
      canPublish={can(actor, definition.caps.publish)}
      canManageCategories={can(actor, 'manage_categories')}
      notice={notice}
    />
  );
}
