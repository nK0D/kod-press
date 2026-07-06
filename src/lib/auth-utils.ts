import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { currentUserCan } from './capabilities';
import bcrypt from 'bcryptjs';

/**
 * Returns the currently authenticated user session or null.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Ensures the user is logged in, redirecting to the login page if not.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/admin/login');
  }
  return session.user;
}

/**
 * Ensures the logged-in user possesses a specific capability, redirecting to the admin root if unauthorized.
 */
export async function requireCap(cap: string) {
  const user = await requireAuth();
  const hasCap = await currentUserCan(cap);
  if (!hasCap) {
    redirect('/admin');
  }
  return user;
}

/**
 * Helper to generate a bcrypt hash.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Helper to compare a password against a hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
