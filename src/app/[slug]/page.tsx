import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import SiteFrame, { formatPublicDate } from '@/components/frontend/SiteFrame';
import { content } from '@/lib/content';
import { getSiteInfo } from '@/lib/site';

// Matches the default `/%postname%/` permalink structure; the full permalink router arrives in Phase 10.
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

async function load(params: Props['params']) {
  const site = await getSiteInfo();
  if (!site.installed) redirect('/setup');
  const { slug } = await params;
  const post = await content.findPublished(decodeURIComponent(slug));
  return { site, post };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site, post } = await load(params);
  if (!post) return { title: `Not found · ${site.title}` };
  return { title: `${post.title || '(no title)'} · ${site.title}`, description: post.excerpt };
}

export default async function PublicItemPage({ params }: Props) {
  const { site, post } = await load(params);
  if (!post) notFound();

  return (
    <SiteFrame site={site}>
      <article className="space-y-8">
        <header className="space-y-3">
          {post.type === 'post' && (
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              <time dateTime={post.date.toISOString()}>{formatPublicDate(post.date)}</time> · {post.author.displayName}
            </p>
          )}
          <h1 className="text-4xl font-extrabold tracking-tight text-white">{post.title || '(no title)'}</h1>
        </header>

        {/* Content is sanitized by the Content module when it is saved. */}
        <div className="kp-prose text-slate-200" dangerouslySetInnerHTML={{ __html: post.content }} />

        {(post.categories.length > 0 || post.tags.length > 0) && (
          <footer className="flex flex-wrap gap-2 border-t border-slate-800 pt-6 text-xs font-semibold">
            {post.categories.map((category) => (
              <span key={`c-${category.id}`} className="rounded-full bg-indigo-500/15 px-3 py-1 text-indigo-300">
                {category.name}
              </span>
            ))}
            {post.tags.map((tag) => (
              <span key={`t-${tag.id}`} className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                #{tag.name}
              </span>
            ))}
          </footer>
        )}
      </article>
    </SiteFrame>
  );
}
