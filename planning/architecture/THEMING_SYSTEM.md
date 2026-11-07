# KodPress — Theming System Architecture

> Design of the component-shadowing theme system for the public frontend.

---

## Overview

KodPress's theming system allows the public frontend's appearance to be changed completely by installing and activating a different theme — without touching core files. This is achieved through **Component Shadowing**: themes can override any core frontend component by providing their own version of the same file.

The admin panel is NEVER themed — it always uses Shadcn/UI.

---

## Theme Directory Structure

```
themes/
└── kodpress-default/
    ├── theme.json            ← Theme metadata
    ├── style.css             ← Main theme stylesheet
    ├── screenshot.png        ← 1200×900 theme preview image
    └── components/           ← Component overrides (all optional)
        ├── Header.tsx
        ├── Footer.tsx
        ├── PostCard.tsx
        ├── PostSingle.tsx
        ├── PageSingle.tsx
        ├── CommentList.tsx
        ├── CommentForm.tsx
        ├── Sidebar.tsx
        ├── SearchForm.tsx
        ├── Pagination.tsx
        └── NavMenu.tsx
```

---

## theme.json Schema

```json
{
  "name": "KodPress Default",
  "version": "1.0.0",
  "author": "KodPress Team",
  "authorUri": "https://kodpress.dev",
  "description": "The default theme for KodPress CMS.",
  "textDomain": "kodpress-default",
  "tags": ["blog", "two-columns", "custom-colors"],
  "screenshot": "./screenshot.png",
  
  "supports": {
    "customColors": true,
    "customFonts": true,
    "customLogo": true,
    "headerImage": true,
    "widgetAreas": true,
    "postFormats": ["standard", "image", "video", "gallery", "quote"],
    "thumbnails": true,
    "editor": "tiptap"
  },
  
  "widgetAreas": [
    {
      "id": "sidebar-1",
      "name": "Main Sidebar",
      "description": "Add widgets here to appear in the sidebar."
    },
    {
      "id": "footer-1",
      "name": "Footer Column 1"
    },
    {
      "id": "footer-2",
      "name": "Footer Column 2"
    }
  ],
  
  "menuLocations": [
    {
      "id": "primary",
      "name": "Primary Menu",
      "description": "The main navigation at the top of the page."
    },
    {
      "id": "footer",
      "name": "Footer Menu"
    }
  ],
  
  "customizer": {
    "colors": {
      "accent": { "label": "Accent Color", "default": "#6366f1" },
      "background": { "label": "Background Color", "default": "#ffffff" },
      "text": { "label": "Text Color", "default": "#1a202c" }
    },
    "fonts": {
      "body": { "label": "Body Font", "default": "Inter" },
      "heading": { "label": "Heading Font", "default": "Inter" }
    }
  }
}
```

---

## Component Resolution System

```typescript
// src/lib/theme.ts

import { getOption } from './options';
import type { ComponentType } from 'react';

// Cache resolved components to avoid repeated filesystem checks
const componentCache = new Map<string, ComponentType<any>>();

export async function resolveComponent(name: string): Promise<ComponentType<any>> {
  const cacheKey = `${activeTheme}:${name}`;
  
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!;
  }
  
  const activeTheme = await getOption('active_theme') ?? 'kodpress-default';
  
  // Try theme override first
  try {
    const ThemeComponent = await import(`../../../themes/${activeTheme}/components/${name}`);
    componentCache.set(cacheKey, ThemeComponent.default);
    return ThemeComponent.default;
  } catch {
    // Fall back to core component
    const CoreComponent = await import(`../components/frontend/${name}`);
    componentCache.set(cacheKey, CoreComponent.default);
    return CoreComponent.default;
  }
}

// Invalidate cache when theme changes
export function invalidateThemeCache() {
  componentCache.clear();
}
```

### The `<KodPressComponent>` Wrapper

