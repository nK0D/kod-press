import { AccessDenied } from '@/lib/access';
import { ContentError } from './store';

/**
 * Turns an expected Content/Access failure into a message for the form.
 * Anything else is a bug and is rethrown so Next.js error handling sees it.
 */
export function actionErrorMessage(error: unknown): string {
  if (error instanceof AccessDenied || error instanceof ContentError) return error.message;
  throw error;
}
