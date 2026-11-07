import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function items(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular.toLowerCase() : plural.toLowerCase()}`;
}

/**
 * Renders the outcome a Server Action reported through the URL
 * (`?notice=…&changed=…&skipped=…` or `?error=…`).
 */
export default function Notice({ params, singular, plural }: { params: SearchParams; singular: string; plural: string }) {
  const error = first(params.error);
  if (error) return <Banner tone="error">{error}</Banner>;

  const notice = first(params.notice);
  if (!notice) return null;
  const changed = Number(first(params.changed)) || 0;
  const skipped = Number(first(params.skipped)) || 0;
  const what = items(changed, singular, plural);

  const messages: Record<string, string> = {
    created: `${singular} created.`,
    'revision-restored': 'Revision restored.',
    'term-updated': `${singular} updated.`,
    'term-deleted': `${singular} deleted.`,
    trash: `${what} moved to the Trash.`,
    restore: `${what} restored from the Trash.`,
    delete: `${what} permanently deleted.`,
    publish: `${what} published.`,
    draft: `${what} moved to drafts.`,
  };
  const message = messages[notice];
  if (!message) return null;

  return (
    <Banner tone={changed === 0 && skipped > 0 ? 'error' : 'success'}>
      {message}
      {skipped > 0 && ` ${skipped} skipped because you can’t change ${skipped === 1 ? 'it' : 'them'}.`}
    </Banner>
  );
}

export function Banner({ tone, children }: { tone: 'success' | 'error'; children: React.ReactNode }) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertTriangle;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${
        tone === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300'
          : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300'
      }`}
    >
      <Icon className="mt-px h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
