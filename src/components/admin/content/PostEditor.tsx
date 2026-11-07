'use client';

import React, { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, X } from 'lucide-react';
import RichTextEditor from '@/components/admin/editor/RichTextEditor';
import { restoreRevisionAction, savePostAction, trashPostAction, type FormState } from '@/app/admin/(protected)/content-actions';
import type { PostDetail, RevisionSummary, TermView } from '@/lib/content';
import { slugify } from '@/lib/content/slug';
import { ConfirmButton } from './FormControls';
import { Banner } from './Notice';

export interface EditorTypeInfo {
  name: string;
  singular: string;
  label: string;
  adminPath: string;
  hasCategories: boolean;
  hasTags: boolean;
  hasExcerpt: boolean;
  hasComments: boolean;
  hasPageAttributes: boolean;
}

interface PostEditorProps {
  type: EditorTypeInfo;
  post: PostDetail | null;
  categories: TermView[];
  tagSuggestions: string[];
  parentOptions: { id: number; title: string; depth: number }[];
  revisions: RevisionSummary[];
  canPublish: boolean;
  canManageCategories: boolean;
  /** Outcome passed through the URL after a redirect (e.g. "created"). */
  notice?: { tone: 'success' | 'error'; message: string };
}

const card = 'rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 shadow-sm';
const cardTitle = 'mb-3 text-[10px] font-black uppercase tracking-wider text-[var(--admin-text-secondary)]';
const field =
  'w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-2 text-xs font-semibold text-[var(--admin-text-primary)] placeholder-slate-400 focus:border-[var(--admin-accent)] focus:outline-none';

