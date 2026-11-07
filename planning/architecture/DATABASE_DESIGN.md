# KodPress — Complete Database Design

> Full Prisma schema for all core tables. This is the definitive reference for Phase 2 implementation.

---

## Schema Configuration

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = env("DATABASE_PROVIDER")  // "sqlite" | "mysql" | "postgresql"
  url      = env("DATABASE_URL")
}
```

**Development**: Use SQLite (`DATABASE_PROVIDER="sqlite"`, `DATABASE_URL="file:./dev.db"`)  
**Production**: MySQL or PostgreSQL

---

## All Models

```prisma
// ─── USERS ───────────────────────────────────────────────────────────

model User {
  id          Int       @id @default(autoincrement())
  login       String    @unique          // username for login
  password    String                     // bcrypt hash
  nicename    String                     // URL-friendly version of display name
  email       String    @unique
  url         String    @default("")
  registered  DateTime  @default(now())
  status      Int       @default(0)      // 0=active, 1=spam, 2=deleted
  displayName String

  posts       Post[]
  comments    Comment[]
  meta        UserMeta[]

  @@index([email])
  @@index([login])
}

model UserMeta {
  id     Int    @id @default(autoincrement())
  userId Int
  key    String
  value  String @db.Text

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([key])
}

// ─── POSTS ───────────────────────────────────────────────────────────
// Stores: posts, pages, attachments, revisions, nav_menu_items

model Post {
  id            Int       @id @default(autoincrement())
  authorId      Int
  date          DateTime  @default(now())
  dateGmt       DateTime  @default(now())
  content       String    @db.Text
  title         String
  excerpt       String    @db.Text        @default("")
  status        String    @default("draft")
  // publish | draft | pending | private | trash | auto-draft | inherit | future
  commentStatus String    @default("open")    // open | closed
  pingStatus    String    @default("open")    // open | closed
  password      String    @default("")        // for password-protected posts
  slug          String    @unique
  modified      DateTime  @updatedAt
  modifiedGmt   DateTime  @updatedAt
  parent        Int       @default(0)          // parent post ID (for pages hierarchy, revisions)
  guid          String    @default("")         // permanent link / file URL for attachments
  menuOrder     Int       @default(0)
  type          String    @default("post")
  // post | page | attachment | revision | nav_menu_item | custom_post_type
  mimeType      String    @default("")         // for attachments: image/jpeg, etc.
  commentCount  Int       @default(0)

  author        User      @relation(fields: [authorId], references: [id])
  meta          PostMeta[]
  comments      Comment[]
  termRelationships TermRelationship[]

  @@index([authorId])
  @@index([status])
  @@index([type])
  @@index([parent])
  @@index([date])
}

model PostMeta {
  id     Int    @id @default(autoincrement())
  postId Int
  key    String
  value  String @db.Text

  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([key])
}

// ─── TERMS (categories, tags, menus, etc.) ────────────────────────────

model Term {
  id        Int       @id @default(autoincrement())
  name      String
  slug      String    @unique
  termGroup Int       @default(0)

  meta      TermMeta[]
  taxonomies TermTaxonomy[]
}

model TermMeta {
  id     Int    @id @default(autoincrement())
  termId Int
  key    String
  value  String @db.Text

  term   Term   @relation(fields: [termId], references: [id], onDelete: Cascade)

  @@index([termId])
  @@index([key])
}

model TermTaxonomy {
  id          Int    @id @default(autoincrement())
  termId      Int
  taxonomy    String                // category | post_tag | nav_menu | link_category | post_format
  description String @db.Text      @default("")
  parent      Int    @default(0)   // for hierarchical taxonomies (category parent ID)
  count       Int    @default(0)   // post count cache

  term        Term   @relation(fields: [termId], references: [id], onDelete: Cascade)
  relationships TermRelationship[]

  @@unique([termId, taxonomy])
  @@index([taxonomy])
  @@index([parent])
}

model TermRelationship {
  objectId       Int   // the post ID
  termTaxonomyId Int
  termOrder      Int   @default(0)

  post           Post          @relation(fields: [objectId], references: [id], onDelete: Cascade)
  termTaxonomy   TermTaxonomy  @relation(fields: [termTaxonomyId], references: [id], onDelete: Cascade)

  @@id([objectId, termTaxonomyId])
  @@index([termTaxonomyId])
}

// ─── COMMENTS ─────────────────────────────────────────────────────────

