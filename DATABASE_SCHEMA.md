# KodPress: Database Schema

This document outlines the proposed initial database schema for KodPress. The design is heavily influenced by the WordPress database schema, prioritizing extensibility through the use of metadata tables.

The schema is defined using a Prisma-like syntax for clarity, but it can be implemented in any of the target SQL databases (MySQL, PostgreSQL, SQLite). All primary keys (`id`) are auto-incrementing integers.

## Core Tables

### `User`

Stores essential user data.

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String   // Hashed password
  username  String   @unique
  role      String   @default("subscriber") // e.g., "admin", "editor", "author"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts     Post[]
  meta      UserMeta[]
}
```

### `UserMeta`

Allows for storing arbitrary additional information about a user, just like `wp_usermeta`.

```prisma
model UserMeta {
  id      Int    @id @default(autoincrement())
  userId  Int
  key     String
  value   String

  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([key])
}
```

### `Post`

Represents any piece of content, such as a blog post, a page, or a custom post type.

```prisma
model Post {
  id          Int       @id @default(autoincrement())
  authorId    Int
  title       String
  slug        String    @unique
  content     String    @db.Text
  status      String    @default("draft") // e.g., "published", "draft", "trash"
  postType    String    @default("post")  // e.g., "post", "page"
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?

  author      User      @relation(fields: [authorId], references: [id])
  meta        PostMeta[]
}
```

### `PostMeta`

Allows for storing arbitrary additional information about a post, such as custom fields, SEO data, etc. This is the equivalent of `wp_postmeta`.

```prisma
model PostMeta {
  id      Int    @id @default(autoincrement())
  postId  Int
  key     String
  value   String @db.Text

  post    Post   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([key])
}
```

## Settings Table

### `Option`

A key-value store for all site-wide settings, similar to `wp_options`. This is a crucial table for storing everything from the site title to the active theme and plugin configurations.

```prisma
model Option {
  id      Int    @id @default(autoincrement())
  key     String @unique
  value   String @db.Text
}
```
**Example `Option` rows:**

| key           | value                  |
| :------------ | :--------------------- |
| `site_title`  | "My Awesome KodPress Site"|
| `active_theme`| "my-theme"             |
| `admin_email` | "admin@example.com"    |


## Schema Philosophy

1.  **Extensibility:** The `UserMeta` and `PostMeta` tables are fundamental. They provide the flexibility for plugins and themes to store custom data without needing to alter the core database schema, which is a key reason for WordPress's success.
2.  **Simplicity:** The initial schema is intentionally simple, focusing on the core content management functionality. More complex features like taxonomies (categories, tags) or comments would be added as new tables in a similar, relational pattern.
3.  **AutoNumber Primary Keys:** As requested, all tables use a standard auto-incrementing integer for the primary key (`id`), ensuring compatibility and predictability, just like the WordPress database schema.
4.  **Relations:** Foreign key constraints are defined to ensure data integrity (e.g., deleting a `User` will also delete their associated `UserMeta`).
