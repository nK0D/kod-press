import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Search } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { termAction } from '@/app/admin/(protected)/content-actions';
import { can } from '@/lib/access';
import { requireActor } from '@/lib/auth-utils';
import { content, TAXONOMIES, type TaxonomyName } from '@/lib/content';
import { ConfirmButton } from './FormControls';
import Notice from './Notice';
import TermAddForm from './TermAddForm';

type SearchParams = Record<string, string | string[] | undefined>;

const field =
  'w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-2.5 py-1.5 text-xs font-semibold text-[var(--admin-text-primary)] focus:border-[var(--admin-accent)] focus:outline-none';

export default async function TermsScreen({ taxonomy, searchParams }: { taxonomy: TaxonomyName; searchParams: Promise<SearchParams> }) {
  const definition = TAXONOMIES[taxonomy];
  const actor = await requireActor();
  if (!can(actor, definition.cap)) redirect('/admin');

  const params = await searchParams;
  const search = (Array.isArray(params.search) ? params.search[0] : params.search)?.trim() ?? '';
  const [terms, allTerms] = await Promise.all([content.terms.list(taxonomy, { search }), content.terms.list(taxonomy)]);
  const filterParam = taxonomy === 'category' ? 'category' : 'tag';

  return (
    <div className="space-y-5">
      <PageHeader title={definition.label} description={`Group posts by ${definition.label.toLowerCase()}.`} />
      <Notice params={params} singular={definition.singular} plural={definition.label} />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <TermAddForm taxonomy={taxonomy} singular={definition.singular} hierarchical={definition.hierarchical} parents={allTerms} />

        <div className="space-y-3">
          <form action={definition.adminPath} className="flex justify-end gap-2">
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

          <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] shadow-sm">
            {terms.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm font-bold text-[var(--admin-text-primary)]">
                {search ? `No ${definition.label.toLowerCase()} match your search.` : `No ${definition.label.toLowerCase()} yet.`}
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--admin-border)] text-[10px] uppercase tracking-wider text-[var(--admin-text-secondary)]">
                  <tr>
                    <th className="px-4 py-3 font-bold">Name</th>
                    <th className="px-3 py-3 font-bold">Slug</th>
                    <th className="px-3 py-3 font-bold">Description</th>
                    <th className="px-4 py-3 text-right font-bold">Posts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-border)]">
                  {terms.map((term) => (
                    <tr key={term.id} className="align-top">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[var(--admin-text-primary)]">
                          {'— '.repeat(term.depth)}
                          {term.name}
                          {term.isDefault && <span className="ml-1.5 text-[10px] font-semibold text-[var(--admin-text-secondary)]">(default)</span>}
                        </div>
                        <details className="mt-1">
                          <summary className="cursor-pointer list-none text-[11px] font-semibold text-[var(--admin-accent)] hover:underline">Edit</summary>
                          <form action={termAction} className="mt-2 w-64 space-y-2 rounded-xl border border-[var(--admin-border)] p-3">
                            <input type="hidden" name="taxonomy" value={taxonomy} />
                            <input type="hidden" name="id" value={term.id} />
                            <label className="block text-[10px] font-bold uppercase text-[var(--admin-text-secondary)]">
                              Name
                              <input name="name" defaultValue={term.name} required className={`${field} mt-1`} />
                            </label>
                            <label className="block text-[10px] font-bold uppercase text-[var(--admin-text-secondary)]">
                              Slug
                              <input name="slug" defaultValue={term.slug} className={`${field} mt-1`} />
                            </label>
                            {definition.hierarchical && (
                              <label className="block text-[10px] font-bold uppercase text-[var(--admin-text-secondary)]">
                                Parent
                                <select name="parent" defaultValue={term.parent} className={`${field} mt-1`}>
                                  <option value={0}>None</option>
                                  {allTerms
                                    .filter((option) => option.id !== term.id)
                                    .map((option) => (
                                      <option key={option.id} value={option.id}>
                                        {'— '.repeat(option.depth)}
                                        {option.name}
                                      </option>
                                    ))}
                                </select>
                              </label>
                            )}
                            <label className="block text-[10px] font-bold uppercase text-[var(--admin-text-secondary)]">
                              Description
                              <textarea name="description" defaultValue={term.description} rows={2} className={`${field} mt-1 resize-y`} />
                            </label>
                            <div className="flex items-center justify-between pt-1">
                              {!term.isDefault ? (
                                <ConfirmButton
                                  name="intent"
                                  value="delete"
                                  formNoValidate
                                  confirmMessage={`Delete “${term.name}”? Posts keep their other ${definition.label.toLowerCase()}.`}
                                  className="text-[11px] font-bold text-red-600 hover:underline"
                                >
                                  Delete
                                </ConfirmButton>
                              ) : (
                                <span />
                              )}
                              <button name="intent" value="update" className="rounded-lg bg-[var(--admin-accent)] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[var(--admin-accent-hover)]">
                                Save
                              </button>
                            </div>
                          </form>
                        </details>
                      </td>
                      <td className="px-3 py-3 font-semibold text-[var(--admin-text-secondary)]">{term.slug}</td>
                      <td className="px-3 py-3 font-semibold text-[var(--admin-text-secondary)]">{term.description || '—'}</td>
                      <td className="px-4 py-3 text-right font-bold">
                        <Link href={`/admin/posts?${filterParam}=${term.id}`} className="text-[var(--admin-accent)] hover:underline">
                          {term.count}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
