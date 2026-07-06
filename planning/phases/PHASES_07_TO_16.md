# Phases 7–16: Summary Plans

> Detailed per-phase checklists for phases 7–16. Each section follows the same structure as Phase 1–6.

---

# Phase 7: Taxonomies

**Status**: 🔴 NOT STARTED | **Depends on**: Phase 5 | **Estimated Sessions**: 1

## Goal
Full category/tag system with hierarchical categories, flat tags, and a custom taxonomy registration API.

## Key Tasks
- [ ] Category admin page: table with name, slug, description, parent, post count + add/edit/delete forms
- [ ] Tag admin page: same but no parent hierarchy
- [ ] Inline add-new forms (like WordPress — no modal, inline form at left of table)
- [ ] Bulk delete
- [ ] Custom taxonomy registration: `registerTaxonomy(name, postTypes, options)` in `src/lib/taxonomies.ts`
- [ ] Term archive pages on frontend (Phase 10 will style them)
- [ ] Hook: `hooks.apply_filters('term.name', name, term)`
- [ ] Dynamic route: `src/app/admin/taxonomies/[taxonomy]/page.tsx` serves both categories and tags

## Definition of Done
- [ ] Can create, edit, delete categories (with parent hierarchy)
- [ ] Can create, edit, delete tags
- [ ] Categories assigned to posts appear in post list table
- [ ] Custom taxonomy registered via code appears in admin sidebar

---

# Phase 8: Users & Roles

**Status**: 🔴 NOT STARTED | **Depends on**: Phase 4 | **Estimated Sessions**: 1

## Goal
Full user management system matching WordPress's user roles and profile features.

## Key Tasks
- [ ] Users list: table with username, name, email, role, post count; filter by role; search
- [ ] Add New User page: username, email, first name, last name, website, password, role, send notification email
- [ ] Edit User page: same fields + change password section + extended profile (bio, social links)
- [ ] Your Profile page (editable by any logged-in user for own account)
- [ ] Role assignment (admin only)
- [ ] Avatar: Gravatar fallback + local upload
- [ ] User meta for preferences: admin color scheme, show welcome panel, admin dark mode
- [ ] Bulk action: change role, delete
- [ ] Cannot delete yourself

## Definition of Done
- [ ] Admin can create/edit/delete users
- [ ] Non-admin users can edit only their own profile
- [ ] Role change takes effect immediately on next login

---

# Phase 9: Settings & Permalink System

**Status**: 🔴 NOT STARTED | **Depends on**: Phase 4 | **Estimated Sessions**: 2

## Goal
Complete settings pages + the configurable permalink system — the most technically complex settings feature.

## Key Tasks

### Settings Pages
- [ ] General: site title, tagline, URL, admin email, membership (allow registration), default role, timezone, date format, time format, week starts on
- [ ] Writing: default post category, default post format, post via email (stub)
- [ ] Reading: "Your homepage displays" — latest posts OR static page (select from pages); posts per page; search engine visibility
- [ ] Discussion: comments (enable/disable), approval requirements, moderation blacklist, avatars (show/hide, rating, default)
- [ ] Media: image sizes (thumbnail, medium, large — width/height fields)
- [ ] Permalinks: (see below)

### Permalink Settings Page
- [ ] Radio button options (matching WordPress):
  - Plain: `/?p=%post_id%`
  - Day and name: `/%year%/%month%/%day%/%postname%/`
  - Month and name: `/%year%/%month%/%postname%/`
  - Numeric: `/archives/%post_id%`
  - Post name: `/%postname%/`  ← default for Depot
  - Custom structure: text input field
- [ ] Category base prefix field
- [ ] Tag base prefix field
- [ ] Save → writes `permalink_structure` to `options` table
- [ ] "Save Changes" shows success notice

### `PermalinkRouter` class (`src/lib/routing.ts`)
- [ ] `parsePermalinkStructure(structure: string): Token[]` — tokenizes the structure string
- [ ] `matchUrl(segments: string[], structure: string): MatchResult | null` — extracts named parts from URL
- [ ] `generateLink(post: Post): string` — builds URL from post + active structure
- [ ] `resolveRequest(segments: string[]): ResolvedContent | null` — hits DB and returns Post/Term/Author or null

