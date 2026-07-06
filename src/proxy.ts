import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

/**
 * Next.js 16 proxy (replaces the old middleware convention).
 *
 * Matcher is scoped to /admin/** BUT explicitly excludes /admin/login/**
 * so NextAuth never runs for public auth pages. This prevents the
 * continuous session-check DB calls that caused the repeated request spam.
 */
export function proxy(req: any, ev: any) {
  return auth(req, ev);
}

export const config = {
  matcher: [
    /*
     * Match /admin/* but NOT /admin/login, /admin/login/*, etc.
     * Regex: /admin/ followed by anything that does NOT start with "login"
     */
    '/admin/((?!login).*)',
  ],
};
