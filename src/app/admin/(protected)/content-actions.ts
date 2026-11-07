'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireActor } from '@/lib/auth-utils';
import { content, getPostType, isTaxonomy, TAXONOMIES, type BulkResult, type PostDetail } from '@/lib/content';
import { actionErrorMessage } from '@/lib/content/action-error';

export interface FormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  /** Changes on every submission so the form can react to repeated identical results. */
  at?: number;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function integer(formData: FormData, key: string): number {
  const value = Number(text(formData, key));
  return Number.isInteger(value) ? value : 0;
}

function idList(formData: FormData, key: string): number[] {
  return formData
    .getAll(key)
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
}

/** Keeps redirects inside the admin screen they came from. */
function withParams(returnTo: string, fallback: string, params: Record<string, string | number>): string {
  const url = new URL(returnTo.startsWith(fallback) ? returnTo : fallback, 'http://kodpress.local');
  for (const key of ['notice', 'error', 'changed', 'skipped']) url.searchParams.delete(key);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  return `${url.pathname}${url.search}`;
}

/** Content shows up across the admin and the public site, so refresh every route. */
function revalidateContent() {
  revalidatePath('/', 'layout');
}

function savedMessage(post: PostDetail, singular: string, wasPublished: boolean): string {
  switch (post.status) {
    case 'publish':
      return wasPublished ? `${singular} updated.` : `${singular} published.`;
    case 'private':
      return `${singular} saved as private.`;
    case 'pending':
      return `${singular} submitted for review.`;
    default:
      return 'Draft saved.';
  }
}

export async function savePostAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireActor();
  const definition = getPostType(text(formData, 'type'));
  if (!definition) return { status: 'error', message: 'Unknown content type.', at: Date.now() };

  const id = integer(formData, 'id') || undefined;
  const intent = text(formData, 'intent');
  const status = intent === 'draft' ? 'draft' : intent === 'publish' ? 'publish' : text(formData, 'status');
  const hasDiscussion = formData.has('discussion');

  let saved: PostDetail;
  try {
    saved = await content.save(actor, {
      id,
      type: definition.name,
      title: text(formData, 'title'),
      content: text(formData, 'content'),
      excerpt: text(formData, 'excerpt'),
      slug: text(formData, 'slug'),
      status,
      commentStatus: hasDiscussion ? (formData.has('commentStatus') ? 'open' : 'closed') : undefined,
      pingStatus: hasDiscussion ? (formData.has('pingStatus') ? 'open' : 'closed') : undefined,
      parent: integer(formData, 'parent'),
      menuOrder: integer(formData, 'menuOrder'),
      categoryIds: idList(formData, 'categoryIds'),
      newCategory: text(formData, 'newCategory'),
      tags: text(formData, 'tags')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  } catch (error) {
    return { status: 'error', message: actionErrorMessage(error), at: Date.now() };
  }

  revalidateContent();
  if (!id) redirect(`${definition.adminPath}/${saved.id}?notice=created`);
  return { status: 'success', message: savedMessage(saved, definition.singular, formData.get('wasPublished') === '1'), at: Date.now() };
}

const BULK_ACTIONS = ['trash', 'restore', 'delete', 'publish', 'draft'] as const;
type BulkAction = (typeof BULK_ACTIONS)[number];

/**
 * Handles both the bulk-action form (`bulkAction` + checked `ids`) and the
 * per-row buttons, which submit `row=<action>:<id>`.
 */
export async function postBulkAction(formData: FormData) {
  const actor = await requireActor();
  const definition = getPostType(text(formData, 'type'));
  if (!definition) redirect('/admin');
  const returnTo = text(formData, 'returnTo');

  let action = text(formData, 'bulkAction');
  let ids = idList(formData, 'ids');
  const row = text(formData, 'row');
  if (row) {
    const [rowAction, rowId] = row.split(':');
    action = rowAction;
    ids = [Number(rowId)].filter((id) => Number.isInteger(id) && id > 0);
  }
  if (!(BULK_ACTIONS as readonly string[]).includes(action) || !ids.length) {
    redirect(withParams(returnTo, definition.adminPath, { error: 'Choose an action and at least one item.' }));
  }

  let result: BulkResult;
  try {
    switch (action as BulkAction) {
      case 'trash':
        result = await content.trash(actor, ids);
        break;
      case 'restore':
        result = await content.restore(actor, ids);
        break;
      case 'delete':
        result = await content.remove(actor, ids);
        break;
      case 'publish':
        result = await content.setStatus(actor, ids, 'publish');
        break;
      case 'draft':
        result = await content.setStatus(actor, ids, 'draft');
        break;
    }
  } catch (error) {
    redirect(withParams(returnTo, definition.adminPath, { error: actionErrorMessage(error) }));
  }

  revalidateContent();
  redirect(withParams(returnTo, definition.adminPath, { notice: action, changed: result.changed, skipped: result.skipped }));
}

/** Bound with the revision id: `restoreRevisionAction.bind(null, revisionId)`. */
export async function restoreRevisionAction(revisionId: number, formData: FormData) {
  const actor = await requireActor();
  const definition = getPostType(text(formData, 'type'));
  if (!definition) redirect('/admin');
  const postId = integer(formData, 'id');

  let restored: PostDetail;
  try {
    restored = await content.restoreRevision(actor, revisionId);
  } catch (error) {
    redirect(`${definition.adminPath}/${postId}?error=${encodeURIComponent(actionErrorMessage(error))}`);
  }

  revalidateContent();
  redirect(`${definition.adminPath}/${restored.id}?notice=revision-restored`);
}

export async function createTermAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireActor();
  const taxonomy = text(formData, 'taxonomy');
  if (!isTaxonomy(taxonomy)) return { status: 'error', message: 'Unknown taxonomy.', at: Date.now() };

  try {
    const term = await content.terms.create(actor, taxonomy, {
      name: text(formData, 'name'),
      slug: text(formData, 'slug'),
      description: text(formData, 'description'),
      parent: integer(formData, 'parent'),
    });
    revalidateContent();
    return { status: 'success', message: `“${term.name}” added.`, at: Date.now() };
  } catch (error) {
    return { status: 'error', message: actionErrorMessage(error), at: Date.now() };
  }
}

