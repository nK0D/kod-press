# KodPress — Master Plan (All Phases)

> This is the complete end-to-end plan for the KodPress CMS project. Each phase builds on the previous. Phases are designed to be achievable within a single agent session (or a few sessions for larger phases).

---

## Phase Overview & Dependencies

```
Phase 1: Foundation          ──────────────────────────────── [START HERE]
Phase 2: Database Schema     ← depends on Phase 1
Phase 3: Authentication      ← depends on Phase 2
Phase 4: Admin Core UI       ← depends on Phase 3
Phase 5: Content (Posts/Pages) ← depends on Phase 4
Phase 6: Media Library       ← depends on Phase 4
Phase 7: Taxonomies          ← depends on Phase 5
Phase 8: Users & Roles       ← depends on Phase 4
Phase 9: Settings & Permalinks ← depends on Phase 4
Phase 10: Theming System     ← depends on Phase 9
Phase 11: Plugin System      ← depends on Phase 5 (ideally run in parallel with 5-9)
Phase 12: Comments           ← depends on Phase 5
Phase 13: Navigation Menus   ← depends on Phase 4
Phase 14: Widgets & Sidebars ← depends on Phase 10
Phase 15: Help & Docs (Admin)← depends on Phase 4
Phase 16: REST API           ← depends on Phase 5, 6, 7, 8
```

---

## Phase 1: Foundation & Setup Wizard
**Goal**: A working Next.js project with a functioning web-based setup wizard.

**Deliverables**:
- Next.js 14 app scaffolded in `kod-press/`
- Environment config (`src/lib/env.ts` with Zod)
- KodPress config file (`kodpress.config.ts`)
- `/setup` wizard (5 steps: Welcome → DB Config → Site Info → Admin Account → Done)
- `middleware.ts` — redirects `/admin/*` to login if not authenticated, redirects `/setup` away if already installed
- HookServer singleton (`src/lib/hooks.ts`) — initialized but empty
- Basic `src/lib/db.ts` Prisma singleton

**Key Files**:
- `kod-press/src/app/setup/page.tsx` + steps
- `kod-press/src/lib/env.ts`
- `kod-press/src/lib/db.ts`
- `kod-press/src/lib/hooks.ts`
- `kod-press/src/middleware.ts`
- `kod-press/kodpress.config.ts`

**Estimated Sessions**: 1–2

---

## Phase 2: Database Schema
**Goal**: Complete, production-ready Prisma schema matching WordPress's data model.

**Deliverables**:
- `prisma/schema.prisma` with ALL core tables
- Tables: `User`, `UserMeta`, `Post`, `PostMeta`, `Term`, `TermMeta`, `TermTaxonomy`, `TermRelationship`, `Comment`, `CommentMeta`, `Option`, `Link`
- Migrations for MySQL, PostgreSQL, SQLite
- Database seeder for initial data (admin user, default options)
- Prisma client properly typed

**Key Files**:
- `kod-press/prisma/schema.prisma`
- `kod-press/prisma/seed.ts`
- `kod-press/prisma/migrations/`

**Estimated Sessions**: 1

---

## Phase 3: Authentication
**Goal**: Secure login system for admin panel with roles & permissions.

**Deliverables**:
- NextAuth.js v5 configured (credentials provider)
- Session includes user role (`admin`, `editor`, `author`, `contributor`, `subscriber`)
- `/admin/login` page (branded, not using theme)
- Password hashing (bcrypt)
- `middleware.ts` updated with role-based route protection
- "Forgot password" flow (email + token)

**Key Files**:
- `kod-press/src/app/api/auth/[...nextauth]/route.ts`
- `kod-press/auth.ts` (NextAuth config)
- `kod-press/src/app/admin/login/page.tsx`
- `kod-press/src/lib/auth.ts` (helper utilities)

**Estimated Sessions**: 1

---

## Phase 4: Admin Panel Core UI
**Goal**: The full admin shell — sidebar, topbar, dashboard — in a modern custom design.

**Deliverables**:
- Admin layout (`app/admin/layout.tsx`) with collapsible sidebar
- Sidebar navigation matching wp-admin structure (Posts, Pages, Media, Comments, Appearance/Themes, Plugins, Users, Tools, Settings, Help)
- Top bar (user avatar, notifications bell, site preview link, "New" quick-add button)
- Dashboard with widgets (At a Glance, Quick Draft, Activity, Site Health)
- Dark/light mode toggle (admin-specific, persisted in user meta)
- Responsive — works on tablet and desktop
- Breadcrumbs system

**Key Files**:
- `kod-press/src/app/admin/layout.tsx`
- `kod-press/src/components/admin/Sidebar.tsx`
- `kod-press/src/components/admin/Topbar.tsx`
- `kod-press/src/app/admin/page.tsx` (dashboard)
- `kod-press/src/components/admin/widgets/`

**Estimated Sessions**: 2

---

## Phase 5: Content Management (Posts & Pages)
**Goal**: Full CRUD for posts and pages with a rich text editor.

