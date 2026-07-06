# Phase 5: Content Management — Posts & Pages

**Status**: 🔴 NOT STARTED  
**Depends on**: Phase 4 (admin shell), Phase 2 (Post schema)  
**Estimated Sessions**: 3  

---

## Goal

Full CRUD for posts and pages including a rich TipTap editor, status management, slug generation, featured images, categories/tags, revisions, and trash.

---

## Task Checklist

### 5.1 — Post List Page (`/admin/posts`)
- [ ] Server Component that fetches posts with filters
- [ ] URL-based filters: `?status=draft|publish|trash`, `?category=`, `?author=`, `?search=`, `?page=`
- [ ] Table columns: Title (with inline actions), Author, Categories, Tags, Status, Date
- [ ] Inline quick actions under title: Edit | Quick Edit | Trash | View
- [ ] Quick Edit: inline form for title, slug, date, status, categories, tags — no full page reload
- [ ] Bulk actions: Delete Permanently, Move to Trash, Publish, Set as Draft
- [ ] Filter bar: All | Published | Drafts | Pending | Trash (with counts)
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
- [ ] Install: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-character-count`
- [ ] `src/components/admin/editor/RichTextEditor.tsx` — main editor component
- [ ] `src/components/admin/editor/EditorToolbar.tsx` — toolbar component
- [ ] Save content as HTML to `post.content` in DB

### 5.4 — Auto Slug Generation
- [ ] `src/lib/slug.ts`:
  - `generateSlug(title: string): string` — kebab-case, removes special chars
  - `ensureUniqueSlug(slug: string, excludeId?: number): Promise<string>` — appends `-2`, `-3` etc. if slug exists

### 5.5 — Server Actions (Post Mutations)
- [ ] `src/app/admin/posts/actions.ts`:
  - `createPost(data)` — creates post, fires `post.created` action
  - `updatePost(id, data)` — updates post, creates revision, fires `post.updated`
  - `publishPost(id)` — sets status to `publish`, fires `post.published`
  - `trashPost(id)` — sets status to `trash`
  - `deletePost(id)` — permanently deletes (only from trash)
  - `restorePost(id)` — restores from trash

### 5.6 — Revisions
- [ ] Revision = a Post record with `type = "revision"`, `parent = original_post_id`
- [ ] Save revision on every publish/update (limit to 10 most recent per post)
- [ ] Revision list in editor sidebar: show date + author + "Restore" button
- [ ] `restoreRevision(revisionId, postId)` server action

### 5.7 — Pages
- [ ] Reuse 90% of the post editor for pages
- [ ] Differences: no categories, no tags, has "Page Attributes" panel (parent page, template, order)
- [ ] `src/app/admin/pages/page.tsx` (list)
- [ ] `src/app/admin/pages/[id]/page.tsx` (editor)

### 5.8 — Custom Post Types API
- [ ] `src/lib/post-types.ts`:
  ```typescript
  registerPostType(name: string, options: PostTypeOptions): void
  getPostType(name: string): PostTypeDefinition | null
  getAllPostTypes(): PostTypeDefinition[]
  ```
- [ ] PostTypeOptions: `label`, `singular`, `icon`, `supports` (title, editor, thumbnail, excerpt, revisions, page-attributes), `taxonomies`, `public`, `showInMenu`
- [ ] Built-in types: `post`, `page`, `attachment`, `revision`, `nav_menu_item`

### 5.9 — Hook Integration
- [ ] Fire hooks at key moments:
  - `hooks.do_action('post.creating', data)` — before create
  - `hooks.do_action('post.created', post)` — after create
  - `hooks.do_action('post.published', post)` — when status → publish
  - `hooks.apply_filters('post.content', content, post)` — before rendering content
  - `hooks.apply_filters('post.title', title, post)` — before rendering title

---

## Definition of Done

- [ ] Can create a post with title, content, categories, tags, featured image
- [ ] Slug is auto-generated from title and is editable
- [ ] Post can be saved as draft or published
- [ ] Published posts appear on the frontend (even with placeholder theme)
- [ ] Revisions are saved and can be restored
- [ ] Trashed posts appear in Trash view, can be permanently deleted
- [ ] Quick Edit works inline without page reload
- [ ] Pages work independently from Posts (no categories)
- [ ] `planning/CURRENT_STATE.md` updated
