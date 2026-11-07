# KodPress — Routing System Architecture (Permalink System)

> Detailed design of the configurable permalink system — the equivalent of WordPress Settings → Permalinks.

---

## Overview

WordPress's permalink system lets site admins configure URL structures like `/%year%/%month%/%postname%/` instead of `/?p=123`. KodPress replicates this entirely using Next.js's catch-all routes.

---

## How It Works (End to End)

```
User visits: /2026/07/hello-world
        ↓
middleware.ts → not /admin, not /api → pass through
        ↓
app/[[...slug]]/page.tsx → receives slug = ['2026', '07', 'hello-world']
        ↓
PermalinkRouter.resolveRequest(['2026', '07', 'hello-world'])
        ↓
1. getOption('permalink_structure') → '/%year%/%month%/%postname%/'
2. parseStructure('/%year%/%month%/%postname%/') → [Year, Month, Postname]
3. matchUrl(['2026', '07', 'hello-world'], structure) → { year: '2026', month: '07', slug: 'hello-world' }
4. queryDB: SELECT * FROM posts WHERE slug = 'hello-world' AND type IN ('post', 'page')
5. Found: Post { id: 42, title: 'Hello World', ... }
        ↓
Render PostSingle component with Post data
```

---

## Permalink Tokens

| Token | Replaced With | Example |
|---|---|---|
| `%year%` | 4-digit year of publication | `2026` |
| `%monthnum%` | 2-digit month | `07` |
| `%day%` | 2-digit day | `04` |
| `%hour%` | 2-digit hour (24h) | `14` |
| `%minute%` | 2-digit minute | `30` |
| `%second%` | 2-digit second | `00` |
| `%post_id%` | Numeric post ID | `42` |
| `%postname%` | Post slug | `hello-world` |
| `%category%` | First assigned category slug | `tech` |
| `%author%` | Post author's username | `ankit` |

---

## Preset Permalink Structures

These map to the radio buttons in Admin → Settings → Permalinks:

| Preset | Structure | Example URL |
|---|---|---|
| Plain | `/?p=%post_id%` | `/?p=42` |
| Day and name | `/%year%/%monthnum%/%day%/%postname%/` | `/2026/07/04/hello-world/` |
| Month and name | `/%year%/%monthnum%/%postname%/` | `/2026/07/hello-world/` |
| Numeric | `/archives/%post_id%` | `/archives/42` |
| Post name | `/%postname%/` | `/hello-world/` ← **Default** |
| Custom | *(user-defined)* | Any of the above patterns |

---

## PermalinkRouter Class

```typescript
// src/lib/routing.ts

type TokenType = 
  | 'year' | 'monthnum' | 'day' | 'hour' | 'minute' | 'second'
  | 'post_id' | 'postname' | 'category' | 'author'
  | 'literal';  // fixed string segment

interface Token {
  type: TokenType;
  value?: string;  // for literal tokens
}

interface MatchResult {
  year?: string;
  monthnum?: string;
  day?: string;
  post_id?: string;
  slug?: string;      // from %postname%
  category?: string;
  author?: string;
}

export type ResolvedContent =
  | { type: 'post'; data: Post }
  | { type: 'page'; data: Post }
  | { type: 'category'; data: Term & TermTaxonomy }
  | { type: 'tag'; data: Term & TermTaxonomy }
  | { type: 'author'; data: User }
  | { type: 'home' }
  | { type: 'search'; query: string }
  | null;  // → 404

class PermalinkRouter {
  
  // Parse the stored structure string into tokens
  parseStructure(structure: string): Token[] {
    // e.g. '/%year%/%monthnum%/%postname%/' →
    // [literal('/'), year, literal('/'), monthnum, literal('/'), postname, literal('/')]
  }

  // Match URL segments against the parsed structure
  matchUrl(segments: string[], structure: string): MatchResult | null {
    // Reconstructs the URL and matches it against the pattern
    // Returns extracted named parts, or null if no match
  }

  // Build a URL for a given post from the current permalink structure
  async generateLink(post: Post): Promise<string> {
    const structure = await getOption('permalink_structure') ?? '/%postname%/';
    // Replace each token with the actual post data
    // %category% = first category slug of the post
    // %author% = author's login/username
  }

  // Main request resolution — hits the DB
  async resolveRequest(segments: string[]): Promise<ResolvedContent> {
    const structure = await getOption('permalink_structure') ?? '/%postname%/';
    
    // 1. Try to match as plain (?p=ID) — legacy/fallback
    // 2. Try to match as standard permalink structure
    // 3. Try hierarchy: Page → Post → Category → Tag → Author → null (404)
  }
}

export const permalinkRouter = new PermalinkRouter();
```

