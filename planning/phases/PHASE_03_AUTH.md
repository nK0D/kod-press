# Phase 3: Authentication

**Status**: 🔴 NOT STARTED  
**Depends on**: Phase 2 (DB schema with `User` table)  
**Estimated Sessions**: 1  

---

## Goal

Implement a secure authentication system for the admin panel using NextAuth.js v5 (Auth.js). The system must support WordPress-compatible user roles and capability checking.

---

## Task Checklist

### 3.1 — NextAuth.js v5 Configuration
- [ ] Create `auth.ts` at project root (NextAuth v5 style)
- [ ] Credentials Provider:
  - Accept `login` (username or email) + `password`
  - Query DB for user by `login` OR `email`
  - Compare hashed password with `bcryptjs.compare()`
  - Return user object with `id`, `login`, `email`, `displayName`, `role`
- [ ] Session strategy: JWT (for edge middleware compatibility)
- [ ] Session includes: `user.id`, `user.login`, `user.email`, `user.displayName`, `user.role`
- [ ] Callbacks:
  - `jwt` callback: add role from DB to token
  - `session` callback: expose role on `session.user`

### 3.2 — API Route
- [ ] `src/app/api/auth/[...nextauth]/route.ts` — standard NextAuth handler

### 3.3 — Middleware Update
- [ ] Update `src/middleware.ts` with full auth checking:
  ```typescript
  // Protected routes
  /admin/*  → requires any authenticated user
  /admin/users/* → requires role: admin
  /admin/plugins/* → requires role: admin
  /admin/themes/* → requires role: admin
  /admin/settings/* → requires role: admin
  ```
- [ ] Guest routes:
  - `/admin/login` — redirect to `/admin` if already logged in
  - `/setup` — redirect to `/admin` if installed

### 3.4 — Admin Login Page
- [ ] `src/app/admin/login/page.tsx`
- [ ] Design: Centered card on dark background, Depot logo, clean and modern (NOT using the frontend theme)
- [ ] Fields: Username/Email, Password
- [ ] "Remember me" checkbox (controls session max age)
- [ ] Error states: "Invalid credentials", "Account disabled"
- [ ] Redirect to `callbackUrl` after login (or `/admin` by default)
- [ ] "Forgot Password?" link (leads to `/admin/login/forgot`)

### 3.5 — Forgot Password Flow
- [ ] `src/app/admin/login/forgot/page.tsx` — enter email
- [ ] `src/app/api/auth/forgot-password/route.ts` — generate reset token (stored in `usermeta`), send email
- [ ] `src/app/admin/login/reset/page.tsx` — enter new password (with token in URL)
- [ ] `src/app/api/auth/reset-password/route.ts` — validate token, update password, delete token

### 3.6 — Roles & Capabilities System
- [ ] `src/lib/roles.ts` — define the role hierarchy:
  ```typescript
  export const ROLES = {
    administrator: { level: 10, caps: [...all capabilities] },
    editor:        { level: 7,  caps: [...editor capabilities] },
    author:        { level: 2,  caps: [...author capabilities] },
    contributor:   { level: 1,  caps: [...contributor capabilities] },
    subscriber:    { level: 0,  caps: ['read'] },
  }
  ```
- [ ] Capabilities list (matches WordPress):
  - `read`, `edit_posts`, `publish_posts`, `edit_others_posts`, `delete_posts`
  - `edit_pages`, `publish_pages`, `edit_others_pages`, `delete_pages`
  - `upload_files`, `manage_categories`, `manage_tags`
  - `manage_options`, `install_plugins`, `activate_plugins`, `install_themes`
  - `manage_users`, `create_users`, `delete_users`, `promote_users`
  - `moderate_comments`, `edit_comments`, `delete_comments`

- [ ] `src/lib/capabilities.ts` — helper functions:
  ```typescript
  currentUserCan(cap: string): boolean
  userCan(userId: number, cap: string): boolean
  ```

### 3.7 — Auth Utilities
- [ ] `src/lib/auth-utils.ts`:
  - `getCurrentUser()` — returns session user or null
  - `requireAuth()` — throws redirect if not authenticated
  - `requireCap(cap)` — throws redirect if user lacks capability
  - `hashPassword(password)` — bcrypt hash
  - `verifyPassword(password, hash)` — bcrypt verify

---

## Definition of Done

- [ ] Visiting `/admin` without auth redirects to `/admin/login`
- [ ] Logging in with wrong credentials shows error
- [ ] Logging in with correct credentials redirects to `/admin`
- [ ] `session.user.role` is correctly populated
- [ ] `currentUserCan('manage_options')` returns `true` for admin, `false` for subscriber
- [ ] Password reset flow works end-to-end (can be tested without email — check DB for token)
- [ ] `planning/CURRENT_STATE.md` updated