**Deliverables**:
- Post list page (with filters: status, date, category, author; bulk actions; search)
- Post editor (TipTap rich text, title, slug auto-generation, featured image, excerpt, status, categories, tags, publish date)
- Page list and editor (same as posts, but no categories/tags by default)
- Revisions system (save post revisions in PostMeta)
- Quick Edit (inline editing in list view)
- Trash system (soft delete)
- Custom Post Types — registration API (`registerPostType()`)

**Key Files**:
- `kod-press/src/app/admin/posts/page.tsx`
- `kod-press/src/app/admin/posts/[id]/page.tsx`
- `kod-press/src/app/admin/pages/page.tsx`
- `kod-press/src/app/admin/pages/[id]/page.tsx`
- `kod-press/src/components/admin/editor/`
- `kod-press/src/lib/post-types.ts`

**Estimated Sessions**: 3

---

## Phase 6: Media Library
**Goal**: WordPress-style media library with upload, crop, and attachment management.

**Deliverables**:
- Media library grid view (filterable by type, date, search)
- File upload (drag & drop, multiple files)
- Image processing (sharp: resize, crop, thumbnail generation)
- Attachment detail panel (title, alt text, caption, description, copy URL)
- Media list table view (alternative to grid)
- Insert media into post editor
- Local storage adapter (files in `public/uploads/YYYY/MM/`)

**Key Files**:
- `kod-press/src/app/admin/media/page.tsx`
- `kod-press/src/app/api/media/upload/route.ts`
- `kod-press/src/lib/media.ts`
- `kod-press/src/components/admin/MediaLibrary.tsx`

**Estimated Sessions**: 2

---

## Phase 7: Taxonomies (Categories & Tags)
**Goal**: Full taxonomy system — categories, tags, and custom taxonomies.

**Deliverables**:
- Categories admin page (list + add + edit + delete, with hierarchy/parent support)
- Tags admin page (list + add + edit + delete, flat)
- Custom taxonomy registration API (`registerTaxonomy()`)
- Term archive pages on the frontend
- Category/tag selection in post editor

**Key Files**:
- `kod-press/src/app/admin/taxonomies/[taxonomy]/page.tsx`
- `kod-press/src/lib/taxonomies.ts`

**Estimated Sessions**: 1

---

## Phase 8: Users & Roles
**Goal**: Full user management with WordPress-compatible role system.

**Deliverables**:
- Users list page (sortable, searchable, filterable by role)
- Add/edit/delete user
- User profile page (edit own profile)
- Roles: Administrator, Editor, Author, Contributor, Subscriber
- Capabilities matrix (what each role can do)
- Avatar support (Gravatar + local upload)

**Key Files**:
- `kod-press/src/app/admin/users/page.tsx`
- `kod-press/src/app/admin/users/[id]/page.tsx`
- `kod-press/src/lib/roles.ts`
- `kod-press/src/lib/capabilities.ts`

**Estimated Sessions**: 1

---

## Phase 9: Settings & Permalink System
**Goal**: Complete settings system + the configurable permalink architecture.

**Deliverables**:
- General Settings (site title, tagline, URL, admin email, timezone, date/time format)
- Reading Settings (homepage display: posts/page, posts per page)
- Writing Settings (default category, default post format)
- Discussion Settings (comments, moderation, avatars)
- Media Settings (image sizes)
- Permalink Settings UI (radio buttons + custom structure field — exactly like WordPress)
- `PermalinkRouter` class in `src/lib/routing.ts`
- `generateLink()` helper
- The `[[...slug]]` catch-all route implementation

**Key Files**:
- `kod-press/src/app/admin/settings/permalinks/page.tsx`
- `kod-press/src/lib/routing.ts`
- `kod-press/src/app/[[...slug]]/page.tsx`

**Estimated Sessions**: 2

---

## Phase 10: Frontend Theming System
**Goal**: A complete, switchable theming system for the public frontend.

**Deliverables**:
- Default theme (`themes/kodpress-default/`)
- `theme.json` schema and reader
- `KodPressComponent` resolver (`src/lib/theme.ts`)
- Theme activation via admin panel (Appearance → Themes)
- Theme customizer (basic: colors, fonts, logo via CSS variables)
- Core frontend components: `Header`, `Footer`, `PostCard`, `PostSingle`, `PageSingle`, `Sidebar`, `SearchForm`, `CommentList`, `Pagination`
- Frontend pages: Home (blog index), Single Post, Single Page, Category archive, Tag archive, Author archive, Search results, 404

**Key Files**:
- `kod-press/themes/kodpress-default/`
- `kod-press/src/lib/theme.ts`
- `kod-press/src/components/frontend/`
- `kod-press/src/app/admin/themes/page.tsx`

**Estimated Sessions**: 3

---

## Phase 11: Plugin System
**Goal**: A fully functional plugin architecture allowing third-party extensibility.

