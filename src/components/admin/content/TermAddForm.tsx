'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import { createTermAction, type FormState } from '@/app/admin/(protected)/content-actions';
import type { TaxonomyName, TermView } from '@/lib/content';
import { Banner } from './Notice';

const field =
  'w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-2 text-xs font-semibold text-[var(--admin-text-primary)] placeholder-slate-400 focus:border-[var(--admin-accent)] focus:outline-none';
const label = 'mb-1 block text-xs font-bold text-[var(--admin-text-primary)]';
const hint = 'mt-1 text-[10px] font-semibold text-[var(--admin-text-secondary)]';

export default function TermAddForm({
  taxonomy,
  singular,
  hierarchical,
  parents,
}: {
  taxonomy: TaxonomyName;
  singular: string;
  hierarchical: boolean;
  parents: TermView[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createTermAction, { status: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-5 shadow-sm">
      <h2 className="text-sm font-extrabold text-[var(--admin-text-primary)]">Add new {singular.toLowerCase()}</h2>
      {state.status !== 'idle' && state.message && <Banner tone={state.status}>{state.message}</Banner>}
      <input type="hidden" name="taxonomy" value={taxonomy} />

      <div>
        <label htmlFor="term-name" className={label}>
          Name
        </label>
        <input id="term-name" name="name" required className={field} />
        <p className={hint}>How it appears on your site.</p>
      </div>
      <div>
        <label htmlFor="term-slug" className={label}>
          Slug
        </label>
        <input id="term-slug" name="slug" className={field} />
        <p className={hint}>The URL-friendly version of the name. Leave empty to generate it.</p>
      </div>
      {hierarchical && (
        <div>
          <label htmlFor="term-parent" className={label}>
            Parent {singular.toLowerCase()}
          </label>
          <select id="term-parent" name="parent" defaultValue={0} className={field}>
            <option value={0}>None</option>
            {parents.map((term) => (
              <option key={term.id} value={term.id}>
                {'— '.repeat(term.depth)}
                {term.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="term-description" className={label}>
          Description
        </label>
        <textarea id="term-description" name="description" rows={3} className={`${field} resize-y`} />
      </div>
      <button disabled={pending} className="rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--admin-accent-hover)] disabled:opacity-50">
        {pending ? 'Adding…' : `Add ${singular.toLowerCase()}`}
      </button>
    </form>
  );
}