```tsx
// src/components/frontend/KodPressComponent.tsx
// NOTE: This must be a Server Component since it does async imports

interface Props {
  name: string;       // e.g. "PostCard", "Header", "Footer"
  [key: string]: any; // Props passed through to the component
}

export async function KodPressComponent({ name, ...props }: Props) {
  const Component = await resolveComponent(name);
  return <Component {...props} />;
}
```

### Usage in Pages

```tsx
// In app/[[...slug]]/page.tsx when rendering a post:
<KodPressComponent name="PostSingle" post={post} />

// In the root frontend layout:
<KodPressComponent name="Header" />
{children}
<KodPressComponent name="Footer" />
```

---

## Core Frontend Components (The Overridable Ones)

These live in `src/components/frontend/` and provide the default rendering. Themes override them.

| Component | Props | Description |
|---|---|---|
| `Header` | `siteTitle, siteDescription, logoUrl` | Site header with nav |
| `Footer` | `footerText` | Site footer with widget areas |
| `PostCard` | `post: Post, showExcerpt: boolean` | Post in a list/archive |
| `PostSingle` | `post: Post` | Full single post view |
| `PageSingle` | `page: Post` | Full single page view |
| `CommentList` | `comments: Comment[], postId: number` | Threaded comment list |
| `CommentForm` | `postId: number` | Comment submission form |
| `Sidebar` | `area: string` | Widget area renderer |
| `SearchForm` | `defaultValue?: string` | Search input form |
| `Pagination` | `currentPage, totalPages, baseUrl` | Page navigation |
| `NavMenu` | `location: string` | Renders a menu by location |

---

## Theme Activation Flow

1. Admin visits `/admin/themes`
2. Clicks "Activate" on a theme
3. Server Action: `setOption('active_theme', themeName)`
4. `invalidateThemeCache()` is called
5. `revalidatePath('/')` — Next.js revalidates frontend pages
6. Frontend immediately uses new theme

---

## The CSS Variable System

Theme customization works through CSS variables injected into the document. The customizer settings are stored in `options` as JSON:

```
options.key = "theme_kodpress-default_mods"
options.value = '{"accent":"#6366f1","background":"#ffffff","bodyFont":"Inter"}'
```

In the root frontend layout, these are read server-side and injected as inline styles:

```tsx
// app/layout.tsx (frontend root layout)
const themeMods = JSON.parse(await getOption(`theme_${activeTheme}_mods`) ?? '{}');

return (
  <html>
    <head>
      <style>{`
        :root {
          --theme-accent: ${themeMods.accent ?? '#6366f1'};
          --theme-bg: ${themeMods.background ?? '#ffffff'};
          --theme-text: ${themeMods.text ?? '#1a202c'};
          --theme-font-body: ${themeMods.bodyFont ?? 'Inter'}, sans-serif;
          --theme-font-heading: ${themeMods.headingFont ?? 'Inter'}, sans-serif;
        }
      `}</style>
    </head>
    <body>...
```

The theme's `style.css` uses these variables:
```css
body {
  font-family: var(--theme-font-body);
  background-color: var(--theme-bg);
  color: var(--theme-text);
}
a, .btn-primary {
  color: var(--theme-accent);
}
```

---

## Creating a Custom Theme

A developer creates a theme by:
1. Creating `themes/my-theme/theme.json`
2. Creating `themes/my-theme/style.css`
3. Optionally overriding components in `themes/my-theme/components/`
4. Uploading to the server (or installing via future marketplace)
5. Activating in Admin → Appearance → Themes

A minimal theme only needs `theme.json` and `style.css` — all core components will be used as-is, just styled differently via CSS variables.

---

## Important Notes for Agents

- **Never modify core components** (`src/components/frontend/`) for theme-specific styling — use theme overrides
- **Theme components receive the same props as core components** — maintain the interface
- **`KodPressComponent` is async** — it must be used in Server Components only
- **Cache invalidation** is critical: always call `invalidateThemeCache()` on theme switch
- **Screenshots**: themes must include a 1200×900 `screenshot.png` for the admin theme grid