---

## Resolution Hierarchy

When a URL matches, KodPress tries to find content in this order:

1. **Page** — look up `posts` table where `type='page'` AND `slug` matches the last segment
2. **Post** — look up `posts` table where `type='post'` AND `slug` matches AND date fields match (if present)
3. **Category** — look up `term_taxonomy` where `taxonomy='category'` AND `terms.slug` matches
4. **Tag** — look up `term_taxonomy` where `taxonomy='post_tag'` AND `terms.slug` matches
5. **Author** — look up `users` where `login` or `nicename` matches
6. **null** — render 404

### Special Cases
- `/` (root) → home (blog index or static page, per Reading Settings)
- `/?s=query` → search results
- `/feed` → RSS feed (future feature)

---

## Catch-All Route Implementation

```typescript
// src/app/[[...slug]]/page.tsx

import { permalinkRouter } from '@/lib/routing';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug?: string[] };
  searchParams: { s?: string; p?: string };
}

export default async function FrontendCatchAll({ params, searchParams }: Props) {
  const segments = params.slug ?? [];

  // Handle search
  if (searchParams.s) {
    return <SearchResults query={searchParams.s} />;
  }

  // Handle plain ?p=ID permalinks
  if (searchParams.p) {
    const post = await getPostById(parseInt(searchParams.p));
    if (!post) notFound();
    return <PostSingle post={post} />;
  }

  const resolved = await permalinkRouter.resolveRequest(segments);

  if (!resolved) notFound();

  switch (resolved.type) {
    case 'post':     return <PostSingle post={resolved.data} />;
    case 'page':     return <PageSingle page={resolved.data} />;
    case 'category': return <TermArchive term={resolved.data} type="category" />;
    case 'tag':      return <TermArchive term={resolved.data} type="tag" />;
    case 'author':   return <AuthorArchive author={resolved.data} />;
    case 'home':     return <HomePage />;
    default:         notFound();
  }
}
```

---

## Performance Considerations

1. **Cache the permalink structure** in memory (it changes rarely, only on settings save):
   ```typescript
   let cachedPermalink: string | null = null;
   async function getPermalink(): Promise<string> {
     if (cachedPermalink) return cachedPermalink;
     cachedPermalink = await getOption('permalink_structure') ?? '/%postname%/';
     return cachedPermalink;
   }
   // Invalidate: cachedPermalink = null; when settings are saved
   ```
2. **DB queries must be indexed**: `posts.slug` has a unique index, `posts.type` is indexed
3. **generateLink should also be cached** per post ID if called many times on archive pages
4. **Next.js ISR** (Incremental Static Regeneration) can be used for high-traffic posts

---

## Admin Settings Page

The permalink settings page at `/admin/settings/permalinks` stores the structure to the DB:

```typescript
// Server Action
async function savePermalinks(formData: FormData) {
  'use server';
  const preset = formData.get('preset') as string;
  const custom = formData.get('custom_structure') as string;
  
  let structure = preset === 'custom' ? custom : preset;
  await setOption('permalink_structure', structure);
  
  // Invalidate the in-memory cache
  invalidatePermalinkCache();
  
  revalidatePath('/'); // revalidate frontend pages
}
```

The category_base and tag_base prefixes are stored separately:
- `option.key = "category_base"` → default: `category`
- `option.key = "tag_base"` → default: `tag`

So category URLs look like `/category/tech/` and tag URLs like `/tag/javascript/`.
