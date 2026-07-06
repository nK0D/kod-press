'use client';

import React, { useState } from 'react';
import { createQuickDraft } from '@/app/admin/(protected)/actions';
import { Save } from 'lucide-react';

export default function QuickDraft() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);
    setMsg(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    try {
      const res = await createQuickDraft(formData);
      if (res.success) {
        setMsg({ success: true, text: 'Draft saved successfully!' });
        setTitle('');
        setContent('');
      } else {
        setMsg({ success: false, text: res.error || 'Failed to save draft.' });
      }
    } catch (err) {
      setMsg({ success: false, text: 'An error occurred while saving.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl p-6 shadow-sm select-none">
      <h3 className="text-sm font-extrabold text-[var(--admin-text-primary)] mb-1">
        Quick Draft
      </h3>
      <p className="text-[10px] text-[var(--admin-text-secondary)] font-semibold mb-4">
        Save ideas as draft posts.
      </p>

      {msg && (
        <div
          className={`mb-4 p-3.5 rounded-xl text-xs font-semibold border
            ${msg.success
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30'
              : 'bg-red-50 dark:bg-red-950/20 text-red-750 dark:text-red-400 border-red-250 dark:border-red-900/30'}`}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            disabled={isSaving}
            className="w-full text-xs font-semibold px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/40 border border-[var(--admin-border)] rounded-xl focus:outline-none focus:border-[var(--admin-accent)] placeholder-slate-500 text-[var(--admin-text-primary)]"
          />
        </div>

        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            disabled={isSaving}
            className="w-full text-xs font-semibold px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/40 border border-[var(--admin-border)] rounded-xl focus:outline-none focus:border-[var(--admin-accent)] placeholder-slate-500 text-[var(--admin-text-primary)] resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving || (!title.trim() && !content.trim())}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] disabled:opacity-50 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
