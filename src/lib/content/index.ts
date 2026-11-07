import { db } from '@/lib/db';
import { hooks } from '@/lib/hooks';
import { createContentStore } from './store';

/** The app's Content module, wired to the real database and HookServer. */
export const content = createContentStore({ db, hooks });

export * from './store';
export { getPostType, getPostTypes, supports, type PostTypeDefinition } from './post-types';
export { TAXONOMIES, isTaxonomy, type TaxonomyName } from './taxonomies';
