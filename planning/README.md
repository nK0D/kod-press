# 🏗️ Depot — Planning Hub

> **For AI Agents**: This is the single source of truth for the Depot project's planning. Read this file first. Every document in this directory is cross-linked so any agent — in any session — can pick up exactly where the last one left off.

---

## 📌 Project Overview

**Depot** is a modern, open-source CMS built with **Next.js (App Router) + TypeScript** — a WordPress clone that offers everything WordPress has:

- A **web-based setup wizard** (like WordPress's famous 5-minute install)
- A **full Admin panel** at `/admin` (mirrors wp-admin but with a modern custom theme)
- A **Plugin system** with WordPress-style hooks (`add_action` / `add_filter`)
- A **Theming system** for the public frontend (component shadowing + theme.json)
- A **Permalink/routing system** (configurable URL structures — like WordPress Settings → Permalinks)
- Multi-database support: **MySQL, PostgreSQL, SQLite** via Prisma ORM
- **Auto-increment integer PKs** on all tables (WordPress-compatible schema)
- A **Help & Documentation** section built into the Admin panel

---

## 📂 Planning Directory Structure

```
depot/planning/
├── README.md                    ← YOU ARE HERE — master index & handoff guide
├── MASTER_PLAN.md               ← Full phased plan (all phases, all milestones)
├── CURRENT_STATE.md             ← What's done, in progress, and what's next
├── HANDOFF_GUIDE.md             ← Critical context for agent-to-agent handoff
│
├── phases/
│   ├── PHASE_01_FOUNDATION.md   ← Project scaffold, config, setup wizard
│   ├── PHASE_02_DATABASE.md     ← Prisma schema & migrations
│   ├── PHASE_03_AUTH.md         ← Authentication system
│   ├── PHASE_04_ADMIN_CORE.md   ← Admin panel layout & core UI
│   ├── PHASE_05_CONTENT.md      ← Posts, pages, custom post types
│   ├── PHASE_06_MEDIA.md        ← Media library
│   ├── PHASE_07_TAXONOMY.md     ← Categories, tags, custom taxonomies
│   ├── PHASE_08_USERS.md        ← User management & roles
│   ├── PHASE_09_SETTINGS.md     ← Settings & permalink system
│   ├── PHASE_10_THEMING.md      ← Frontend theming system
│   ├── PHASE_11_PLUGINS.md      ← Plugin architecture
│   ├── PHASE_12_COMMENTS.md     ← Comments system
│   ├── PHASE_13_MENUS.md        ← Navigation menus
│   ├── PHASE_14_WIDGETS.md      ← Widgets & sidebars
│   ├── PHASE_15_HELP_DOCS.md    ← Admin Help & Docs area
│   └── PHASE_16_API_REST.md     ← REST API
│
├── architecture/
│   ├── DIRECTORY_STRUCTURE.md   ← Full annotated project directory tree
│   ├── HOOK_SYSTEM.md           ← Plugin hook system design
│   ├── ROUTING_SYSTEM.md        ← Permalink / catch-all routing design
│   ├── THEMING_SYSTEM.md        ← Component shadowing theme design
│   └── DATABASE_DESIGN.md       ← Full Prisma schema (all tables)
│
└── decisions/
    └── ADR_001_TECH_STACK.md    ← Architecture Decision Records
```

---

## 🗺️ Key Paths

| What | Path |
|---|---|
| **Planning docs** | `depot/planning/` |
| **Next.js project root** | `depot/` |
| **High-level docs** | `depot/README.md`, `depot/ARCHITECTURE.md`, `depot/DATABASE_SCHEMA.md` |
| **App router root** | `depot/src/app/` |
| **Admin panel** | `depot/src/app/admin/` |
| **API routes** | `depot/src/app/api/` |
| **Plugin system** | `depot/plugins/` |
| **Themes** | `depot/themes/` |

---

## 🚦 Quick Status

> **Last Updated:** 2026-07-04  
> **Current Phase:** Phase 0 (Planning Complete — Code Not Started)  
> **Next Action:** Bootstrap the Next.js project inside `depot/` — see Phase 1

See `CURRENT_STATE.md` for detailed status.

---

## 🔑 Key Design Decisions (Quick Reference)

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 14+ App Router | SSR/SSG, API routes, file-based routing |
| Language | TypeScript (strict) | Type safety, better DX |
| ORM | Prisma | Multi-DB support, type-safe queries |
| Auth | NextAuth.js v5 (Auth.js) | Flexible, sessions + JWT |
| Admin UI | Shadcn/UI + Radix | Accessible, customizable, modern |
| Frontend Styling | CSS Modules + CSS Variables | Theme-switchable without a build step |
| Plugin System | Custom HookServer singleton | WordPress-compatible mental model |
| DB PKs | Auto-increment Int | WordPress-compatible schema |
| Rich Text Editor | TipTap | Extensible, headless, block-ready |

---

## ⚡ For Any Incoming Agent

1. **Read this file** (done ✓)
2. **Read `CURRENT_STATE.md`** — exact state, what to do next
3. **Read `HANDOFF_GUIDE.md`** — conventions, gotchas, architecture rules
4. **Read the relevant `phases/PHASE_XX_*.md`** for current work
5. **Read relevant `architecture/*.md`** when touching core systems

> ⚠️ **Do NOT start coding without reading `CURRENT_STATE.md` and `HANDOFF_GUIDE.md` first.**
