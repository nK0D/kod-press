# Depot — Agent Handoff Guide

> Read this after `README.md` and `CURRENT_STATE.md`. Contains critical conventions, architecture rules, and gotchas for any agent picking up this project.

---

## 🗺️ Where Everything Lives

| What | Path |
|---|---|
| Planning docs | `depot/planning/` |
| High-level project docs | `depot/README.md`, `depot/ARCHITECTURE.md`, `depot/DATABASE_SCHEMA.md` |
| Next.js project root | `depot/` (the app is scaffolded here) |
| App Router root | `depot/src/app/` |
| Admin panel routes | `depot/src/app/admin/` |
| API routes | `depot/src/app/api/` |
| Core libraries | `depot/src/lib/` |
| Plugin system code | `depot/src/lib/hooks.ts` (HookServer) |
| Plugin directory | `depot/plugins/` |
| Themes directory | `depot/themes/` |
| Prisma schema | `depot/prisma/schema.prisma` |
| Config file | `depot/depot.config.ts` |

---

## 🏛️ Architecture Rules (Non-Negotiable)

### App Router Layout (CRITICAL)
```
src/app/
├── layout.tsx                  ← Root FRONTEND layout (NOT in a route group)
├── page.tsx                    ← Frontend homepage
├── [[...slug]]/
│   └── page.tsx                ← Catch-all for ALL permalink routing (frontend)
│
├── setup/                      ← Setup wizard (redirects away if already configured)
│   └── page.tsx
│
├── admin/                      ← ENTIRE admin panel
│   ├── layout.tsx              ← Admin shell (sidebar + topbar, independent of themes)
│   ├── page.tsx                ← Dashboard
│   ├── login/page.tsx          ← Admin login
│   ├── posts/
│   │   ├── page.tsx            ← Post list
│   │   └── [id]/page.tsx       ← Post editor
│   ├── pages/
│   ├── media/
│   ├── comments/
│   ├── taxonomies/
│   ├── menus/
│   ├── users/
│   ├── plugins/
│   ├── themes/
│   ├── settings/
│   │   ├── page.tsx            ← General settings
│   │   ├── permalinks/page.tsx ← Permalink structure config
│   │   ├── reading/page.tsx
│   │   ├── writing/page.tsx
│   │   ├── discussion/page.tsx
│   │   └── media/page.tsx
│   └── help/                   ← Built-in documentation area
│       └── page.tsx
│
└── api/                        ← Public REST API
    ├── auth/[...nextauth]/
    ├── posts/
    ├── media/
    ├── users/
    └── ...
```

### Frontend vs Admin
- The **frontend** (`app/layout.tsx`, `app/page.tsx`, `app/[[...slug]]/`) is controlled by the active theme
- The **admin panel** (`app/admin/`) has its own completely separate layout and is NEVER affected by themes
- Admin always uses Shadcn/UI components and the admin-specific CSS

### Permalink System
- Stored in DB: `options` table — `key="permalink_structure"`, `value="/%year%/%month%/%postname%/"`
- Supported tokens: `%year%`, `%month%`, `%day%`, `%hour%`, `%minute%`, `%second%`, `%post_id%`, `%postname%`, `%category%`, `%author%`
- The `[[...slug]]` catch-all intercepts all non-admin, non-API, non-static requests
- A `PermalinkRouter` class in `lib/routing.ts` does all matching
- Resolution hierarchy: **Page > Post > Category > Tag > Author Archive > 404**
- A `generateLink(post)` helper builds correct URLs from the stored permalink structure
- Cache the permalink setting in memory — it's read on every frontend request

### Plugin Hook System
- `HookServer` is a **singleton** in `src/lib/hooks.ts`
- WordPress-compatible API: `hooks.add_action()`, `hooks.add_filter()`, `hooks.do_action()`, `hooks.apply_filters()`
- Plugins live in `depot/plugins/<plugin-name>/index.ts`
- Plugins are discovered and loaded at **server startup** by scanning the plugins directory
- Plugins CANNOT be hot-reloaded in production — require server restart
- Plugins can: register hooks, add API routes (via a plugin router registry), inject admin UI components, extend the DB schema (via their own Prisma models)

