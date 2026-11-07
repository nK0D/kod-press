# KodPress — Current State & Session Handoff

> **AGENT INSTRUCTION**: Read this file at the start of every session. Update it before ending a session or after completing a milestone. This is the living record of project progress.

---

## 📊 Overall Progress

```
Phase 0  [COMPLETE]  ████████████████████  Planning & Architecture Docs
Phase 1  [COMPLETE]  ████████████████████  Foundation: Next.js scaffold + Setup Wizard
Phase 2  [COMPLETE]  ████████████████████  Database: Full Prisma Schema & Migrations
Phase 3  [COMPLETE]  ████████████████████  Authentication (NextAuth.js v5)
Phase 4  [COMPLETE]  ████████████████████  Admin Panel Core Layout & Dashboard
Phase 5  [MOSTLY]    ████████████████░░░░  Content: Posts, Pages, Custom Post Types
Phase 6  [PENDING]   ░░░░░░░░░░░░░░░░░░░░  Media Library
Phase 7  [PARTIAL]   ██████████░░░░░░░░░░  Taxonomies: Categories, Tags
Phase 8  [PENDING]   ░░░░░░░░░░░░░░░░░░░░  Users & Roles
Phase 9  [PENDING]   ░░░░░░░░░░░░░░░░░░░░  Settings & Permalink System
Phase 10 [PENDING]   ░░░░░░░░░░░░░░░░░░░░  Frontend Theming System
Phase 11 [PENDING]   ░░░░░░░░░░░░░░░░░░░░  Plugin System
Phase 12 [PENDING]   ░░░░░░░░░░░░░░░░░░░░  Comments
Phase 13 [PENDING]   ░░░░░░░░░░░░░░░░░░░░  Navigation Menus
Phase 14 [PENDING]   ░░░░░░░░░░░░░░░░░░░░  Widgets & Sidebars
Phase 15 [PENDING]   ░░░░░░░░░░░░░░░░░░░░  Admin Help & Documentation Area
Phase 16 [PENDING]   ░░░░░░░░░░░░░░░░░░░░  REST API (Public)
```

---

## 🎯 NEXT AGENT ACTION

**STATE: Phase 5 core is done — posts and pages can be written, published, revised, trashed, and read on the public site.** The project was renamed from Depot to KodPress on 2026-11-07; work happens on the `dev` branch, `release` is the GitHub default.

### How content works now (read before touching posts/pages)
- **Content module** — `src/lib/content/` (`content` from `@/lib/content`). Every post/page/term operation goes through it; it takes an `Actor` and enforces capabilities, slugs, sanitizing, revisions, trash, term counts, and hooks. Server Actions in `src/app/admin/(protected)/content-actions.ts` only translate forms into calls. Do not query `db.post` directly from screens.
- **Access module** — `src/lib/access.ts` (`can`, `assertCan`, `actorFromSession`); `requireActor()` / `requireCap()` in `src/lib/auth-utils.ts`. Session fields are typed in `src/types/auth.d.ts`.
- **Tests** — `npm test` (Vitest) runs against a throwaway SQLite database built from the Prisma migrations (`src/test/database.ts`).

### ➡️ Next: pick one
1. **Fix the install flow (release blocker).** The setup wizard never creates a User; only a hand-run `prisma db seed` does. Fold install state (kodpress-config.json, `kodpress_installed`, `.env`) into one Installation module and create the admin during install.
2. **Phase 6: Media Library** — unlocks featured images and image upload in the editor (currently "image from URL" only).
3. **Finish Phase 5 leftovers:** Quick Edit, featured image panel, Preview button, password-protected visibility, scheduled (`future`) posts, SEO meta fields.

---

## ✅ Completed Work Log

### Phase 0: Documentation & Planning
- [x] `kod-press/README.md` — Project vision & feasibility study  
- [x] `kod-press/ARCHITECTURE.md` — Technical architecture (theming, plugins, routing, directory structure)  
- [x] `kod-press/DATABASE_SCHEMA.md` — Initial Prisma schema (User, Post, Option, Meta tables)  
- [x] `kod-press/planning/README.md` — Master planning index  
- [x] `kod-press/planning/CURRENT_STATE.md` — This file  
- [x] `kod-press/planning/HANDOFF_GUIDE.md` — Agent conventions & architecture rules  
- [x] `kod-press/planning/MASTER_PLAN.md` — Full phased plan  
- [x] `kod-press/planning/phases/PHASE_01_FOUNDATION.md`  
- [x] `kod-press/planning/phases/PHASE_02_DATABASE.md`  
- [x] `kod-press/planning/phases/PHASE_03_AUTH.md`  
- [x] `kod-press/planning/phases/PHASE_04_ADMIN_CORE.md`  
- [x] `kod-press/planning/phases/PHASE_05_CONTENT.md`  
- [x] `kod-press/planning/phases/PHASE_06_MEDIA.md`  
- [x] `kod-press/planning/phases/PHASE_07_TAXONOMY.md`  
- [x] `kod-press/planning/phases/PHASE_08_USERS.md`  
- [x] `kod-press/planning/phases/PHASE_09_SETTINGS.md`  
- [x] `kod-press/planning/phases/PHASE_10_THEMING.md`  
- [x] `kod-press/planning/phases/PHASE_11_PLUGINS.md`  
- [x] `kod-press/planning/phases/PHASE_12_COMMENTS.md`  
- [x] `kod-press/planning/phases/PHASE_13_MENUS.md`  
- [x] `kod-press/planning/phases/PHASE_14_WIDGETS.md`  
- [x] `kod-press/planning/phases/PHASE_15_HELP_DOCS.md`  
- [x] `kod-press/planning/phases/PHASE_16_API_REST.md`  
- [x] `kod-press/planning/architecture/DIRECTORY_STRUCTURE.md`  
- [x] `kod-press/planning/architecture/HOOK_SYSTEM.md`  
- [x] `kod-press/planning/architecture/ROUTING_SYSTEM.md`  
- [x] `kod-press/planning/architecture/THEMING_SYSTEM.md`  
- [x] `kod-press/planning/architecture/DATABASE_DESIGN.md`  
- [x] `kod-press/planning/decisions/ADR_001_TECH_STACK.md`  

