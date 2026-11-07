import { ROLES, isValidRole, type Capability, type RoleName } from './roles';

/**
 * Access module — the one place that answers "may this user do X?".
 *
 * Pure and framework-free: callers turn a session into an Actor with
 * `actorFromSession`, then ask `can` / `assertCan`. Server-side helpers that
 * read the NextAuth session live in `auth-utils.ts`.
 */

/** A signed-in user acting in the admin. */
export interface Actor {
  id: number;
  role: RoleName;
}

export class AccessDenied extends Error {
  constructor(message = 'You are not allowed to do that.') {
    super(message);
    this.name = 'AccessDenied';
  }
}

export function can(actor: Actor | null | undefined, cap: Capability): boolean {
  if (!actor) return false;
  const caps: readonly Capability[] = ROLES[actor.role].caps;
  return caps.includes(cap);
}

export function assertCan(actor: Actor | null | undefined, cap: Capability, message?: string): asserts actor is Actor {
  if (!can(actor, cap)) {
    throw new AccessDenied(message);
  }
}

/** Builds an Actor from session user fields; unknown roles fall back to subscriber. */
export function actorFromSession(user: { id?: string | null; role?: string | null } | null | undefined): Actor | null {
  const id = Number(user?.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  const role = user?.role && isValidRole(user.role) ? user.role : 'subscriber';
  return { id, role };
}

/**
 * Reads the role from the `capabilities` UserMeta JSON (WordPress style:
 * `{ "editor": true }`). Returns the highest-level role that is set to true.
 */
export function roleFromCapabilities(json: string | null | undefined): RoleName {
  if (!json) return 'subscriber';
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return 'subscriber';
  }
  if (!parsed || typeof parsed !== 'object') return 'subscriber';

  let best: RoleName = 'subscriber';
  for (const [key, value] of Object.entries(parsed)) {
    if (value === true && isValidRole(key) && ROLES[key].level > ROLES[best].level) {
      best = key;
    }
  }
  return best;
}
