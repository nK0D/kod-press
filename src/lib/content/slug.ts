/** Slugs that would be shadowed by app routes if a post or page used them. */
export const RESERVED_SLUGS = new Set(['admin', 'api', 'setup', '_next', 'favicon.ico']);

const MAX_SLUG_LENGTH = 190;

/**
 * Turns a title into a URL slug: lowercase, Latin accents removed, every run of
 * non-letter/non-digit characters collapsed to a single hyphen. Letters from
 * other scripts are kept, so non-English titles still produce a slug.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, '');
}

/**
 * Returns `base`, or `base-2`, `base-3`, … — the first candidate `isTaken`
 * rejects. Reserved slugs are always treated as taken.
 */
export async function uniqueSlug(base: string, isTaken: (candidate: string) => Promise<boolean>): Promise<string> {
  let candidate = base;
  for (let n = 2; RESERVED_SLUGS.has(candidate) || (await isTaken(candidate)); n++) {
    candidate = `${base}-${n}`;
  }
  return candidate;
}