### Theming System
- Themes live in `depot/themes/<theme-name>/`
- Active theme: `options.key = "active_theme"`, `options.value = "default"`
- A `<DepotComponent name="post/Title" />` wrapper resolves theme overrides at runtime
- Core components: `src/components/frontend/` (base, never deleted)
- Theme overrides: `themes/<theme-name>/components/`
- Theme metadata: `themes/<theme-name>/theme.json`
- Admin panel is NEVER affected by themes

---

## 🗄️ Database Rules

- **All PKs** are `Int @id @default(autoincrement())` — no UUIDs anywhere
- Support MySQL, PostgreSQL, SQLite — Prisma handles abstraction
- Follow WordPress table naming convention where possible
- Core tables: `users`, `usermeta`, `posts`, `postmeta`, `terms`, `termmeta`, `term_taxonomy`, `term_relationships`, `comments`, `commentmeta`, `options`, `links`
- Every plugin that needs storage MUST use the meta tables or define its own Prisma model in a separate schema file
- All DB access goes through Prisma — no raw SQL in application code (allowed only in admin reporting/analytics)
- Prisma client singleton: `src/lib/db.ts`

---

## 🔧 Tech Stack (Confirmed)

| Package | Version | Purpose |
|---|---|---|
| `next` | 14+ | Framework |
| `typescript` | 5+ | Language |
| `@prisma/client` + `prisma` | 5+ | ORM |
| `next-auth` | v5 (beta) | Authentication |
| `@shadcn/ui` | latest | Admin UI components |
| `@radix-ui/*` | latest | Accessible primitives |
| `zod` | 3+ | Schema validation |
| `react-hook-form` | 7+ | Admin forms |
| `@tiptap/react` | 2+ | Rich text editor |
| `@tanstack/react-query` | 5+ | Client data fetching |
| `sharp` | latest | Image processing |
| `uploadthing` | latest | File uploads (or local storage adapter) |
| `lucide-react` | latest | Icons for admin |

---

## 📐 Coding Conventions

- **Server Components by default** — add `"use client"` only when necessary
- **Server Actions** for all admin data mutations (no separate API routes for admin operations)
- **API routes** at `app/api/` are for public-facing REST endpoints only
- File naming: `kebab-case` for files, `PascalCase` for components, `camelCase` for utilities
- All admin routes are protected by `middleware.ts` — unauthenticated → redirect to `/admin/login`
- The `/setup` route redirects to `/admin` if the system is already configured (checks `options.key = "depot_installed"`)
- Environment variables: always define in `.env.example`, load via `src/lib/env.ts` (using Zod for validation)
- Error handling: use typed error objects, not string throws

---

## 🚀 Phase 1 Bootstrap Commands

```bash
# Navigate to the parent directory (depot/ exists already with docs)
cd /Users/ankit/Projects/easysocial/depot

# Initialize a package.json first (since depot/ has existing files)
# Then scaffold Next.js manually or use create-next-app with --yes

# OPTION A: Use create-next-app in the existing directory
npx create-next-app@latest . \
  --typescript \
  --no-tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias \
  --no-git \
  --yes

# After scaffolding, manually verify that planning/ and *.md files were not deleted
# Then install additional dependencies:
npm install prisma @prisma/client
npm install next-auth@beta
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react
npm install sharp

# Initialize Prisma
npx prisma init

# Initialize Shadcn/UI
npx shadcn@latest init
```

---

## 🔄 How to Update Planning Docs After Each Session

1. Check off completed tasks in the relevant `phases/PHASE_XX_*.md` file
2. Update the progress bar in `CURRENT_STATE.md`
3. Update the "Next Agent Action" section in `CURRENT_STATE.md`
4. Add a row to the Session Log in `CURRENT_STATE.md`
5. If you discovered anything important, add it to this `HANDOFF_GUIDE.md`

---

## ❓ Open Questions (Confirm With User Before Proceeding)

| # | Question | Current Assumption |
|---|---|---|
| 1 | Self-hosted media or cloud (S3/Uploadthing)? | Self-hosted local first, pluggable later |
| 2 | Email provider for notifications? | SMTP config via admin settings panel |
| 3 | Frontend default theme — Tailwind or CSS Modules? | CSS Modules + CSS vars (theme-switchable) |
| 4 | Block editor (Gutenberg-style) or rich text first? | TipTap rich text for MVP, blocks later |
| 5 | Should `/setup` be a standalone app or part of main? | Part of the main Next.js app |