### Catch-All Route (`src/app/[[...slug]]/page.tsx`)
- [ ] Server Component
- [ ] Reads `permalink_structure` from options (with in-memory cache)
- [ ] Calls `PermalinkRouter.resolveRequest(segments)`
- [ ] Resolution hierarchy: Page → Post → Category → Tag → Author → 404
- [ ] Renders appropriate frontend template (from Phase 10)
- [ ] Returns 404 if nothing matches

## Definition of Done
- [ ] Changing permalink structure in admin immediately affects frontend URLs
- [ ] `generateLink(post)` returns the correct URL for each structure option
- [ ] All 6 permalink options work correctly
- [ ] Archive pages resolve correctly (category, tag, author)
- [ ] Settings all save and reload correctly

---

# Phase 10: Frontend Theming System

**Status**: 🔴 NOT STARTED | **Depends on**: Phase 9 | **Estimated Sessions**: 3

## Goal
A complete frontend theming system with a default theme, component overriding, and a theme customizer.

## Key Tasks

### Theme Infrastructure
- [ ] `src/lib/theme.ts`:
  - `loadTheme(name: string): ThemeDefinition`
  - `getActiveTheme(): ThemeDefinition`
  - `resolveComponent(name: string): React.ComponentType` — checks theme override, falls back to core
- [ ] `<DepotComponent name="..." props={...} />` wrapper component
- [ ] `themes/<theme-name>/theme.json` schema: name, version, author, description, screenshot, supports, textDomain, widgetAreas, menuLocations

### Default Theme (`themes/depot-default/`)
- [ ] `theme.json` metadata
- [ ] `style.css` — theme stylesheet using CSS variables
- [ ] Core components (frontend):
  - `Header.tsx` — site name, description, nav menu
  - `Footer.tsx` — footer widgets, credits
  - `PostCard.tsx` — post in list/archive view
  - `PostSingle.tsx` — full single post
  - `PageSingle.tsx` — full single page
  - `CommentList.tsx` + `CommentForm.tsx`
  - `Sidebar.tsx` — renders widget areas
  - `SearchForm.tsx`
  - `Pagination.tsx`
  - `Breadcrumbs.tsx`

### Frontend Pages (served by `[[...slug]]`)
- [ ] Home: blog post list (if homepage = latest posts) or static page
- [ ] Single post
- [ ] Single page
- [ ] Category archive
- [ ] Tag archive
- [ ] Author archive
- [ ] Search results (`?s=query`)
- [ ] 404 page

### Themes Admin Page (`/admin/themes`)
- [ ] Grid of installed themes (screenshot + name + author)
- [ ] Active theme highlighted with "Activated" label
- [ ] "Activate" button on inactive themes
- [ ] Theme detail modal on click: description, version, author, "Activate" button

### Theme Customizer (Basic)
- [ ] `/admin/themes/customize` — split view: settings panel (left) + live preview iframe (right)
- [ ] Settings: Site Title, Tagline, Logo, Header Image, Background Color, Accent Color, Footer text
- [ ] Changes update CSS variables via postMessage to iframe
- [ ] "Publish" saves to `options` table

## Definition of Done
- [ ] Default theme renders posts, pages, archives correctly
- [ ] Can install a second theme and activate it — frontend changes immediately
- [ ] Theme customizer saves logo and accent color
- [ ] Catch-all route resolves all URL types correctly

---

# Phase 11: Plugin System

**Status**: 🔴 NOT STARTED | **Depends on**: Phase 5 | **Estimated Sessions**: 2

## Goal
A fully functional plugin architecture allowing third-party code to extend Depot without modifying core.

## Key Tasks

### HookServer (Complete)
- [ ] Complete `src/lib/hooks.ts` with priority support:
  ```typescript
  add_filter(name, callback, priority = 10, acceptedArgs = 1)
  add_action(name, callback, priority = 10, acceptedArgs = 1)
  apply_filters(name, value, ...args): Promise<any>
  do_action(name, ...args): Promise<void>
  remove_filter(name, callback, priority?)
  remove_action(name, callback, priority?)
  has_filter(name, callback?): boolean | number
  has_action(name, callback?): boolean | number
  did_action(name): number  // count of times fired
  current_filter(): string | null
  ```
- [ ] Callbacks stored in priority-ordered buckets (like WordPress)
- [ ] `apply_filters` runs callbacks in priority order, passing output of each as input to next
- [ ] `do_action` runs all callbacks (can run concurrently if no order dependency)

