'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

/**
 * Server action to create a new quick draft post from the dashboard.
 */
export async function createQuickDraft(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized access');
  }

  const title = (formData.get('title') as string) || 'Untitled Draft';
  const content = (formData.get('content') as string) || '';
  const authorId = parseInt(session.user.id ?? '0', 10);

  if (isNaN(authorId)) {
    throw new Error('Invalid author session ID');
  }

  // Create a unique slug for the draft
  const slug = `quick-draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    await db.post.create({
      data: {
        title,
        content,
        status: 'draft',
        authorId,
        slug,
        commentStatus: 'open',
        pingStatus: 'open',
      },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create quick draft:', error);
    return { success: false, error: error.message || 'Failed to save draft.' };
  }
}
