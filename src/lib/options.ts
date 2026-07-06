import { db } from './db';

const optionCache = new Map<string, string | null>();

/**
 * Fetch an option value from the database, utilizing an in-memory cache for speed.
 */
export async function getOption(key: string): Promise<string | null> {
  if (optionCache.has(key)) {
    return optionCache.get(key) ?? null;
  }

  try {
    const opt = await db.option.findUnique({
      where: { key },
    });
    const value = opt ? opt.value : null;
    optionCache.set(key, value);
    return value;
  } catch (err) {
    console.error(`Error fetching option "${key}":`, err);
    return null;
  }
}

/**
 * Create or update an option value in the database, invalidating/updating the cache.
 */
export async function setOption(key: string, value: string): Promise<void> {
  try {
    await db.option.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    optionCache.set(key, value);
  } catch (err) {
    console.error(`Error setting option "${key}":`, err);
    throw err;
  }
}

/**
 * Delete an option from the database and remove it from the cache.
 */
export async function deleteOption(key: string): Promise<void> {
  try {
    await db.option.delete({
      where: { key },
    });
    optionCache.delete(key);
  } catch (err) {
    // Fail silently if option doesn't exist
    optionCache.delete(key);
  }
}

/**
 * Manually clear the option cache.
 */
export function clearOptionCache() {
  optionCache.clear();
}