### Plugin Discovery & Loading
- [ ] `src/lib/plugins.ts`:
  - `discoverPlugins()` — scans `plugins/` directory for `index.ts` files
  - `loadPlugin(name)` — dynamically imports plugin entry point
  - `activatePlugin(name)` — adds to `active_plugins` option, calls plugin's `activate()` hook
  - `deactivatePlugin(name)` — removes from `active_plugins`, calls `deactivate()` hook
  - `getInstalledPlugins()` — returns list with metadata
  - `getActivePlugins()` — returns list of active plugin names from options
- [ ] Plugin entry point convention:
  ```typescript
  // plugins/my-plugin/index.ts
  export const plugin = {
    name: 'My Plugin',
    version: '1.0.0',
    description: '...',
    author: '...',
    activate() { /* register hooks */ },
    deactivate() { /* cleanup */ },
  }
  ```
- [ ] Plugins loaded at server startup in `src/lib/plugins.ts` — called from app initialization

### Plugins Admin Page
- [ ] `/admin/plugins` — table of installed plugins
- [ ] Columns: Plugin, Description, Version, Author, Status (Active/Inactive)
- [ ] Actions: Activate / Deactivate / Delete
- [ ] Bulk: Activate, Deactivate, Delete

### Example Plugin
- [ ] `plugins/depot-seo/` — SEO meta plugin:
  - Adds "SEO" meta box to post editor
  - Fields: Meta Title, Meta Description, OG Image
  - Hooks: `apply_filters('post.head', headContent, post)` to inject meta tags
  - Stores values in `post_meta` with keys `_seo_title`, `_seo_description`, `_seo_og_image`

## Definition of Done
- [ ] `plugins/depot-seo` plugin can be activated and deactivated from admin
- [ ] SEO meta box appears in post editor when plugin is active
- [ ] SEO meta tags appear in page `<head>` for published posts
- [ ] Deactivating the plugin removes the meta box and tags

---

# Phase 12: Comments

**Status**: 🔴 NOT STARTED | **Depends on**: Phase 5 | **Estimated Sessions**: 1

## Key Tasks
- [ ] Comments admin list: table with author, comment text, post, submitted date, status
- [ ] Filter tabs: All | Pending (moderation) | Approved | Spam | Trash (with counts)
- [ ] Inline actions: Approve, Unapprove, Reply, Quick Edit, Spam, Trash
- [ ] Bulk: Approve, Unapprove, Mark as Spam, Move to Trash
- [ ] Reply inline (like WordPress — textarea appears below comment row)
- [ ] Frontend: `CommentList.tsx` + threaded (nested) display
- [ ] Frontend: `CommentForm.tsx` with name/email/website/comment fields
- [ ] API: `POST /api/comments` — submit comment (rate limited, honeypot field)
- [ ] Moderation: if user not logged in AND discussion settings require approval → status = "pending"
- [ ] Email notifications: to admin on new comment, to post author

## Definition of Done
- [ ] Comments appear below posts on frontend
- [ ] New comment form works with validation
- [ ] Admin can approve/spam/trash comments
- [ ] Pending comments show in admin with count badge

---

# Phase 13: Navigation Menus

**Status**: 🔴 NOT STARTED | **Depends on**: Phase 4 | **Estimated Sessions**: 2

## Key Tasks
- [ ] Menu builder at `/admin/menus`
- [ ] Left panel: "Add menu items" — accordion sections for Pages, Posts, Custom Links, Categories, Tags
- [ ] Right panel: drag-and-drop tree of current menu items (nested items = sub-menus)
- [ ] Each item: collapse/expand, label edit, URL edit (for custom links), delete
- [ ] Menu locations panel: assign menus to theme-registered locations
- [ ] Save menu → stores in DB: `terms` + `termmeta` + `term_relationships` (following WP pattern)
- [ ] `src/lib/menus.ts`: `getMenuByLocation(location)`, `getMenuItems(menuId)`
- [ ] Frontend: `<NavMenu location="primary" />` renders the menu as an `<nav>` with nested `<ul>`
- [ ] Active item highlighting (current page = aria-current)

## Definition of Done
- [ ] Can create a menu, add pages/posts/links, nest items, and assign to "Primary Menu" location
- [ ] Frontend renders the menu correctly in the header

---

# Phase 14: Widgets & Sidebars

**Status**: 🔴 NOT STARTED | **Depends on**: Phase 10 | **Estimated Sessions**: 2

