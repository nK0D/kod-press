import type { Capability } from '@/lib/roles';

export type TaxonomyName = 'category' | 'post_tag';

export interface TaxonomyDefinition {
  name: TaxonomyName;
  label: string;
  singular: string;
  hierarchical: boolean;
  cap: Capability;
  adminPath: string;
}

export const TAXONOMIES: Record<TaxonomyName, TaxonomyDefinition> = {
  category: {
    name: 'category',
    label: 'Categories',
    singular: 'Category',
    hierarchical: true,
    cap: 'manage_categories',
    adminPath: '/admin/posts/categories',
  },
  post_tag: {
    name: 'post_tag',
    label: 'Tags',
    singular: 'Tag',
    hierarchical: false,
    cap: 'manage_tags',
    adminPath: '/admin/posts/tags',
  },
};

export function isTaxonomy(name: string): name is TaxonomyName {
  return name in TAXONOMIES;
}