/** Moves the post open in the editor (`id` + `type` fields) to the Trash. */
export async function trashPostAction(formData: FormData) {
  const actor = await requireActor();
  const definition = getPostType(text(formData, 'type'));
  if (!definition) redirect('/admin');

  let result: BulkResult;
  try {
    result = await content.trash(actor, [integer(formData, 'id')]);
  } catch (error) {
    redirect(withParams(definition.adminPath, definition.adminPath, { error: actionErrorMessage(error) }));
  }

  revalidateContent();
  redirect(withParams(definition.adminPath, definition.adminPath, { notice: 'trash', changed: result.changed, skipped: result.skipped }));
}

/** Update or delete a category/tag from the terms screen (`intent` = update | delete). */
export async function termAction(formData: FormData) {
  const actor = await requireActor();
  const taxonomy = text(formData, 'taxonomy');
  if (!isTaxonomy(taxonomy)) redirect('/admin');
  const { adminPath } = TAXONOMIES[taxonomy];
  const id = integer(formData, 'id');

  try {
    if (text(formData, 'intent') === 'delete') {
      await content.terms.remove(actor, id);
    } else {
      await content.terms.update(actor, id, {
        name: text(formData, 'name'),
        slug: text(formData, 'slug'),
        description: text(formData, 'description'),
        parent: integer(formData, 'parent'),
      });
    }
  } catch (error) {
    redirect(withParams(adminPath, adminPath, { error: actionErrorMessage(error) }));
  }

  revalidateContent();
  redirect(withParams(adminPath, adminPath, { notice: text(formData, 'intent') === 'delete' ? 'term-deleted' : 'term-updated' }));
}