## Key Tasks
- [ ] Widgets admin at `/admin/widgets`
- [ ] Left: "Available Widgets" list
- [ ] Right: "Sidebar" widget areas (from theme's `theme.json`)
- [ ] Drag a widget from left to a sidebar area to add it
- [ ] Click widget in sidebar → expand settings form (each widget has its own fields)
- [ ] Save: stores widget config in `options` table as JSON: `key = "widget_{area}_{id}"`
- [ ] Built-in widgets:
  - Search, Recent Posts (count), Recent Comments (count), Archives (dropdown/list/monthly), Categories (list/dropdown), Tag Cloud, Text (title + body), HTML, Image
- [ ] `src/lib/widgets.ts`: `registerWidget(widget)`, `getWidgetsForArea(area)`
- [ ] Frontend: `<DepotSidebar area="sidebar-1" />` renders all active widgets for that area

## Definition of Done
- [ ] Can add Search widget to sidebar, it appears on frontend
- [ ] Can configure Recent Posts count
- [ ] Widget order can be changed by dragging

---

# Phase 15: Admin Help & Documentation

**Status**: 🔴 NOT STARTED | **Depends on**: Phase 4 | **Estimated Sessions**: 1

## Key Tasks
- [ ] `/admin/help` — main help browser
- [ ] Left sidebar: documentation sections (Getting Started, Content, Appearance, Plugins, Settings, API, Keyboard Shortcuts, Changelog)
- [ ] Content area: renders markdown files from `depot/docs/`
- [ ] Search: fuzzy search across all doc titles + content
- [ ] Contextual help: every admin page has a "?" icon in topbar that opens a context-specific help drawer (`<HelpPanel>`)
- [ ] Keyboard shortcuts page: table of all shortcuts
- [ ] "What's New" / Changelog page
- [ ] Markdown files in `depot/docs/`:
  - `getting-started.md`, `posts.md`, `pages.md`, `media.md`, `users.md`, `themes.md`, `plugins.md`, `settings.md`, `api.md`, `keyboard-shortcuts.md`, `changelog.md`
- [ ] Render markdown with syntax highlighting (`rehype-highlight` or `shiki`)

## Definition of Done
- [ ] Can navigate all doc sections in admin
- [ ] Search finds relevant docs
- [ ] Each admin page shows contextual help in the "?" drawer

---

# Phase 16: REST API

**Status**: 🔴 NOT STARTED | **Depends on**: Phases 5–8 | **Estimated Sessions**: 2

## Key Tasks

### Endpoints
All under `/api/`:
- [ ] `GET /api/posts` — list (params: `page`, `per_page`, `status`, `type`, `search`, `category`, `tag`, `author`)
- [ ] `GET /api/posts/[id]` — single post
- [ ] `POST /api/posts` — create (auth required, `edit_posts` cap)
- [ ] `PUT /api/posts/[id]` — update (auth required)
- [ ] `DELETE /api/posts/[id]` — move to trash (auth required)
- [ ] Same for: `pages`, `media`, `users`, `comments`, `terms`
- [ ] `GET /api/settings` — public site settings (title, description, etc.)
- [ ] `GET /api/types` — registered post types
- [ ] `GET /api/taxonomies` — registered taxonomies

### Authentication
- [ ] API keys: admin can generate in User Profile (stored in `usermeta`)
- [ ] Bearer token auth: `Authorization: Bearer <api_key>`
- [ ] Also accepts NextAuth session cookies (for admin panel use)
- [ ] `src/lib/api-auth.ts`: `authenticateApiRequest(req)` → returns user or null

### Rate Limiting
- [ ] Basic in-memory rate limiter (or use Upstash Redis if available)
- [ ] 100 requests/minute for authenticated, 30 for unauthenticated

### Response Format
- [ ] JSON, following WP REST API conventions
- [ ] Pagination headers: `X-WP-Total`, `X-WP-TotalPages`, `Link`
- [ ] Error format: `{ code, message, data: { status } }`

### Plugin Extensibility
- [ ] `registerApiRoute(method, path, handler)` — plugins can add new API endpoints
- [ ] `hooks.apply_filters('api.post.response', data, post)` — filter API responses

## Definition of Done
- [ ] `GET /api/posts` returns paginated posts
- [ ] Can create a post via `POST /api/posts` with API key
- [ ] Rate limiting rejects over-limit requests with 429
- [ ] API key can be generated and used from User Profile page