### Phase 1: Foundation & Setup Wizard
- [x] Next.js 16.2.10 scaffolded inside `kod-press/`
- [x] Initialized Prisma 7 with SQLite and SQLite driver adapters (`better-sqlite3`, `@prisma/adapter-better-sqlite3`)
- [x] Created `src/lib/db.ts` Prisma Client singleton with Prisma 7 driver adapter pattern
- [x] Created Zod-based environment variable validator `src/lib/env.ts`
- [x] Created `kodpress.config.ts` CMS configuration
- [x] Created `HookServer` singleton `src/lib/hooks.ts` for plugin systems
- [x] Created basic middleware for route protection in `src/middleware.ts`
- [x] Implemented `/api/setup/test-db` and `/api/setup/install` API endpoints
- [x] Implemented multi-step beautiful Setup Wizard at `/setup`
- [x] Created placeholders for home page (`src/app/page.tsx`), admin panel (`src/app/admin/`), and login page

### Phase 2: Database Schema Expansion
- [x] Expanded `prisma/schema.prisma` with all core WordPress-compatible models (`User`, `UserMeta`, `Post`, `PostMeta`, `Term`, `TermMeta`, `TermTaxonomy`, `TermRelationship`, `Comment`, `CommentMeta`, `Option`, `Link`)
- [x] Created and configured database seeder at `prisma/seed.ts` seeding options and default "Uncategorized" category
- [x] Deployed and ran database migration for full schema (`npx prisma migrate dev --name full-schema`)
- [x] Integrated in-memory cached option helpers in `src/lib/options.ts`
- [x] Implemented automated admin profile creation from temporary setup wizard options in the database seeder

---

## 📋 Session Log

| Date | Agent | What Was Done |
|---|---|---|
| 2026-07-04 | Agent A | Created `kod-press/README.md`, `kod-press/ARCHITECTURE.md`, `kod-press/DATABASE_SCHEMA.md` |
| 2026-07-04 | Agent B | Created full `kod-press/planning/` directory with all planning & architecture docs |
| 2026-07-04 | Current Agent | Executed Phase 1: bootstrapped Next.js, set up Prisma 7 SQLite adapter, created HookServer, env validation, route protection, setup APIs, and UI setup wizard |
| 2026-07-04 | Current Agent | Executed Phase 2: expanded Prisma schema to all core models, configured seed script, ran database migrations, set up caching options utility, and enabled admin profile auto-migration. Added root `kodpress-config.json` generation. |
| 2026-07-04 | Current Agent | Executed Phase 3: Configured NextAuth.js v5 credentials login, mapped database roles/capabilities, updated middleware route protection, built forgot/reset flows. |
| 2026-07-04 | Current Agent | Executed Phase 4: Built full admin shell (AdminShell, Sidebar, Topbar, Breadcrumbs), admin CSS variables, dark/light theme toggle, live dashboard stats, Quick Draft server action, 7 shared UI components, 9 placeholder admin pages. |
| 2026-11-07 | Claude | Revived the stale project (Node 24 native-module rebuild, stale `.next` cache), renamed Depot → KodPress, set up `origin` (dev/release). Phase 5: Content + Access modules with Vitest tests, posts/pages list + TipTap editor, revisions, trash, categories/tags screens, public homepage and `/[slug]` pages. Fixed `/setup` redirect and prerendering. |

---

## ⚠️ Known Issues / Blockers

- **Install creates no admin user** — `/api/setup/install` stores `temp_admin_*` options; only `prisma db seed` turns them into a User. A fresh install cannot log in.
- **Hard-coded `AUTH_SECRET` fallback** in `src/auth.config.ts` and `src/lib/env.ts` — sessions are forgeable if the env var is missing in production.
- **`/api/setup/install` is unauthenticated**, writes request values unescaped into `.env`, and runs `npx prisma migrate deploy` from the request. It refuses once `kodpress_installed` is set, but is open on any database without that option.
- **Only SQLite works** — `src/lib/db.ts` builds only the SQLite adapter, and Prisma fixes the provider per schema, so "MySQL primary" (ADR-001-C) needs a decision before release.
- **Session role is baked into the JWT at login** — role changes and deactivated users take effect only after the session expires.
- **Nav shows every screen to every role**; 11 linked admin URLs (media/new, users/new, users/profile, settings sub-pages, menus, widgets, plugins/new) still 404, and 7 screens (media, comments, themes, plugins, users, settings, help) are placeholders.
- **No CI** — run `npm test`, `npx tsc --noEmit`, and `npx next build` before merging to `release`.

---

## 💡 Confirmed User Decisions

| Decision | Value |
|---|---|
| Project name | KodPress |
| Planning location | `kod-press/planning/` |
| Project code location | `kod-press/` (Next.js app lives here) |
| Admin path | `/admin` |
| API path | `/api` |
| Frontend | Root of `app/` directory (not in a route group) |
| Permalink system | Yes — configurable like WP Settings → Permalinks |
| Help/Docs in Admin | Yes — dedicated admin section |
| Database | MySQL primary; SQLite & PostgreSQL also supported |
| Primary keys | Auto-increment integers (WordPress style) |
| Rich text editor | TipTap (extensible, headless) |
| Block editor (Gutenberg-style) | Future — not MVP |
| Multisite | Out of scope |
| i18n | English only for MVP |
