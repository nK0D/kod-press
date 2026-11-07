# KodPress — Full Project Directory Structure

> This is the target directory structure for the fully built KodPress project. Agents should use this as the reference for where to place new files.

```
kod-press/                                  ← Next.js project root
│
├── planning/                           ← All planning docs (not part of the app)
│   ├── README.md
│   ├── CURRENT_STATE.md
│   ├── HANDOFF_GUIDE.md
│   ├── MASTER_PLAN.md
│   ├── phases/
│   └── architecture/
│
├── public/                             ← Static assets served directly
│   ├── uploads/                        ← User media uploads
│   │   └── 2026/07/image.jpg
│   └── kodpress-logo.svg
│
├── plugins/                            ← Third-party and built-in plugins
│   └── kodpress-seo/
│       ├── index.ts                    ← Plugin entry point (exports `plugin` object)
│       ├── components/
│       │   └── SeoMetaBox.tsx
│       └── package.json
│
├── themes/                             ← Installed themes
│   └── kodpress-default/
│       ├── theme.json                  ← Theme metadata + widget areas + menu locations
│       ├── style.css                   ← Theme stylesheet
│       └── components/                 ← Theme component overrides
│           ├── Header.tsx
│           ├── Footer.tsx
│           ├── PostCard.tsx
│           └── ...
│
├── docs/                               ← Markdown files for admin Help section
│   ├── getting-started.md
│   ├── posts.md
│   ├── pages.md
│   ├── media.md
│   ├── users.md
│   ├── themes.md
│   ├── plugins.md
│   ├── settings.md
│   ├── api.md
│   ├── keyboard-shortcuts.md
│   └── changelog.md
│
├── prisma/
│   ├── schema.prisma                   ← Full Prisma schema
│   ├── seed.ts                         ← Database seeder
│   └── migrations/
│
├── src/
│   ├── app/                            ← Next.js App Router
│   │   │
│   │   ├── layout.tsx                  ← ROOT FRONTEND layout (wraps entire site)
│   │   ├── page.tsx                    ← Frontend homepage
│   │   │
│   │   ├── [[...slug]]/
│   │   │   └── page.tsx               ← Catch-all permalink router (frontend)
│   │   │
│   │   ├── setup/                      ← Setup wizard (pre-install only)
│   │   │   ├── page.tsx
│   │   │   └── _steps/
│   │   │       ├── Welcome.tsx
│   │   │       ├── DatabaseConfig.tsx
│   │   │       ├── SiteInfo.tsx
│   │   │       ├── AdminAccount.tsx
│   │   │       └── Complete.tsx
│   │   │
│   │   ├── admin/                      ← ENTIRE ADMIN PANEL
│   │   │   ├── layout.tsx             ← Admin shell layout (sidebar + topbar)
│   │   │   ├── page.tsx               ← Dashboard
│   │   │   │
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── forgot/page.tsx
│   │   │   │   └── reset/page.tsx
│   │   │   │
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx           ← Post list
│   │   │   │   ├── new/page.tsx       ← New post
│   │   │   │   ├── [id]/page.tsx      ← Edit post
│   │   │   │   └── actions.ts         ← Server Actions
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   │
│   │   │   ├── media/
│   │   │   │   ├── page.tsx           ← Media library grid
│   │   │   │   └── new/page.tsx       ← Upload page
│   │   │   │
│   │   │   ├── comments/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── taxonomies/
│   │   │   │   └── [taxonomy]/page.tsx ← Serves both /categories and /tags
│   │   │   │
│   │   │   ├── menus/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── widgets/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── themes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── customize/page.tsx
│   │   │   │
│   │   │   ├── plugins/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx           ← General settings
│   │   │   │   ├── writing/page.tsx
│   │   │   │   ├── reading/page.tsx
│   │   │   │   ├── discussion/page.tsx
│   │   │   │   ├── media/page.tsx
│   │   │   │   └── permalinks/page.tsx ← Permalink structure config
│   │   │   │
│   │   │   ├── tools/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── help/
│   │   │       ├── page.tsx
│   │   │       └── [section]/page.tsx
│   │   │
│   │   └── api/                        ← Public REST API
│   │       ├── auth/
│   │       │   └── [...nextauth]/route.ts
│   │       ├── setup/
│   │       │   ├── test-db/route.ts
│   │       │   └── install/route.ts
│   │       ├── posts/
│   │       │   ├── route.ts           ← GET (list) + POST (create)
│   │       │   └── [id]/route.ts      ← GET + PUT + DELETE
│   │       ├── pages/
│   │       ├── media/
│   │       │   ├── route.ts
│   │       │   └── upload/route.ts
│   │       ├── users/
│   │       ├── comments/
│   │       │   └── route.ts
│   │       └── terms/
│   │           └── [taxonomy]/route.ts
│   │
│   ├── components/
│   │   ├── admin/                      ← Admin-only UI components
│   │   │   ├── AdminShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── HelpPanel.tsx
│   │   │   ├── MediaPicker.tsx
│   │   │   ├── MenuBuilder.tsx
│   │   │   ├── editor/
│   │   │   │   ├── RichTextEditor.tsx
│   │   │   │   └── EditorToolbar.tsx
│   │   │   └── widgets/               ← Dashboard widgets
│   │   │       ├── AtAGlance.tsx
│   │   │       ├── QuickDraft.tsx
│   │   │       ├── RecentActivity.tsx
│   │   │       └── WelcomePanel.tsx
│   │   │
│   │   └── frontend/                   ← Core frontend components (overridable by themes)
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── PostCard.tsx
│   │       ├── PostSingle.tsx
│   │       ├── PageSingle.tsx
│   │       ├── CommentList.tsx
│   │       ├── CommentForm.tsx
│   │       ├── Sidebar.tsx
│   │       ├── SearchForm.tsx
│   │       ├── Pagination.tsx
│   │       ├── NavMenu.tsx
│   │       └── Breadcrumbs.tsx
│   │
│   └── lib/                            ← Core library / utilities
│       ├── db.ts                       ← Prisma singleton
│       ├── env.ts                      ← Zod environment validation
│       ├── auth-utils.ts               ← Auth helpers (getCurrentUser, requireAuth, etc.)
│       ├── hooks.ts                    ← HookServer singleton (plugin system)
│       ├── plugins.ts                  ← Plugin discovery & loading
│       ├── options.ts                  ← Options table helpers (get/set with cache)
│       ├── routing.ts                  ← PermalinkRouter class + generateLink
│       ├── theme.ts                    ← Theme loader + KodPressComponent resolver
│       ├── post-types.ts               ← Custom post type registry
│       ├── taxonomies.ts               ← Custom taxonomy registry
│       ├── roles.ts                    ← Role definitions
│       ├── capabilities.ts             ← Capability checking
│       ├── menus.ts                    ← Menu helpers
│       ├── widgets.ts                  ← Widget registry
│       ├── slug.ts                     ← Slug generation + uniqueness
│       ├── media.ts                    ← Media helpers
│       ├── storage.ts                  ← Storage adapter
│       ├── image-processor.ts          ← sharp image processing
│       └── api-auth.ts                 ← API key authentication
│
├── auth.ts                             ← NextAuth v5 config
├── kodpress.config.ts                     ← KodPress configuration
├── middleware.ts                       ← Next.js middleware (route protection)
├── next.config.ts                      ← Next.js configuration
├── tsconfig.json
├── package.json
├── .env
├── .env.example
│
├── README.md                           ← Project vision doc (already exists)
├── ARCHITECTURE.md                     ← Architecture doc (already exists)
└── DATABASE_SCHEMA.md                  ← DB schema overview (already exists)
```
