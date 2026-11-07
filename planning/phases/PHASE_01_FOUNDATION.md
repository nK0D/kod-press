# Phase 1: Foundation & Setup Wizard

**Status**: 🔴 NOT STARTED  
**Depends on**: Nothing — this is the start  
**Estimated Sessions**: 1–2  
**Owner**: First agent to pick up this project

---

## Goal

Bootstrap the Next.js application inside `kod-press/` and build the web-based setup wizard — the equivalent of WordPress's "Famous 5-Minute Install".

---

## Task Checklist

### 1.1 — Scaffold Next.js Project
- [ ] Verify `kod-press/` already has: `README.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `planning/`
- [ ] Run `create-next-app` inside `kod-press/` with the correct flags (see HANDOFF_GUIDE.md)
- [ ] Confirm existing `.md` files and `planning/` were NOT overwritten
- [ ] Remove default Next.js boilerplate (default styles, images, example pages)
- [ ] Enable TypeScript strict mode in `tsconfig.json`
- [ ] Set up path aliases in `tsconfig.json` (`@/*` → `./src/*`)

### 1.2 — Install Core Dependencies
- [ ] `prisma` + `@prisma/client`
- [ ] `next-auth@beta` (v5)
- [ ] `zod`
- [ ] `react-hook-form` + `@hookform/resolvers`
- [ ] `bcryptjs` + `@types/bcryptjs`
- [ ] `lucide-react`
- [ ] `sharp`
- [ ] Shadcn/UI (`npx shadcn@latest init`)
  - [ ] Select: New York style, CSS variables, slate base color
  - [ ] Add components: button, input, label, card, form, select, dialog, toast, dropdown-menu, separator, sheet, badge

### 1.3 — Initialize Prisma
- [ ] `npx prisma init --datasource-provider sqlite` (SQLite for dev, easy to switch later)
- [ ] Create initial minimal schema in `prisma/schema.prisma`:
  - `Option` table only (needed for setup wizard to write `kodpress_installed`)
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Create Prisma singleton: `src/lib/db.ts`

### 1.4 — Environment Configuration
- [ ] Create `.env.example` with all required variables
- [ ] Create `src/lib/env.ts` — Zod schema for validating environment variables at startup
- [ ] Required env vars:
  - `DATABASE_URL`
  - `AUTH_SECRET` (for NextAuth)
  - `NEXTAUTH_URL`
  - `KODPRESS_UPLOAD_DIR` (path for file uploads)

### 1.5 — KodPress Config File
- [ ] Create `kodpress.config.ts` at project root
- [ ] Config options: `name`, `version`, `uploadDir`, `pluginsDir`, `themesDir`

### 1.6 — HookServer Singleton (Stub)
- [ ] Create `src/lib/hooks.ts`
- [ ] Implement the full `HookServer` class (even if no plugins use it yet):
  ```typescript
  class HookServer {
    add_action(name, callback, priority?)
    add_filter(name, callback, priority?)
    do_action(name, ...args): Promise<void>
    apply_filters(name, value, ...args): Promise<any>
    remove_action(name, callback)
    remove_filter(name, callback)
    has_action(name): boolean
    has_filter(name): boolean
  }
  export const hooks = new HookServer();
  ```

### 1.7 — Middleware
- [ ] Create `src/middleware.ts`
- [ ] Rules:
  - `GET /setup` → if `kodpress_installed` option exists in DB, redirect to `/admin`
  - `GET /admin/*` (except `/admin/login`) → if not authenticated, redirect to `/admin/login`
  - Everything else → pass through
- [ ] Handle edge case: if DB is not yet configured (setup not run), allow `/setup`

### 1.8 — Setup Wizard (`/setup`)
- [ ] Multi-step wizard UI (beautiful, not plain)
- [ ] **Step 1: Welcome** — KodPress logo, "Let's get started" message, language selector (just English for now), "Let's Go" button
- [ ] **Step 2: Database Configuration**
  - DB type selector: MySQL / PostgreSQL / SQLite
  - Fields: Host, Port, Database Name, Username, Password
  - "Test Connection" button (calls `POST /api/setup/test-db`)
  - Save & Continue
- [ ] **Step 3: Site Information**
  - Site Title, Site URL, Admin Email, Tagline
- [ ] **Step 4: Create Admin Account**
  - Username, Email, Password, Confirm Password
  - Password strength indicator
- [ ] **Step 5: Installation Complete**
  - Success animation
  - "Log In" button → `/admin/login`
- [ ] Wizard state: stored in React state (not URL params) — users can't skip steps
- [ ] On completion:
  - Run all Prisma migrations
  - Seed default options
  - Create the admin user
  - Write `kodpress_installed = "true"` to `options`

### 1.9 — API Routes for Setup
- [ ] `POST /api/setup/test-db` — tests DB connection with provided credentials
- [ ] `POST /api/setup/install` — runs migrations, seeds data, creates admin user
- [ ] Both routes check if already installed (return 403 if so)

### 1.10 — Basic Layout Files
- [ ] `src/app/layout.tsx` — root frontend layout (minimal, just `<html>` and `<body>`)
- [ ] `src/app/page.tsx` — temporary placeholder "Coming Soon" page
- [ ] `src/app/admin/layout.tsx` — admin shell layout (stub — full implementation in Phase 4)
- [ ] `src/app/admin/page.tsx` — placeholder dashboard

---

## Definition of Done

- [ ] `npm run dev` starts without errors
- [ ] Visiting `/setup` shows the wizard
- [ ] Completing the wizard creates the DB, admin user, and redirects to `/admin/login`
- [ ] Visiting `/admin` without login redirects to `/admin/login`
- [ ] Visiting `/setup` after installation redirects to `/admin`
- [ ] `planning/CURRENT_STATE.md` updated to mark Phase 1 complete

---

## Files Created in This Phase

```
kod-press/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── setup/
│   │   │   ├── page.tsx
│   │   │   └── steps/
│   │   │       ├── Welcome.tsx
│   │   │       ├── DatabaseConfig.tsx
│   │   │       ├── SiteInfo.tsx
│   │   │       ├── AdminAccount.tsx
│   │   │       └── Complete.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── setup/
│   │           ├── test-db/route.ts
│   │           └── install/route.ts
│   ├── lib/
│   │   ├── db.ts
│   │   ├── env.ts
│   │   └── hooks.ts
│   └── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── kodpress.config.ts
├── .env.example
└── .env
```

---

## Notes for Next Agent

After Phase 1 is done, proceed to **Phase 2: Database Schema**.
The Phase 2 work involves expanding the minimal Prisma schema (currently just `Option`) into the full WordPress-equivalent schema.
