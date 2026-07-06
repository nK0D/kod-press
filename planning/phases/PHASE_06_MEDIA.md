# Phase 6: Media Library

**Status**: 🔴 NOT STARTED  
**Depends on**: Phase 4 (admin shell), Phase 2 (Post schema — attachments are posts)  
**Estimated Sessions**: 2  

---

## Goal

A WordPress-style media library with upload, image processing, grid/list view, attachment management, and integration with the post editor.

---

## Key Design Decision

In WordPress (and Depot), **media attachments ARE posts** with `type = "attachment"`. The file path is stored in `guid`, and metadata (width, height, file size, alt text, etc.) is stored in `post_meta`. This means the `Post` table already handles media — no extra table needed.

---

## Task Checklist

### 6.1 — File Storage
- [ ] `src/lib/storage.ts` — storage adapter interface:
  ```typescript
  interface StorageAdapter {
    upload(file: File, path: string): Promise<string>  // returns public URL
    delete(path: string): Promise<void>
    getUrl(path: string): string
  }
  ```
- [ ] `LocalStorageAdapter` — saves to `public/uploads/YYYY/MM/filename.ext`
- [ ] Later: `S3StorageAdapter` (just a stub for now)
- [ ] File URL format: `/uploads/2026/07/image.jpg`

### 6.2 — Image Processing
- [ ] `src/lib/image-processor.ts` using `sharp`:
  - `generateThumbnails(filePath)` — creates: thumbnail (150x150 crop), medium (300xAuto), large (1024xAuto)
  - `getImageMetadata(filePath)` — returns: width, height, filesize, mime type
- [ ] Store generated sizes in `post_meta` as JSON: `key = "_wp_attachment_metadata"`

### 6.3 — Upload API
- [ ] `src/app/api/media/upload/route.ts` — `POST` with `multipart/form-data`
  - Accepts single or multiple files
  - Validates: file type (images, PDF, video, audio), file size limit (from settings)
  - Saves file via storage adapter
  - Creates `Post` record with `type = "attachment"`
  - Stores metadata in `PostMeta`
  - Returns the created attachment data
- [ ] Require authentication + `upload_files` capability

### 6.4 — Media Library Page (`/admin/media`)
- [ ] **Grid view** (default): Masonry-style grid of thumbnails
  - Click a thumbnail → open attachment detail panel (slide-in)
  - Hover: title overlay
  - Selected: blue border + checkmark
- [ ] **List view**: Table with filename, author, type, date, dimensions
- [ ] **Filters**: All media | Images | Video | Audio | Documents | By date (month selector) | Search
- [ ] **Bulk actions**: Delete permanently (moves file + DB record)
- [ ] **Upload zone**: Drag-and-drop onto the page OR "Upload Files" button (top-right)
  - Show upload progress bars during upload
  - New uploads appear at the top of the grid

### 6.5 — Attachment Detail Panel
- [ ] Slide-in panel from the right when clicking a thumbnail
- [ ] Shows: full preview, filename, file type, file size, upload date, dimensions
- [ ] Editable fields: Title, Caption, Alt Text, Description
- [ ] "Copy URL" button
- [ ] "Edit Image" button (opens basic image editor: rotate, flip, crop — Phase future)
- [ ] "Delete Permanently" button with confirm dialog
- [ ] Navigation arrows: previous/next attachment

### 6.6 — Add New Media Page (`/admin/media/new`)
- [ ] Simple uploader page with large drag-and-drop zone
- [ ] Shows uploaded files table after upload

### 6.7 — Media Picker Modal
- [ ] `src/components/admin/MediaPicker.tsx` — reusable modal component
- [ ] Used in: Post editor (featured image, insert media), Theme Customizer (logo/background), User profile (avatar)
- [ ] Tabs: "Upload Files" | "Media Library"
- [ ] Library tab: same grid view as the full library but inside a modal
- [ ] Select item → callback with attachment URL and metadata

### 6.8 — Server Actions
- [ ] `deleteMedia(id: number)` — deletes file from disk + DB record
- [ ] `updateMediaMeta(id: number, data)` — updates title, alt, caption, description

---

## Definition of Done

- [ ] Can upload an image via drag-and-drop or button
- [ ] Uploaded image appears in grid with thumbnail
- [ ] Can edit alt text, title, caption for an image
- [ ] Can delete an image (file disappears from disk + DB)
- [ ] Media picker modal works and can be used in post editor for featured image
- [ ] Image sizes (thumbnail, medium, large) are auto-generated on upload
- [ ] `planning/CURRENT_STATE.md` updated