function formatDate(date: Date) {
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function PostEditor({
  type,
  post,
  categories,
  tagSuggestions,
  parentOptions,
  revisions,
  canPublish,
  canManageCategories,
  notice,
}: PostEditorProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(savePostAction, { status: 'idle' });
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [status, setStatus] = useState<string>(post?.status ?? 'draft');
  const [html, setHtml] = useState(post?.content ?? '');
  const [tags, setTags] = useState<string[]>(post?.tags.map((t) => t.name) ?? []);
  const [tagDraft, setTagDraft] = useState('');
  const [dirty, setDirty] = useState(false);

  // After a save, the page re-renders with the stored post; adopt server-decided values (unique slug, forced "pending").
  const [syncedAt, setSyncedAt] = useState(post?.modified.getTime());
  if (post && post.modified.getTime() !== syncedAt) {
    setSyncedAt(post.modified.getTime());
    setSlug(post.slug);
    setStatus(post.status);
    setDirty(false);
  }

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const isLive = post?.status === 'publish' || post?.status === 'private';
  const banner = state.status !== 'idle' ? { tone: state.status, message: state.message ?? '' } : notice;

  const addTags = (raw: string) => {
    const names = raw.split(',').map((name) => name.trim()).filter(Boolean);
    if (!names.length) return;
    setTags((current) => [...current, ...names.filter((name) => !current.some((t) => t.toLowerCase() === name.toLowerCase()))]);
    setTagDraft('');
    setDirty(true);
  };

  return (
    <form action={formAction} onChange={() => setDirty(true)} className="space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="type" value={type.name} />
      {post?.status === 'publish' && <input type="hidden" name="wasPublished" value="1" />}
      <input type="hidden" name="content" value={html} />
      <input type="hidden" name="tags" value={tags.join(',')} />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={type.adminPath} className="rounded-lg border border-[var(--admin-border)] p-1.5 text-[var(--admin-text-secondary)] hover:border-[var(--admin-accent)]" aria-label={`Back to ${type.label}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--admin-text-primary)]">
            {post ? `Edit ${type.singular}` : `Add New ${type.singular}`}
          </h1>
        </div>
        {post?.status === 'publish' && (
          <a href={`/${post.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--admin-accent)] hover:underline">
            View {type.singular.toLowerCase()} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {banner && banner.message && <Banner tone={banner.tone}>{banner.message}</Banner>}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* ─── Main column ─── */}
        <div className="space-y-4">
          <div>
            <label htmlFor="post-title" className="sr-only">
              Title
            </label>
            <input
              id="post-title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add title"
              autoFocus={!post}
              className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-5 py-3.5 text-2xl font-extrabold text-[var(--admin-text-primary)] placeholder-slate-400 focus:border-[var(--admin-accent)] focus:outline-none"
            />
            <div className="mt-2 flex items-center gap-1 px-1 text-xs font-semibold text-[var(--admin-text-secondary)]">
              <label htmlFor="post-slug">Permalink:</label>
              <span className="text-slate-400">/</span>
              <input
                id="post-slug"
                name="slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder={slugify(title) || type.name}
                className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[var(--admin-text-primary)] placeholder-slate-400 hover:border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:outline-none"
              />
            </div>
          </div>

          <RichTextEditor
            initialContent={post?.content ?? ''}
            onChange={(value) => {
              setHtml(value);
              setDirty(true);
            }}
          />

          {type.hasExcerpt && (
            <details className={card} open={Boolean(post?.excerpt)}>
              <summary className="cursor-pointer text-xs font-bold text-[var(--admin-text-primary)]">Excerpt</summary>
              <textarea name="excerpt" defaultValue={post?.excerpt ?? ''} rows={3} placeholder="A short summary shown in post lists. Leave empty to use the start of the content." className={`${field} mt-3 resize-y`} />
            </details>
          )}

          {type.hasComments && (
            <details className={card}>
              <summary className="cursor-pointer text-xs font-bold text-[var(--admin-text-primary)]">Discussion</summary>
              <input type="hidden" name="discussion" value="1" />
              <div className="mt-3 space-y-2 text-xs font-semibold text-[var(--admin-text-primary)]">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="commentStatus" defaultChecked={(post?.commentStatus ?? 'open') === 'open'} className="accent-[var(--admin-accent)]" />
                  Allow comments
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="pingStatus" defaultChecked={(post?.pingStatus ?? 'open') === 'open'} className="accent-[var(--admin-accent)]" />
                  Allow pingbacks &amp; trackbacks
                </label>
              </div>
            </details>
          )}
        </div>

        {/* ─── Sidebar ─── */}
        <aside className="space-y-4">
          <section className={card} aria-labelledby="publish-heading">
            <h2 id="publish-heading" className={cardTitle}>
              Publish
            </h2>
            <label htmlFor="post-status" className="mb-1 block text-xs font-semibold text-[var(--admin-text-secondary)]">
              Status
            </label>
            <select id="post-status" name="status" value={status} onChange={(event) => setStatus(event.target.value)} className={field}>
              <option value="draft">Draft</option>
              <option value="pending">Pending review</option>
              {(canPublish || post?.status === 'publish') && <option value="publish">Published</option>}
              {(canPublish || post?.status === 'private') && <option value="private">Private</option>}
            </select>
            {!canPublish && <p className="mt-2 text-[11px] font-semibold text-[var(--admin-text-secondary)]">An editor will review this before it goes live.</p>}

            {post && (
              <dl className="mt-3 space-y-1 text-[11px] font-semibold text-[var(--admin-text-secondary)]">
                <div className="flex justify-between gap-2">
                  <dt>{post.status === 'publish' ? 'Published' : 'Created'}</dt>
                  <dd>{formatDate(post.date)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Last modified</dt>
                  <dd>{formatDate(post.modified)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Author</dt>
                  <dd>{post.author.displayName}</dd>
                </div>
              </dl>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-border)] pt-4">
              {post?.can.trash ? (
                <button formAction={trashPostAction} disabled={pending} className="text-xs font-bold text-red-600 hover:underline disabled:opacity-50">
                  Move to Trash
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                {!isLive && (
                  <button name="intent" value="draft" disabled={pending} className="rounded-xl border border-[var(--admin-border)] px-3 py-2 text-xs font-bold text-[var(--admin-text-primary)] hover:border-[var(--admin-accent)] disabled:opacity-50">
                    Save draft
                  </button>
                )}
                <button
                  name="intent"
                  value={isLive ? 'save' : 'publish'}
                  disabled={pending}
                  className="rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
                >
                  {pending ? 'Saving…' : isLive ? 'Update' : canPublish ? 'Publish' : 'Submit for review'}
                </button>
              </div>
            </div>
          </section>

          {type.hasPageAttributes && (
            <section className={card} aria-labelledby="attributes-heading">
              <h2 id="attributes-heading" className={cardTitle}>
                {type.singular} attributes
              </h2>
              <label htmlFor="post-parent" className="mb-1 block text-xs font-semibold text-[var(--admin-text-secondary)]">
                Parent
              </label>
              <select id="post-parent" name="parent" defaultValue={post?.parent ?? 0} className={field}>
                <option value={0}>(no parent)</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {'— '.repeat(option.depth)}
                    {option.title || '(no title)'}
                  </option>
                ))}
              </select>
              <label htmlFor="post-order" className="mb-1 mt-3 block text-xs font-semibold text-[var(--admin-text-secondary)]">
                Order
              </label>
              <input id="post-order" type="number" name="menuOrder" defaultValue={post?.menuOrder ?? 0} className={field} />
            </section>
          )}

          {type.hasCategories && (
            <section className={card} aria-labelledby="categories-heading">
              <h2 id="categories-heading" className={cardTitle}>
                Categories
              </h2>
              <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 text-xs font-semibold text-[var(--admin-text-primary)]" style={{ paddingLeft: category.depth * 14 }}>
                    <input
                      type="checkbox"
                      name="categoryIds"
                      value={category.id}
                      defaultChecked={post?.categories.some((c) => c.id === category.id)}
                      className="accent-[var(--admin-accent)]"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
              {canManageCategories && (
                <input name="newCategory" placeholder="+ Add new category" aria-label="New category name" className={`${field} mt-3`} />
              )}
            </section>
          )}

          {type.hasTags && (
            <section className={card} aria-labelledby="tags-heading">
              <h2 id="tags-heading" className={cardTitle}>
                Tags
              </h2>
              <div className="flex gap-2">
                <input
                  value={tagDraft}
                  list="tag-suggestions"
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ',') {
                      event.preventDefault();
                      addTags(tagDraft);
                    }
                  }}
                  placeholder="Add a tag"
                  aria-label="Add a tag"
                  className={field}
                />
                <button type="button" onClick={() => addTags(tagDraft)} className="rounded-xl border border-[var(--admin-border)] px-3 text-xs font-bold text-[var(--admin-text-primary)] hover:border-[var(--admin-accent)]">
                  Add
                </button>
              </div>
              <datalist id="tag-suggestions">
                {tagSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <p className="mt-1.5 text-[10px] font-semibold text-slate-400">Separate tags with commas or Enter.</p>
              {tags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <li key={tag} className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-[var(--admin-accent)]">
                      {tag}
                      <button
                        type="button"
                        aria-label={`Remove tag ${tag}`}
                        onClick={() => {
                          setTags((current) => current.filter((t) => t !== tag));
                          setDirty(true);
                        }}
                        className="rounded-full hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {post && revisions.length > 1 && (
            <section className={card} aria-labelledby="revisions-heading">
              <h2 id="revisions-heading" className={cardTitle}>
                Revisions ({revisions.length})
              </h2>
              <ol className="space-y-2">
                {revisions.map((revision, index) => (
                  <li key={revision.id} className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[var(--admin-text-secondary)]">
                    <span>
                      <span className="text-[var(--admin-text-primary)]">{formatDate(revision.date)}</span>
                      <br />
                      {revision.author.displayName}
                    </span>
                    {index === 0 ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase dark:bg-slate-800">Current</span>
                    ) : (
                      <ConfirmButton
                        formAction={restoreRevisionAction.bind(null, revision.id)}
                        confirmMessage="Restore this revision? Unsaved changes in the editor will be lost."
                        className="font-bold text-[var(--admin-accent)] hover:underline"
                      >
                        Restore
                      </ConfirmButton>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </aside>
      </div>
    </form>
  );
}
