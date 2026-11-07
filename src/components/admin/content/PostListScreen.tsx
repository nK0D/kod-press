import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { postBulkAction } from '@/app/admin/(protected)/content-actions';
import { can } from '@/lib/access';
import { requireActor } from '@/lib/auth-utils';
import { content, getPostType, POST_STATUSES, type PostStatus } from '@/lib/content';
import { ConfirmButton, SelectAllCheckbox } from './FormControls';
import Notice from './Notice';
import { treeOrder } from './tree';

type SearchParams = Record<string, string | string[] | undefined>;

const STATUS_TABS: { key: PostStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'publish', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
  { key: 'pending', label: 'Pending' },
  { key: 'private', label: 'Private' },
  { key: 'trash', label: 'Trash' },
];

const STATUS_LABELS: Record<PostStatus, string> = {
  publish: 'Published',
  draft: 'Draft',
  pending: 'Pending',
  private: 'Private',
  trash: 'Trash',
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(date: Date) {
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export default async function PostListScreen({ type, searchParams }: { type: string; searchParams: Promise<SearchParams> }) {
  const definition = getPostType(type);
  if (!definition) notFound();
  const actor = await requireActor();
  if (!can(actor, definition.caps.edit)) redirect('/admin');

  const params = await searchParams;
  const statusParam = first(params.status);
  const status: PostStatus | 'all' = statusParam && (POST_STATUSES as readonly string[]).includes(statusParam) ? (statusParam as PostStatus) : 'all';
  const search = first(params.search)?.trim() ?? '';
  const page = Math.max(Number(first(params.page)) || 1, 1);
  const categoryId = Number(first(params.category)) || undefined;
  const tagId = Number(first(params.tag)) || undefined;

  const result = await content.list(actor, { type, status, search, page, categoryId, tagId });
  const hasTaxonomies = definition.taxonomies.length > 0;
  const inTrash = status === 'trash';
  const filterTerm = categoryId || tagId ? (await content.terms.list(categoryId ? 'category' : 'post_tag')).find((t) => t.id === (categoryId ?? tagId)) : undefined;

  const hrefWith = (overrides: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = { status: status === 'all' ? undefined : status, search: search || undefined, category: categoryId, tag: tagId, ...overrides };
    for (const [key, value] of Object.entries(merged)) if (value !== undefined && value !== '') query.set(key, String(value));
    const qs = query.toString();
    return qs ? `${definition.adminPath}?${qs}` : definition.adminPath;
  };
  const returnTo = hrefWith({ page: page > 1 ? page : undefined });
  const rows = definition.hierarchical && !search ? treeOrder(result.items) : result.items.map((item) => ({ item, depth: 0 }));

  return (
    <div className="space-y-5">
      <PageHeader
        title={definition.label}
        description={`Create, edit, and organize your site's ${definition.label.toLowerCase()}.`}
        action={{ label: `Add New ${definition.singular}`, href: `${definition.adminPath}/new` }}
      />

      <Notice params={params} singular={definition.singular} plural={definition.label} />

      {/* Status tabs + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-1 text-xs font-semibold" aria-label="Filter by status">
          {STATUS_TABS.filter((tab) => tab.key === 'all' || result.counts[tab.key] > 0 || tab.key === status).map((tab) => {
            const active = tab.key === status;
            return (
              <Link
                key={tab.key}
                href={hrefWith({ status: tab.key === 'all' ? undefined : tab.key, page: undefined })}
                aria-current={active ? 'page' : undefined}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  active ? 'bg-[var(--admin-accent)] text-white' : 'text-[var(--admin-text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label} <span className={active ? 'text-indigo-100' : 'text-slate-400'}>({result.counts[tab.key]})</span>
              </Link>
            );
          })}
        </nav>

        <form action={definition.adminPath} className="flex items-center gap-2">
          {status !== 'all' && <input type="hidden" name="status" value={status} />}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder={`Search ${definition.label.toLowerCase()}`}
              className="w-56 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] py-2 pl-8 pr-3 text-xs font-semibold text-[var(--admin-text-primary)] placeholder-slate-400 focus:border-[var(--admin-accent)] focus:outline-none"
            />
          </div>
          <button className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-2 text-xs font-bold text-[var(--admin-text-primary)] hover:border-[var(--admin-accent)]">
            Search
          </button>
        </form>
      </div>

      {(search || categoryId || tagId) && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--admin-text-secondary)]">
          {search && <span>Search results for “{search}”.</span>}
          {(categoryId || tagId) && <span>Filtered by {categoryId ? 'category' : 'tag'}{filterTerm ? ` “${filterTerm.name}”` : ''}.</span>}
          <Link href={hrefWith({ search: undefined, category: undefined, tag: undefined, page: undefined })} className="inline-flex items-center gap-1 text-[var(--admin-accent)] hover:underline">
            <X className="h-3 w-3" /> Clear
          </Link>
        </div>
      )}

      {/* Row buttons submit this form via their `form` attribute, so they can live inside the bulk form's table. */}
      <form id="row-actions" action={postBulkAction} className="hidden">
        <input type="hidden" name="type" value={definition.name} />
        <input type="hidden" name="returnTo" value={returnTo} />
      </form>

      <form action={postBulkAction} className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] shadow-sm">
        <input type="hidden" name="type" value={definition.name} />
        <input type="hidden" name="returnTo" value={returnTo} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3">
          <div className="flex items-center gap-2">
            <label htmlFor="bulkAction" className="sr-only">
              Bulk action
            </label>
            <select
              id="bulkAction"
              name="bulkAction"
              defaultValue=""
              className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-2.5 py-1.5 text-xs font-semibold text-[var(--admin-text-primary)]"
            >
              <option value="" disabled>
                Bulk actions
              </option>
              {inTrash ? (
                <>
                  <option value="restore">Restore</option>
                  <option value="delete">Delete permanently</option>
                </>
              ) : (
                <>
                  <option value="publish">Publish</option>
                  <option value="draft">Set to draft</option>
                  <option value="trash">Move to Trash</option>
                </>
              )}
            </select>
            <button className="rounded-lg border border-[var(--admin-border)] px-3 py-1.5 text-xs font-bold text-[var(--admin-text-primary)] hover:border-[var(--admin-accent)]">
              Apply
            </button>
          </div>
          <span className="text-xs font-semibold text-[var(--admin-text-secondary)]">
            {result.total} {result.total === 1 ? 'item' : 'items'}
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-bold text-[var(--admin-text-primary)]">
              {inTrash ? 'The Trash is empty.' : search ? `No ${definition.label.toLowerCase()} match your search.` : `No ${definition.label.toLowerCase()} yet.`}
            </p>
            {!inTrash && !search && (
              <Link href={`${definition.adminPath}/new`} className="mt-3 inline-block text-xs font-bold text-[var(--admin-accent)] hover:underline">
                Write your first {definition.singular.toLowerCase()} →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--admin-border)] text-[10px] uppercase tracking-wider text-[var(--admin-text-secondary)]">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <SelectAllCheckbox label={`Select all ${definition.label.toLowerCase()}`} />
                  </th>
                  <th className="px-3 py-3 font-bold">Title</th>
                  <th className="px-3 py-3 font-bold">Author</th>
                  {hasTaxonomies && <th className="px-3 py-3 font-bold">Categories</th>}
                  {hasTaxonomies && <th className="px-3 py-3 font-bold">Tags</th>}
                  <th className="px-3 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {rows.map(({ item, depth }) => (
                  <tr key={item.id} className="group align-top hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        name="ids"
                        value={item.id}
                        aria-label={`Select “${item.title || '(no title)'}”`}
                        className="h-3.5 w-3.5 rounded border-slate-300 accent-[var(--admin-accent)]"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-bold text-[var(--admin-text-primary)]">
                        {depth > 0 && <span className="text-slate-400">{'— '.repeat(depth)}</span>}
                        {item.can.edit && !inTrash ? (
                          <Link href={`${definition.adminPath}/${item.id}`} className="hover:text-[var(--admin-accent)]">
                            {item.title || '(no title)'}
                          </Link>
                        ) : (
                          <span>{item.title || '(no title)'}</span>
                        )}
                        {status === 'all' && item.status !== 'publish' && (
                          <span className="ml-1.5 font-semibold text-[var(--admin-text-secondary)]">— {STATUS_LABELS[item.status]}</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] font-semibold opacity-80 group-hover:opacity-100 group-focus-within:opacity-100">
                        {inTrash ? (
                          <>
                            {item.can.trash && (
                              <button form="row-actions" name="row" value={`restore:${item.id}`} className="text-[var(--admin-accent)] hover:underline">
                                Restore
                              </button>
                            )}
                            {item.can.delete && (
                              <ConfirmButton
                                form="row-actions"
                                name="row"
                                value={`delete:${item.id}`}
                                confirmMessage={`Permanently delete “${item.title || '(no title)'}”? This cannot be undone.`}
                                className="text-red-600 hover:underline"
                              >
                                Delete permanently
                              </ConfirmButton>
                            )}
                          </>
                        ) : (
                          <>
                            {item.can.edit && (
                              <Link href={`${definition.adminPath}/${item.id}`} className="text-[var(--admin-accent)] hover:underline">
                                Edit
                              </Link>
                            )}
                            {item.can.trash && (
                              <button form="row-actions" name="row" value={`trash:${item.id}`} className="text-red-600 hover:underline">
                                Trash
                              </button>
                            )}
                            {item.status === 'publish' && (
                              <a href={`/${item.slug}`} target="_blank" rel="noreferrer" className="text-[var(--admin-text-secondary)] hover:underline">
                                View
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-[var(--admin-text-secondary)]">{item.author.displayName}</td>
                    {hasTaxonomies && (
                      <td className="px-3 py-3 font-semibold text-[var(--admin-text-secondary)]">
                        {item.categories.length
                          ? item.categories.map((term, i) => (
                              <React.Fragment key={term.id}>
                                {i > 0 && ', '}
                                <Link href={hrefWith({ category: term.id, tag: undefined, page: undefined })} className="hover:text-[var(--admin-accent)]">
                                  {term.name}
                                </Link>
                              </React.Fragment>
                            ))
                          : '—'}
                      </td>
                    )}
                    {hasTaxonomies && (
                      <td className="px-3 py-3 font-semibold text-[var(--admin-text-secondary)]">
                        {item.tags.length
                          ? item.tags.map((term, i) => (
                              <React.Fragment key={term.id}>
                                {i > 0 && ', '}
                                <Link href={hrefWith({ tag: term.id, category: undefined, page: undefined })} className="hover:text-[var(--admin-accent)]">
                                  {term.name}
                                </Link>
                              </React.Fragment>
                            ))
                          : '—'}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-3 py-3 text-[var(--admin-text-secondary)]">
                      <div className="mb-1">
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="font-semibold">{item.status === 'publish' ? formatDate(item.date) : `Modified ${formatDate(item.modified)}`}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>

      {result.pageCount > 1 && (
        <nav className="flex items-center justify-end gap-2 text-xs font-semibold text-[var(--admin-text-secondary)]" aria-label="Pagination">
          {result.page > 1 ? (
            <Link href={hrefWith({ page: result.page - 1 })} className="rounded-lg border border-[var(--admin-border)] p-1.5 hover:border-[var(--admin-accent)]" aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span className="rounded-lg border border-[var(--admin-border)] p-1.5 opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
          <span>
            Page {result.page} of {result.pageCount}
          </span>
          {result.page < result.pageCount ? (
            <Link href={hrefWith({ page: result.page + 1 })} className="rounded-lg border border-[var(--admin-border)] p-1.5 hover:border-[var(--admin-accent)]" aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="rounded-lg border border-[var(--admin-border)] p-1.5 opacity-40">
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
