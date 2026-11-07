# Phase 5: Content Management — Posts & Pages

**Status**: 🟡 CORE DONE (2026-11-07) — leftovers marked below  
**Depends on**: Phase 4 (admin shell), Phase 2 (Post schema)  
**Estimated Sessions**: 3  

---

## Goal

Full CRUD for posts and pages including a rich TipTap editor, status management, slug generation, featured images, categories/tags, revisions, and trash.

---

## Task Checklist

### 5.1 — Post List Page (`/admin/posts`)
- [x] Server Component that fetches posts with filters
- [x] URL-based filters: `?status=draft|publish|trash`, `?category=`, `?author=`, `?search=`, `?page=`
- [x] Table columns: Title (with inline actions), Author, Categories, Tags, Status, Date
- [ ] Inline quick actions under title: Edit | Quick Edit | Trash | View
- [ ] Quick Edit: inline form for title, slug, date, status, categories, tags — no full page reload
- [x] Bulk actions: Delete Permanently, Move to Trash, Publish, Set as Draft
- [x] Filter bar: All | Published | Drafts | Pending | Trash (with counts)
- [ ] Post count in sidebar badge

### 5.2 — Post Editor (`/admin/posts/new` and `/admin/posts/[id]`)
- [ ] **Main content area** (left/center, ~70% width):
  - Title field (large, placeholder "Add title")
  - Permalink display (slug, editable inline)
  - TipTap rich text editor:
    - Toolbar: Bold, Italic, Underline, Strike, H1-H4, Blockquote, Code, Code Block, Bullet List, Ordered List, Link, Image, Undo, Redo
    - Full-screen mode
    - Word count in footer
  - Excerpt field (collapsible panel)
  - Discussion panel (allow comments on/off, allow pings on/off)
  - Revisions panel (list of saved revisions with restore button)

- [ ] **Sidebar** (right, ~30% width):
  - **Publish panel**: Status dropdown (Draft/Pending/Published/Private), Visibility (Public/Password Protected/Private), Publish date picker, "Publish"/"Update" button, "Save Draft" button, "Preview" button (opens new tab), "Move to Trash"
  - **Categories panel**: Checklist + "Add New Category" inline
  - **Tags panel**: Tag input with autocomplete + tag list
  - **Featured Image panel**: Upload or select from media library

### 5.3 — TipTap Editor Setup
- [x] Install: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-character-count`
- [x] `src/components/admin/editor/RichTextEditor.tsx` — main editor component
- [x] `src/components/admin/editor/EditorToolbar.tsx` — toolbar component
- [x] Save content as HTML to `post.content` in DB

### 5.4 — Auto Slug Generation
- [x] `src/lib/slug.ts`:
  - `generateSlug(title: string): string` — kebab-case, removes special chars
  - `ensureUniqueSlug(slug: string, excludeId?: number): Promise<string>` — appends `-2`, `-3` etc. if slug exists

### 5.5 — Server Actions (Post Mutations)
- [x] `src/app/admin/posts/actions.ts`:
  - `createPost(data)` — creates post, fires `post.created` action
  - `updatePost(id, data)` — updates post, creates revision, fires `post.updated`
  - `publishPost(id)` — sets status to `publish`, fires `post.published`
  - `trashPost(id)` — sets status to `trash`
  - `deletePost(id)` — permanently deletes (only from trash)
  - `restorePost(id)` — restores from trash

### 5.6 — Revisions
- [x] Revision = a Post record with `type = "revision"`, `parent = original_post_id`
- [x] Save revision on every publish/update (limit to 10 most recent per post)
- [x] Revision list in editor sidebar: show date + author + "Restore" button
- [x] `restoreRevision(revisionId, postId)` server action

### 5.7 — Pages
- [x] Reuse 90% of the post editor for pages
- [x] Differences: no categories, no tags, has "Page Attributes" panel (parent page, template, order)
- [x] `src/app/admin/pages/page.tsx` (list)
- [x] `src/app/admin/pages/[id]/page.tsx` (editor)

### 5.8 — Custom Post Types API
- [x] `src/lib/post-types.ts`:
  ```typescript
  registerPostType(name: string, options: PostTypeOptions): void
  getPostType(name: string): PostTypeDefinition | null
  getAllPostTypes(): PostTypeDefinition[]
  ```
- [ ] PostTypeOptions: `label`, `singular`, `icon`, `supports` (title, editor, thumbnail, excerpt, revisions, page-attributes), `taxonomies`, `public`, `showInMenu`
- [ ] Built-in types: `post`, `page`, `attachment`, `revision`, `nav_menu_item`

### 5.9 — Hook Integration
- [x] Fire hooks at key moments:
  - `hooks.do_action('post.creating', data)` — before create
  - `hooks.do_action('post.created', post)` — after create
  - `hooks.do_action('post.published', post)` — when status → publish
  - `hooks.apply_filters('post.content', content, post)` — before rendering content
  - `hooks.apply_filters('post.title', title, post)` — before rendering title

---

## Definition of Done

- [ ] Can create a post with title, content, categories, tags, featured image
- [x] Slug is auto-generated from title and is editable
- [x] Post can be saved as draft or published
- [x] Published posts appear on the frontend (even with placeholder theme)
- [x] Revisions are saved and can be restored
- [x] Trashed posts appear in Trash view, can be permanently deleted
- [ ] Quick Edit works inline without page reload
- [x] Pages work independently from Posts (no categories)
- [x] `planning/CURRENT_STATE.md` updated


---

## Implementation notes (2026-11-07)

- Lives in the **Content module** (`src/lib/content/`): `store.ts` (operations), `post-types.ts` (registry with built-in `post` and `page`), `taxonomies.ts`, `slug.ts`, `sanitize.ts`. Actions are in `src/app/admin/(protected)/content-actions.ts`, not `src/app/admin/posts/actions.ts`.
- Hook names as built: `post.creating`, `post.created`, `post.updating`, `post.updated`, `post.published`, `post.trashed`, `post.restored`, `post.deleted`; filters `post.title`, `post.content` (applied on public reads).
- Revisions store the *new* state after each save that changes title/content/excerpt; the newest is marked "Current".
- **Not done yet:** Quick Edit, sidebar post-count badge, featured image (needs Phase 6), publish date picker, visibility (password/private) controls beyond the Private status, Preview button, full-screen is done but no autosave.
