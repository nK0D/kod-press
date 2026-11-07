import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { actorFromSession, can, type Actor } from './access';
import type { Capability } from './roles';

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
 * Returns the signed-in Actor, or null for guests.
 */
export async function getActor(): Promise<Actor | null> {
  const session = await auth();
  return actorFromSession(session?.user);
}

/**
 * Ensures there is a signed-in Actor, redirecting to the login page if not.
 */
export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) {
    redirect('/admin/login');
  }
  return actor;
}

/**
 * Ensures the signed-in Actor holds a capability, redirecting to the admin root if not.
 */
export async function requireCap(cap: Capability): Promise<Actor> {
  const actor = await requireActor();
  if (!can(actor, cap)) {
    redirect('/admin');
  }
  return actor;
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
