# Phase 2: Database Schema

**Status**: 🔴 NOT STARTED  
**Depends on**: Phase 1 (Next.js project bootstrapped, Prisma initialized)  
**Estimated Sessions**: 1  
**Owner**: Agent following Phase 1

---

## Goal

Expand the minimal Prisma schema from Phase 1 (just `Option`) into the full WordPress-equivalent database schema. All tables use auto-increment integer PKs.

---

## Task Checklist

### 2.1 — Full Prisma Schema
- [ ] Replace `prisma/schema.prisma` with the complete schema (see design below)
- [ ] All models must use `Int @id @default(autoincrement())`
- [ ] Multi-provider support:
  ```prisma
  datasource db {
    provider = env("DATABASE_PROVIDER") // "sqlite" | "mysql" | "postgresql"
    url      = env("DATABASE_URL")
  }
  ```

### 2.2 — Core Tables to Implement

#### Users & User Meta
```prisma
model User {
  id           Int        @id @default(autoincrement())
  login        String     @unique
  password     String
  nicename     String
  email        String     @unique
  url          String     @default("")
  registered   DateTime   @default(now())
  status       Int        @default(0)
  displayName  String
  
  posts        Post[]
  comments     Comment[]
  meta         UserMeta[]
}

model UserMeta {
  id      Int    @id @default(autoincrement())
  userId  Int
  key     String
  value   String @db.Text
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@index([key])
}
```

#### Posts & Post Meta
```prisma
model Post {
  id              Int        @id @default(autoincrement())
  authorId        Int
  date            DateTime   @default(now())
  dateGmt         DateTime   @default(now())
  content         String     @db.Text
  title           String
  excerpt         String     @db.Text @default("")
  status          String     @default("draft")  // publish, draft, pending, private, trash, auto-draft, inherit
  commentStatus   String     @default("open")
  pingStatus      String     @default("open")
  password        String     @default("")
  slug            String     @unique
  modified        DateTime   @updatedAt
  modifiedGmt     DateTime   @updatedAt
  parent          Int        @default(0)
  guid            String     @default("")
  menuOrder       Int        @default(0)
  type            String     @default("post")   // post, page, attachment, revision, nav_menu_item
  mimeType        String     @default("")
  commentCount    Int        @default(0)
  
  author          User       @relation(fields: [authorId], references: [id])
  meta            PostMeta[]
  termRelationships TermRelationship[]
  comments        Comment[]
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
```

#### Taxonomies
```prisma
model Term {
  id        Int        @id @default(autoincrement())
  name      String
  slug      String     @unique
  termGroup Int        @default(0)
  
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
  id          Int        @id @default(autoincrement())
  termId      Int
  taxonomy    String     // category, post_tag, nav_menu, link_category, post_format
  description String     @db.Text @default("")
  parent      Int        @default(0)
  count       Int        @default(0)
  
  term        Term       @relation(fields: [termId], references: [id], onDelete: Cascade)
  relationships TermRelationship[]
  @@unique([termId, taxonomy])
  @@index([taxonomy])
}

model TermRelationship {
  objectId       Int
  termTaxonomyId Int
  termOrder      Int     @default(0)
  
  post           Post          @relation(fields: [objectId], references: [id], onDelete: Cascade)
  termTaxonomy   TermTaxonomy  @relation(fields: [termTaxonomyId], references: [id], onDelete: Cascade)
  @@id([objectId, termTaxonomyId])
  @@index([termTaxonomyId])
}
```

#### Comments
```prisma
model Comment {
  id             Int         @id @default(autoincrement())
  postId         Int
  authorName     String      @default("")
  authorEmail    String      @default("")
  authorUrl      String      @default("")
  authorIP       String      @default("")
  date           DateTime    @default(now())
  dateGmt        DateTime    @default(now())
  content        String      @db.Text
  karma          Int         @default(0)
  approved       String      @default("1")  // 1, 0, spam, trash
  agent          String      @default("")
  type           String      @default("comment")
  parent         Int         @default(0)
  userId         Int         @default(0)
  
  post           Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  user           User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  meta           CommentMeta[]
  @@index([postId])
  @@index([approved])
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
```

#### Options
```prisma
model Option {
  id        Int    @id @default(autoincrement())
  key       String @unique
  value     String @db.Text
  autoload  String @default("yes")
}
```

#### Links (Blogroll)
```prisma
model Link {
  id          Int      @id @default(autoincrement())
  url         String   @default("")
  name        String   @default("")
  image       String   @default("")
  target      String   @default("")
  description String   @default("")
  visible     String   @default("Y")
  userId      Int      @default(0)
  rating      Int      @default(0)
  updated     DateTime @default(now())
  rel         String   @default("")
  notes       String   @db.Text @default("")
  rss         String   @default("")
}
```

### 2.3 — Database Seeder
- [ ] Create `prisma/seed.ts`
- [ ] Seeds:
  - Default options: `siteurl`, `blogname`, `blogdescription`, `admin_email`, `permalink_structure`, `active_theme`, `active_plugins`, `kodpress_version`, `kodpress_installed`
  - Default categories: "Uncategorized" (term + term_taxonomy)
  - Admin user (from setup wizard — seed just creates the skeleton if not done via wizard)

### 2.4 — Migration
- [ ] Run `npx prisma migrate dev --name full-schema`
- [ ] Verify all tables created correctly in SQLite dev DB
- [ ] Test with MySQL (optional in dev — just document the command)

### 2.5 — DB Helper Utilities
- [ ] `src/lib/options.ts` — helper functions for the options table:
  ```typescript
  getOption(key: string): Promise<string | null>
  setOption(key: string, value: string): Promise<void>
  deleteOption(key: string): Promise<void>
  ```
  - Cache options in memory (use a Map, invalidate on write)

---

## Definition of Done

- [ ] `npx prisma db push` or `npx prisma migrate dev` runs without errors
- [ ] Prisma Studio (`npx prisma studio`) shows all tables with correct columns
- [ ] Seeder runs: `npx prisma db seed`
- [ ] `getOption()` and `setOption()` work correctly
- [ ] `planning/CURRENT_STATE.md` updated

---

## Notes for Next Agent

After Phase 2, proceed to **Phase 3: Authentication**.  
The DB is the foundation — don't rush the schema. Getting it right now saves pain later.  
The `Option` table is the most-used table in the entire system — the caching layer in `lib/options.ts` is critical for performance.
