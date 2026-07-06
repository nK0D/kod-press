# Phase 4: Admin Panel Core UI

**Status**: 🔴 NOT STARTED  
**Depends on**: Phase 3 (authentication working)  
**Estimated Sessions**: 2  

---

## Goal

Build the full admin panel shell — sidebar navigation, top bar, dashboard with widgets — in a modern, premium design that is functionally equivalent to wp-admin but visually superior. The admin must work on desktop and tablet.

---

## Design Direction

- **Color scheme**: Dark sidebar (deep slate/navy), light content area. Optional dark mode for content area.
- **Typography**: Inter font (Google Fonts)
- **Sidebar**: Fixed left, collapsible to icon-only mode, active item highlighted
- **Top bar**: Sticky, shows breadcrumbs, user menu, site preview link, "New" quick-add dropdown
- **Dashboard**: Card-based widget layout, clean and information-dense

---

## Task Checklist

### 4.1 — Admin CSS Variables & Global Styles
- [ ] `src/app/admin/admin.css` — all admin CSS variables:
  ```css
  :root {
    --admin-sidebar-width: 260px;
    --admin-sidebar-collapsed-width: 60px;
    --admin-sidebar-bg: #1a1d23;
    --admin-sidebar-text: #a0aec0;
    --admin-sidebar-active: #ffffff;
    --admin-sidebar-accent: #6366f1; /* indigo */
    --admin-topbar-height: 56px;
    --admin-topbar-bg: #ffffff;
    --admin-content-bg: #f8fafc;
    --admin-card-bg: #ffffff;
    --admin-border: #e2e8f0;
    --admin-text-primary: #1a202c;
    --admin-text-secondary: #718096;
    --admin-accent: #6366f1;
    --admin-accent-hover: #4f46e5;
    --admin-danger: #ef4444;
    --admin-success: #22c55e;
    --admin-warning: #f59e0b;
  }
  ```
- [ ] Dark mode variables (applied via `[data-theme="dark"]` on `<body>`)

### 4.2 — Admin Layout Component
- [ ] `src/app/admin/layout.tsx` — server component that:
  - Calls `requireAuth()` — redirects to login if not authenticated
  - Fetches `site_name` from options for display in sidebar
  - Renders `<AdminShell>` with sidebar + topbar + `{children}`
- [ ] `src/components/admin/AdminShell.tsx` — client component:
  - Manages sidebar collapsed/expanded state (persisted to localStorage)
  - Renders the full admin chrome around `{children}`

### 4.3 — Sidebar Navigation
- [ ] `src/components/admin/Sidebar.tsx` — client component
- [ ] Sidebar sections matching WordPress:
  ```
  [Dashboard]           → /admin
  [Posts]               → /admin/posts
    All Posts
    Add New
    Categories
    Tags
  [Media]               → /admin/media
    Library
    Add New
  [Pages]               → /admin/pages
    All Pages
    Add New
  [Comments]            → /admin/comments
  ─────────────────
  [Appearance]          → /admin/themes
    Themes
    Customizer (future)
    Menus
    Widgets
  [Plugins]             → /admin/plugins
    Installed Plugins
    Add New
  [Users]               → /admin/users
    All Users
    Add New
    Your Profile
  [Tools]               → /admin/tools
  [Settings]            → /admin/settings
    General
    Writing
    Reading
    Discussion
    Media
    Permalinks
  ─────────────────
  [Help]                → /admin/help
  ```
- [ ] Collapse/expand toggle button at bottom of sidebar
- [ ] In collapsed mode: only icons visible, tooltip on hover
- [ ] Active item: highlighted with accent color and left border
- [ ] Sub-items: indented, collapsible section
- [ ] Site name + Depot version at sidebar bottom

### 4.4 — Top Bar
- [ ] `src/components/admin/Topbar.tsx`
- [ ] Left: Page title / breadcrumbs
- [ ] Right:
  - "Visit Site" button (opens frontend in new tab)
  - "New" dropdown: Post, Page, Media, User
  - Notifications bell (future — placeholder for now)
  - User avatar + dropdown:
    - "Edit Profile"
    - "Log Out"
- [ ] The "New" dropdown uses `createPortal` or a Radix `DropdownMenu`

### 4.5 — Dashboard Page
- [ ] `src/app/admin/page.tsx`
- [ ] Layout: 2-column grid on desktop, 1-column on mobile
- [ ] **Widget 1: At a Glance**
  - Shows: X Posts, X Pages, X Comments (pending), WordPress theme: Active Theme name
  - Icons from lucide-react
- [ ] **Widget 2: Quick Draft**
  - Title input + content textarea + "Save Draft" button
  - Calls a Server Action to create a draft post
- [ ] **Widget 3: Recent Activity**
  - Latest published posts (5 items)
  - Latest comments (5 items, with approve/spam actions)
- [ ] **Widget 4: Welcome Panel** (first-time only, dismissable)
  - "Welcome to Depot! Here's what to do next:"
  - Links: Create your first post, Set up your homepage, Set your site title

### 4.6 — Shared Admin UI Components
- [ ] `src/components/admin/DataTable.tsx` — reusable sortable table with:
  - Column definitions
  - Pagination
  - Bulk action checkbox + bulk action dropdown
  - Per-page selector
  - Search (optional)
- [ ] `src/components/admin/PageHeader.tsx` — title + "Add New" button
- [ ] `src/components/admin/Breadcrumbs.tsx`
- [ ] `src/components/admin/StatusBadge.tsx` — publish/draft/trash/pending badges
- [ ] `src/components/admin/ConfirmDialog.tsx` — confirm delete dialog (Radix AlertDialog)
- [ ] `src/components/admin/LoadingSpinner.tsx`
- [ ] `src/components/admin/EmptyState.tsx` — empty state with icon + message + action button

### 4.7 — Placeholder Pages
Create empty placeholder pages for all admin sections (they'll be filled in later phases):
- [ ] `src/app/admin/posts/page.tsx`
- [ ] `src/app/admin/pages/page.tsx`
- [ ] `src/app/admin/media/page.tsx`
- [ ] `src/app/admin/comments/page.tsx`
- [ ] `src/app/admin/themes/page.tsx`
- [ ] `src/app/admin/plugins/page.tsx`
- [ ] `src/app/admin/users/page.tsx`
- [ ] `src/app/admin/settings/page.tsx`
- [ ] `src/app/admin/help/page.tsx`

---

## Definition of Done

- [ ] Admin layout renders correctly with sidebar + topbar + content area
- [ ] Sidebar navigation highlights the active route
- [ ] Sidebar collapses to icon-only mode and state persists on refresh
- [ ] Dashboard shows real data (post count, page count, comment count)
- [ ] "Quick Draft" widget saves a draft post
- [ ] User avatar menu shows name and has "Log Out" working
- [ ] All placeholder pages render without errors
- [ ] Responsive: sidebar becomes a drawer on tablet
- [ ] `planning/CURRENT_STATE.md` updated
