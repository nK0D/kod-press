import { db } from './db';
import { ROLES, RoleName } from './roles';
import { auth } from '@/auth';

/**
 * Checks if a specific user (by ID) has a given capability in the database.
 */
export async function userCan(userId: number, cap: string): Promise<boolean> {
  try {
    const meta = await db.userMeta.findFirst({
      where: {
        userId,
        key: 'capabilities',
      },
    });

    if (!meta) {
      return false;
    }

    const capabilitiesObj = JSON.parse(meta.value);

    // Direct override checks (e.g. { "some_cap": true/false })
    if (capabilitiesObj[cap] === true) {
      return true;
    }
    if (capabilitiesObj[cap] === false) {
      return false;
    }

    // Role capability checks
    for (const roleKey in capabilitiesObj) {
      if (capabilitiesObj[roleKey] === true && roleKey in ROLES) {
        const roleInfo = ROLES[roleKey as RoleName];
        if (roleInfo.caps.includes(cap as any)) {
          return true;
        }
      }
    }
  } catch (err) {
    console.error(`Error in userCan for userId ${userId}:`, err);
  }

  return false;
}

/**
 * Checks if the currently logged-in user has a given capability.
 * This is highly optimized as it checks the session token's cached role.
 */
export async function currentUserCan(cap: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) {
    return false;
  }

  const role = (session.user as any).role as RoleName;
  if (!role) {
    if (session.user.id) {
      return userCan(parseInt(session.user.id, 10), cap);
    }
    return false;
  }

  if (role in ROLES) {
    const roleInfo = ROLES[role];
    return roleInfo.caps.includes(cap as any);
  }

  return false;
}