model Comment {
  id          Int       @id @default(autoincrement())
  postId      Int
  authorName  String    @default("")
  authorEmail String    @default("")
  authorUrl   String    @default("")
  authorIP    String    @default("")
  date        DateTime  @default(now())
  dateGmt     DateTime  @default(now())
  content     String    @db.Text
  karma       Int       @default(0)
  approved    String    @default("1")  // 1=approved | 0=pending | spam | trash
  agent       String    @default("")   // user agent string
  type        String    @default("comment")  // comment | pingback | trackback
  parent      Int       @default(0)          // for threaded comments
  userId      Int       @default(0)          // 0 = guest commenter

  post        Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  meta        CommentMeta[]

  @@index([postId])
  @@index([approved])
  @@index([parent])
  @@index([userId])
}

model CommentMeta {
  id        Int     @id @default(autoincrement())
  commentId Int
  key       String
  value     String  @db.Text

  comment   Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@index([commentId])
  @@index([key])
}

// ─── OPTIONS ──────────────────────────────────────────────────────────

model Option {
  id       Int    @id @default(autoincrement())
  key      String @unique
  value    String @db.Text
  autoload String @default("yes")  // yes = load on every request; no = on-demand
}

// ─── LINKS (Blogroll) ─────────────────────────────────────────────────

model Link {
  id          Int      @id @default(autoincrement())
  url         String   @default("")
  name        String   @default("")
  image       String   @default("")
  target      String   @default("")    // _blank | _top | ""
  description String   @default("")
  visible     String   @default("Y")  // Y | N
  userId      Int      @default(0)
  rating      Int      @default(0)    // 0–10
  updated     DateTime @default(now())
  rel         String   @default("")   // XFN relationship
  notes       String   @db.Text       @default("")
  rss         String   @default("")
}
```

---

## Seed Data

```typescript
// prisma/seed.ts

const defaultOptions = [
  { key: 'siteurl',                   value: 'http://localhost:3000' },
  { key: 'blogname',                  value: 'My KodPress Site' },
  { key: 'blogdescription',           value: 'Just another KodPress site' },
  { key: 'admin_email',               value: 'admin@example.com' },
  { key: 'permalink_structure',       value: '/%postname%/' },
  { key: 'category_base',             value: 'category' },
  { key: 'tag_base',                  value: 'tag' },
  { key: 'active_theme',              value: 'kodpress-default' },
  { key: 'active_plugins',            value: '[]' },
  { key: 'posts_per_page',            value: '10' },
  { key: 'date_format',               value: 'MMMM d, yyyy' },
  { key: 'time_format',               value: 'h:mm a' },
  { key: 'timezone_string',           value: 'UTC' },
  { key: 'default_category',          value: '1' },
  { key: 'default_comment_status',    value: 'open' },
  { key: 'show_avatars',              value: '1' },
  { key: 'avatar_default',            value: 'mystery' },
  { key: 'comment_moderation',        value: '0' },
  { key: 'show_on_front',             value: 'posts' }, // posts | page
  { key: 'kodpress_version',             value: '1.0.0' },
  { key: 'kodpress_installed',           value: 'true' },
];

const defaultCategory = {
  term: { name: 'Uncategorized', slug: 'uncategorized' },
  taxonomy: { taxonomy: 'category', description: '', parent: 0 }
};
```

---

## Key PostMeta Reserved Keys

These are PostMeta keys used internally by KodPress core (same as WordPress's convention):

| Key | Description |
|---|---|
| `_thumbnail_id` | ID of the featured image attachment |
| `_edit_lock` | Concurrent editing lock info |
| `_edit_last` | User ID of last editor |
| `_wp_attachment_metadata` | JSON of image sizes/dimensions (attachments only) |
| `_wp_attached_file` | Relative path of the file (attachments only) |
| `_wp_page_template` | Page template filename |
| `_kodpress_revision_parent` | Parent post ID (for revisions) |

---

## Key UserMeta Reserved Keys

| Key | Description |
|---|---|
| `capabilities` | JSON: `{"administrator": true}` |
| `user_level` | Role level integer |
| `admin_color` | Admin color scheme preference |
| `show_welcome_panel` | `1` or `0` |
| `admin_dark_mode` | `1` or `0` |
| `session_tokens` | Active session tokens |
| `password_reset_key` | Temp key for password reset |

---

## Multi-Database Notes

- **SQLite**: Use for development. Does not support `@db.Text` in the same way — Prisma handles this transparently. Does not support concurrent writes well — not for production.
- **MySQL**: Production default. Requires `@db.Text` for long text fields. Use `utf8mb4` charset.
- **PostgreSQL**: Production alternative. `@db.Text` works natively. UUID primary keys are possible but NOT used in KodPress (we use autoincrement).

To switch databases, only `DATABASE_PROVIDER` and `DATABASE_URL` env vars need to change. The Prisma schema auto-adapts.
