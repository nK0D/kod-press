# ADR-001: Technology Stack Decisions

**Status**: ACCEPTED  
**Date**: 2026-07-04  
**Deciders**: Project Owner (Ankit)

---

## Context

KodPress is a WordPress clone built on modern web technologies. Every major technology choice here was deliberate and confirmed by the project owner.

---

## Decisions

### ADR-001-A: Next.js 14+ with App Router

**Decision**: Use Next.js with the App Router (not Pages Router).

**Rationale**:
- App Router enables Server Components by default — better performance, less client JS
- Server Actions replace the need for separate admin API routes
- The file-based routing system (`[[...slug]]`) directly enables the permalink system
- Layouts (`layout.tsx`) make the admin/frontend separation clean and idiomatic

**Rejected alternatives**:
- Remix — good but smaller ecosystem, less familiar
- Pages Router — older pattern, less composable layouts
- SvelteKit — TypeScript support is excellent but React ecosystem is better for admin UI component libraries

---

### ADR-001-B: TypeScript in Strict Mode

**Decision**: TypeScript with `strict: true` in `tsconfig.json`.

**Rationale**:
- WordPress's lack of type safety is a source of many bugs
- Prisma generates fully-typed query results
- NextAuth v5 has strong TypeScript support
- The plugin hook system benefits from typed callbacks

---

### ADR-001-C: Prisma as the ORM

**Decision**: Use Prisma for all database access.

**Rationale**:
- Multi-database support (MySQL, PostgreSQL, SQLite) out of the box — just change the provider
- Generated TypeScript types from the schema
- Prisma Migrate for repeatable schema changes
- Prisma Studio for database inspection during development
- The meta-table pattern (PostMeta, UserMeta) works well with Prisma's `findMany` API

**Rejected alternatives**:
- Drizzle ORM — excellent performance and type safety but multi-DB is newer/less stable
- Knex — raw SQL builder, no type safety
- TypeORM — heavier, more complex, decorator-based

---

### ADR-001-D: NextAuth.js v5 (Auth.js)

**Decision**: Use NextAuth.js v5 (also called Auth.js) for authentication.

**Rationale**:
- Edge middleware compatible (JWT sessions)
- Credentials provider supports username+password login
- Session automatically available in Server Components via `auth()`
- Well-maintained, widely adopted

**Rejected alternatives**:
- Custom JWT implementation — more control but more work and security risk
- Lucia Auth — good but smaller community
- Clerk — hosted/cloud-based, not self-hostable

---

### ADR-001-E: Shadcn/UI for Admin Panel

**Decision**: Use Shadcn/UI as the component base for the admin panel.

**Rationale**:
- Components are copied into the project (not a dependency) — full control over styles
- Built on Radix UI primitives — fully accessible
- CSS variables based — easy to theme the admin
- Looks professional and modern out of the box

**Rejected alternatives**:
- Material UI — too opinionated, hard to brand
- Chakra UI — heavier runtime
- Headless UI — less complete than Radix

---

### ADR-001-F: CSS Modules + CSS Variables for Frontend Themes

**Decision**: The frontend theming system uses CSS Modules and CSS custom properties (variables).

**Rationale**:
- Themes can change the entire visual appearance by overriding CSS variables
- No build step required to switch themes
- Works alongside component shadowing
- Tailwind CSS was NOT chosen because Tailwind's JIT compilation makes it hard for external themes to add styles without rebuilding

**Note**: The admin panel uses Tailwind (via Shadcn/UI), but the **frontend** does NOT use Tailwind.

---

### ADR-001-G: TipTap for Rich Text Editing

**Decision**: Use TipTap as the rich text editor for post/page content.

**Rationale**:
- Headless — renders whatever HTML we want
- Extensible — plugins can add custom blocks/marks
- Based on ProseMirror — the most mature rich text framework
- Supports collaborative editing (future feature)
- Content is stored as HTML (compatible with WordPress's content format)

**Rejected alternatives**:
- Quill — older, less maintained
- Draft.js — React-only, Facebook's internal state, complex API
- Slate.js — very flexible but too low-level for our needs
- Lexical — Meta's newer editor, good but less ecosystem

**Future**: Add a Gutenberg-compatible block editor system as an optional Phase 17+

---

### ADR-001-H: Auto-Increment Integer PKs

**Decision**: All primary keys are `Int @id @default(autoincrement())`.

**Rationale**: Explicitly requested by project owner for WordPress schema compatibility. WordPress uses auto-increment integers on all tables.

**Note**: This means UUIDs are NOT used anywhere in the schema, even though they would be more distributed-system friendly.

---

### ADR-001-I: Plugin Discovery via Filesystem Scan

**Decision**: Plugins are discovered by scanning the `plugins/` directory at server startup.

**Rationale**:
- Familiar model for WordPress developers
- Simple — no plugin registry file to maintain
- Active plugins list stored in `options.active_plugins` (JSON array)

**Tradeoff**: Cannot hot-reload plugins in production — server restart required. This is acceptable and matches WordPress's behavior.

---

## Non-Decisions (Deferred)

| Topic | Deferred Because |
|---|---|
| Block editor (Gutenberg) | Post-MVP — Phase 17+ |
| Multisite | Out of scope entirely |
| i18n/l10n | English only for MVP |
| Email provider | Pluggable SMTP via settings — no hard decision |
| Cloud file storage | Local first, S3/Cloudflare adapter as plugin later |
| Search engine | DB-based search for MVP, Elasticsearch/Typesense as plugin later |
| WebSockets (live updates) | Not needed for MVP |
