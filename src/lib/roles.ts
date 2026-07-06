export const ROLES = {
  administrator: {
    level: 10,
    caps: [
      'read',
      'edit_posts',
      'publish_posts',
      'edit_others_posts',
      'delete_posts',
      'edit_pages',
      'publish_pages',
      'edit_others_pages',
      'delete_pages',
      'upload_files',
      'manage_categories',
      'manage_tags',
      'manage_options',
      'install_plugins',
      'activate_plugins',
      'install_themes',
      'manage_users',
      'create_users',
      'delete_users',
      'promote_users',
      'moderate_comments',
      'edit_comments',
      'delete_comments',
    ],
  },
  editor: {
    level: 7,
    caps: [
      'read',
      'edit_posts',
      'publish_posts',
      'edit_others_posts',
      'delete_posts',
      'edit_pages',
      'publish_pages',
      'edit_others_pages',
      'delete_pages',
      'upload_files',
      'manage_categories',
      'manage_tags',
      'moderate_comments',
      'edit_comments',
      'delete_comments',
    ],
  },
  author: {
    level: 2,
    caps: [
      'read',
      'edit_posts',
      'publish_posts',
      'delete_posts',
      'upload_files',
    ],
  },
  contributor: {
    level: 1,
    caps: [
      'read',
      'edit_posts',
      'delete_posts',
    ],
  },
  subscriber: {
    level: 0,
    caps: [
      'read',
    ],
  },
} as const;

export type RoleName = keyof typeof ROLES;

/**
 * Helper to check if a role name is valid.
 */
export function isValidRole(role: string): role is RoleName {
  return role in ROLES;
}