**Deliverables**:
- `HookServer` fully implemented (`add_action`, `add_filter`, `do_action`, `apply_filters`, `remove_action`, `remove_filter`, `has_filter`, `has_action`)
- Plugin discovery & loading system (scans `plugins/` at startup)
- Plugin activation/deactivation (stored in `options`)
- Plugin list in Admin (Plugins → Installed Plugins)
- A working example plugin: `plugins/kodpress-seo/` (adds SEO meta fields to post editor)
- Plugin API documentation

**Key Files**:
- `kod-press/src/lib/hooks.ts` (complete implementation)
- `kod-press/src/lib/plugins.ts` (discovery & loading)
- `kod-press/src/app/admin/plugins/page.tsx`
- `kod-press/plugins/kodpress-seo/index.ts`

**Estimated Sessions**: 2

---

## Phase 12: Comments
**Goal**: Full comment system matching WordPress's comment features.

**Deliverables**:
- Comments list in admin (approve, spam, trash, reply, edit)
- Comment moderation settings (hold for approval, blacklist)
- Frontend comment form + threaded comment display
- Comment counts on posts
- Pingbacks / trackbacks (basic)
- Discussion settings integration (from Phase 9)

**Key Files**:
- `kod-press/src/app/admin/comments/page.tsx`
- `kod-press/src/components/frontend/Comments.tsx`
- `kod-press/src/app/api/comments/route.ts`

**Estimated Sessions**: 1

---

## Phase 13: Navigation Menus
**Goal**: Drag-and-drop navigation menu builder (like WordPress Appearance → Menus).

**Deliverables**:
- Menu builder UI (drag-and-drop, nested items for sub-menus)
- Add items: Pages, Posts, Custom Links, Categories, Tags
- Menu locations (register theme locations in theme.json)
- Menu rendering on the frontend
- `wp_nav_menu()` equivalent component

**Key Files**:
- `kod-press/src/app/admin/menus/page.tsx`
- `kod-press/src/components/admin/MenuBuilder.tsx`
- `kod-press/src/components/frontend/NavMenu.tsx`
- `kod-press/src/lib/menus.ts`

**Estimated Sessions**: 2

---

## Phase 14: Widgets & Sidebars
**Goal**: WordPress-style widget system for sidebars and widget areas.

**Deliverables**:
- Widget area registration in themes (`theme.json: widgetAreas`)
- Built-in widgets: Search, Recent Posts, Recent Comments, Archives, Categories, Tag Cloud, Text, HTML, Image
- Widgets admin page (drag-and-drop into sidebar areas)
- `KodPressSidebar` component for the frontend
- Widget configuration panel (each widget has its own settings)

**Key Files**:
- `kod-press/src/app/admin/widgets/page.tsx`
- `kod-press/src/lib/widgets.ts`
- `kod-press/src/components/frontend/Sidebar.tsx`

**Estimated Sessions**: 2

---

## Phase 15: Admin Help & Documentation
**Goal**: A built-in help and documentation section in the admin panel.

**Deliverables**:
- `/admin/help` — documentation browser
- Sections: Getting Started, Content Management, Theming, Plugins, Settings, API Reference, Keyboard Shortcuts
- Contextual help tabs (like WordPress's "Help" tab on each admin screen)
- Search across all docs
- Markdown-rendered help articles (stored in `kod-press/docs/` as `.md` files)
- "What's New" changelog page

**Key Files**:
- `kod-press/src/app/admin/help/page.tsx`
- `kod-press/src/app/admin/help/[section]/page.tsx`
- `kod-press/docs/` (markdown help articles)
- `kod-press/src/components/admin/HelpPanel.tsx`

**Estimated Sessions**: 1

---

## Phase 16: REST API
**Goal**: A documented public REST API for headless usage and plugin extensibility.

**Deliverables**:
- `GET /api/posts` — list posts (paginated, filterable)
- `GET /api/posts/[id]` — single post
- `POST /api/posts` — create post (authenticated)
- `PUT /api/posts/[id]` — update post (authenticated)
- `DELETE /api/posts/[id]` — delete post (authenticated)
- Same CRUD for: Pages, Media, Users, Terms, Comments
- Authentication: API keys (stored in `usermeta`) + Bearer token
- Rate limiting
- Auto-generated API reference (in the Help section)
- Plugin-extendable: plugins can register new API routes

**Key Files**:
- `kod-press/src/app/api/posts/route.ts`
- `kod-press/src/app/api/posts/[id]/route.ts`
- etc.
- `kod-press/src/lib/api-auth.ts`

**Estimated Sessions**: 2

---

## 📈 Milestone Summary

| Milestone | Phases | What It Unlocks |
|---|---|---|
| **M1: Minimal Working CMS** | 1–5 | Create, edit, publish posts/pages; admin login; setup wizard |
| **M2: Complete Content Platform** | 6–9 | Media, users, categories, settings, custom permalinks |
| **M3: Themeable & Extensible** | 10–11 | Theme system, plugin system — the CMS becomes a platform |
| **M4: Feature Complete** | 12–15 | Comments, menus, widgets, help docs |
| **M5: API & Developer Platform** | 16 | Headless usage, plugin integrations, REST API |
