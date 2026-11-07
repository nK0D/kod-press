import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getOption } from '@/lib/options';
import { content } from '@/lib/content';
import DashboardWelcome from '@/components/admin/DashboardWelcome';
import QuickDraft from '@/components/admin/QuickDraft';
import { FileText, Layers, MessageSquare, Palette, ArrowRight } from 'lucide-react';

export const revalidate = 0; // Disable server cache for dynamic dashboard statistics

export default async function AdminDashboard() {
  const [totals, pendingCommentsCount, activeTheme, recentPosts, recentComments] = await Promise.all([
    content.totals(),
    db.comment.count({ where: { approved: '0' } }),
    getOption('active_theme').then((val) => val || 'kodpress-default'),
    content.latestPublished({ type: 'post', limit: 5 }),
    db.comment.findMany({
      orderBy: { date: 'desc' },
      take: 5,
      include: { post: true },
    }),
  ]);
  const postsCount = totals.post ?? 0;
  const pagesCount = totals.page ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Welcome Banner */}
      <DashboardWelcome />

      {/* Grid Layout (2 columns on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left Column (At a Glance + Activity) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Widget 1: At a Glance */}
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-[var(--admin-text-primary)] mb-1">
              At a Glance
            </h3>
            <p className="text-[10px] text-[var(--admin-text-secondary)] font-semibold mb-4">
              Overview of your site content and configuration.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/admin/posts" className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-[var(--admin-border)] hover:border-slate-350 dark:hover:border-slate-850 rounded-xl space-y-2 transition-all">
                <FileText className="h-5 w-5 text-indigo-500" />
                <div>
                  <div className="text-lg font-black text-[var(--admin-text-primary)]">{postsCount}</div>
                  <div className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase">Posts</div>
                </div>
              </Link>

              <Link href="/admin/pages" className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-[var(--admin-border)] hover:border-slate-350 dark:hover:border-slate-850 rounded-xl space-y-2 transition-all">
                <Layers className="h-5 w-5 text-indigo-500" />
                <div>
                  <div className="text-lg font-black text-[var(--admin-text-primary)]">{pagesCount}</div>
                  <div className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase">Pages</div>
                </div>
              </Link>

              <Link href="/admin/comments" className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-[var(--admin-border)] hover:border-slate-350 dark:hover:border-slate-850 rounded-xl space-y-2 transition-all">
                <MessageSquare className="h-5 w-5 text-indigo-500" />
                <div>
                  <div className="text-lg font-black text-[var(--admin-text-primary)]">{pendingCommentsCount}</div>
                  <div className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase">Pending Comments</div>
                </div>
              </Link>

              <Link href="/admin/themes" className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-[var(--admin-border)] hover:border-slate-350 dark:hover:border-slate-850 rounded-xl space-y-2 transition-all">
                <Palette className="h-5 w-5 text-indigo-500" />
                <div>
                  <div className="text-sm font-bold text-[var(--admin-text-primary)] truncate" title={activeTheme}>{activeTheme}</div>
                  <div className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase">Active Theme</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Widget 2: Recent Activity */}
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--admin-text-primary)] mb-1">
                Activity
              </h3>
              <p className="text-[10px] text-[var(--admin-text-secondary)] font-semibold">
                Recently published posts and comment actions.
              </p>
            </div>

            {/* Published Posts */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Recently Published
              </h4>
              {recentPosts.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold py-1">No recently published posts.</p>
              ) : (
                <div className="divide-y divide-[var(--admin-border)]">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <Link href={`/admin/posts/${post.id}`} className="text-xs font-bold text-[var(--admin-text-primary)] hover:text-[var(--admin-accent)] transition-colors">
                          {post.title}
                        </Link>
                        <p className="text-[10px] text-[var(--admin-text-secondary)] font-semibold mt-0.5">
                          Published {post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <Link href={`/${post.slug}`} title="View post" className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--admin-text-secondary)]">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Comments */}
            <div className="space-y-3 pt-4 border-t border-[var(--admin-border)]">
              <h4 className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Recent Comments
              </h4>
              {recentComments.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold py-1">No comments found.</p>
              ) : (
                <div className="space-y-4">
                  {recentComments.map((comment) => (
                    <div key={comment.id} className="text-xs bg-slate-50/50 dark:bg-slate-950/30 border border-[var(--admin-border)] rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-[var(--admin-text-primary)]">
                            {comment.authorName || 'Guest'}
                          </span>
                          <span className="text-slate-500 pr-1.5 pl-1.5 font-medium">on</span>
                          <span className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400">
                            {comment.post.title}
                          </span>
                        </div>
                        <span className="text-[9px] text-[var(--admin-text-secondary)] font-bold uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {comment.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-slate-650 dark:text-slate-400 font-medium leading-relaxed italic text-[11px] truncate max-w-xl">
                        "{comment.content}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Quick Draft Widget) */}
        <div className="space-y-6 sm:space-y-8">
          <QuickDraft />
        </div>
      </div>
    </div>
  );
}
