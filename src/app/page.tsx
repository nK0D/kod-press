import { redirect } from 'next/navigation';
import Link from 'next/link';
import SiteFrame, { formatPublicDate } from '@/components/frontend/SiteFrame';
import { content } from '@/lib/content';
import { getSiteInfo } from '@/lib/site';

export const revalidate = 0; // Disable static cache for setup checking

export default async function Home() {
  const site = await getSiteInfo();
  if (!site.installed) {
    redirect('/setup');
  }

  const posts = await content.latestPublished({ type: 'post', limit: 10 });

  return (
    <SiteFrame site={site}>
      <section className="mb-12 space-y-3">
        <h1 className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          {site.title}
        </h1>
        {site.tagline && <p className="text-lg font-medium text-slate-400">{site.tagline}</p>}
      </section>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center">
          <p className="text-sm text-slate-400">Nothing has been published yet.</p>
          <Link href="/admin/posts/new" className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            Write your first post
          </Link>
        </div>
      ) : (
        <ol className="space-y-10">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <time dateTime={post.date.toISOString()}>{formatPublicDate(post.date)}</time>
                  {post.categories.length > 0 && <> · {post.categories.map((c) => c.name).join(', ')}</>}
                </p>
                <h2 className="text-2xl font-bold tracking-tight">
                  <Link href={`/${post.slug}`} className="text-white hover:text-indigo-300">
                    {post.title || '(no title)'}
                  </Link>
                </h2>
                {post.excerpt && <p className="leading-relaxed text-slate-400">{post.excerpt}</p>}
                <Link href={`/${post.slug}`} className="inline-block text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                  Read more →
                </Link>
              </article>
            </li>
          ))}
        </ol>
      )}
    </SiteFrame>
  );
}
