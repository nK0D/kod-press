'use server';

import { revalidatePath } from 'next/cache';
import { requireActor } from '@/lib/auth-utils';
import { content } from '@/lib/content';
import { actionErrorMessage } from '@/lib/content/action-error';

/**
 * Server action to create a new quick draft post from the dashboard.
 */
export async function createQuickDraft(formData: FormData) {
  const actor = await requireActor();

  try {
    await content.save(actor, {
      type: 'post',
      title: String(formData.get('title') ?? '').trim() || 'Untitled Draft',
      content: String(formData.get('content') ?? '')
        .split(/\n{2,}/)
        .filter((paragraph) => paragraph.trim())
        .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
        .join(''),
      status: 'draft',
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}
