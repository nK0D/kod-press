import type { Capability } from '@/lib/roles';
import type { TaxonomyName } from './taxonomies';

export type PostTypeFeature = 'title' | 'editor' | 'excerpt' | 'revisions' | 'comments' | 'page-attributes';

export interface PostTypeDefinition {
  name: string;
  label: string;
  singular: string;
  supports: PostTypeFeature[];
  taxonomies: TaxonomyName[];
  hierarchical: boolean;
  public: boolean;
  /** Admin list screen, e.g. `/admin/posts`. The editor lives at `${adminPath}/new` and `${adminPath}/[id]`. */
  adminPath: string;
  caps: {
    edit: Capability;
    editOthers: Capability;
    publish: Capability;
    delete: Capability;
  };
}

const registry = new Map<string, PostTypeDefinition>();

export function registerPostType(definition: PostTypeDefinition): void {
  registry.set(definition.name, definition);
}

export function getPostType(name: string): PostTypeDefinition | null {
  return registry.get(name) ?? null;
}

export function getPostTypes(): PostTypeDefinition[] {
  return [...registry.values()];
}

export function supports(definition: PostTypeDefinition, feature: PostTypeFeature): boolean {
  return definition.supports.includes(feature);
}

registerPostType({
  name: 'post',
  label: 'Posts',
  singular: 'Post',
  supports: ['title', 'editor', 'excerpt', 'revisions', 'comments'],
  taxonomies: ['category', 'post_tag'],
  hierarchical: false,
  public: true,
  adminPath: '/admin/posts',
  caps: { edit: 'edit_posts', editOthers: 'edit_others_posts', publish: 'publish_posts', delete: 'delete_posts' },
});

registerPostType({
  name: 'page',
  label: 'Pages',
  singular: 'Page',
  supports: ['title', 'editor', 'revisions', 'comments', 'page-attributes'],
  taxonomies: [],
  hierarchical: true,
  public: true,
  adminPath: '/admin/pages',
  caps: { edit: 'edit_pages', editOthers: 'edit_others_pages', publish: 'publish_pages', delete: 'delete_pages' },
});
