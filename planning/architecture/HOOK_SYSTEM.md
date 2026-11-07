# KodPress — Hook System Architecture

> Detailed design of the WordPress-compatible plugin hook system.

---

## Overview

The Hook System is the backbone of KodPress's extensibility. It replicates WordPress's `add_action`, `add_filter`, `do_action`, and `apply_filters` functions in TypeScript.

- **Actions**: Fire-and-forget side effects (send email, clear cache, log event)
- **Filters**: Transform a value (modify content, alter a query, change a URL)

---

## Full HookServer Implementation

```typescript
// src/lib/hooks.ts

type HookCallback = (...args: any[]) => any;

interface RegisteredCallback {
  callback: HookCallback;
  priority: number;
  acceptedArgs: number;
  id: symbol;
}

class HookServer {
  private actions = new Map<string, RegisteredCallback[]>();
  private filters = new Map<string, RegisteredCallback[]>();
  private didActions = new Map<string, number>();
  private currentFilter: string | null = null;

  // Register an action callback
  add_action(
    name: string,
    callback: HookCallback,
    priority = 10,
    acceptedArgs = 1
  ): symbol {
    const id = Symbol(name);
    const entry: RegisteredCallback = { callback, priority, acceptedArgs, id };
    const existing = this.actions.get(name) ?? [];
    existing.push(entry);
    existing.sort((a, b) => a.priority - b.priority);
    this.actions.set(name, existing);
    return id;
  }

  // Register a filter callback
  add_filter(
    name: string,
    callback: HookCallback,
    priority = 10,
    acceptedArgs = 1
  ): symbol {
    const id = Symbol(name);
    const entry: RegisteredCallback = { callback, priority, acceptedArgs, id };
    const existing = this.filters.get(name) ?? [];
    existing.push(entry);
    existing.sort((a, b) => a.priority - b.priority);
    this.filters.set(name, existing);
    return id;
  }

  // Fire all action callbacks for a hook
  async do_action(name: string, ...args: any[]): Promise<void> {
    const callbacks = this.actions.get(name) ?? [];
    this.didActions.set(name, (this.didActions.get(name) ?? 0) + 1);
    const prevFilter = this.currentFilter;
    this.currentFilter = name;
    for (const { callback, acceptedArgs } of callbacks) {
      await callback(...args.slice(0, acceptedArgs));
    }
    this.currentFilter = prevFilter;
  }

  // Apply all filter callbacks, threading the value through
  async apply_filters(name: string, value: any, ...args: any[]): Promise<any> {
    const callbacks = this.filters.get(name) ?? [];
    const prevFilter = this.currentFilter;
    this.currentFilter = name;
    let result = value;
    for (const { callback, acceptedArgs } of callbacks) {
      result = await callback(result, ...args.slice(0, acceptedArgs - 1));
    }
    this.currentFilter = prevFilter;
    return result;
  }

  // Remove a specific action by its returned symbol ID
  remove_action(name: string, id: symbol): boolean {
    const callbacks = this.actions.get(name);
    if (!callbacks) return false;
    const idx = callbacks.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    callbacks.splice(idx, 1);
    return true;
  }

  // Remove a specific filter by its returned symbol ID
  remove_filter(name: string, id: symbol): boolean {
    const callbacks = this.filters.get(name);
    if (!callbacks) return false;
    const idx = callbacks.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    callbacks.splice(idx, 1);
    return true;
  }

  // Check if a hook has any callbacks
  has_action(name: string): boolean {
    return (this.actions.get(name)?.length ?? 0) > 0;
  }

  has_filter(name: string): boolean {
    return (this.filters.get(name)?.length ?? 0) > 0;
  }

  // How many times has an action fired?
  did_action(name: string): number {
    return this.didActions.get(name) ?? 0;
  }

  // What hook is currently executing?
  current_filter(): string | null {
    return this.currentFilter;
  }
}

// Singleton export — import this everywhere
export const hooks = new HookServer();
```

---

## Core Hook Reference

Below is the list of all hooks that KodPress's core fires. Plugins use these to extend behavior.

### Post Hooks
| Hook | Type | When Fired | Args |
|---|---|---|---|
| `post.creating` | action | Before a new post is saved | `(data: PostCreateInput)` |
| `post.created` | action | After a new post is saved | `(post: Post)` |
| `post.updating` | action | Before a post update | `(id: number, data: PostUpdateInput)` |
| `post.updated` | action | After a post is updated | `(post: Post)` |
| `post.published` | action | When status changes to `publish` | `(post: Post)` |
| `post.trashed` | action | When moved to trash | `(post: Post)` |
| `post.deleted` | action | When permanently deleted | `(id: number)` |
| `post.title` | filter | Before rendering post title | `(title: string, post: Post)` |
| `post.content` | filter | Before rendering post content | `(content: string, post: Post)` |
| `post.excerpt` | filter | Before rendering post excerpt | `(excerpt: string, post: Post)` |
| `post.slug` | filter | Before saving post slug | `(slug: string, title: string)` |

### User Hooks
| Hook | Type | When Fired | Args |
|---|---|---|---|
| `user.registered` | action | After new user registration | `(user: User)` |
| `user.login` | action | After successful login | `(user: User)` |
| `user.logout` | action | On logout | `(userId: number)` |
| `user.profile_updated` | action | After profile update | `(user: User)` |

### Media Hooks
| Hook | Type | When Fired | Args |
|---|---|---|---|
| `media.uploaded` | action | After file upload | `(attachment: Post)` |
| `media.deleted` | action | After media deletion | `(id: number)` |

### Admin UI Hooks (client-side, limited)
| Hook | Type | When Fired | Args |
|---|---|---|---|
| `admin.post_editor.meta_boxes` | filter | When rendering post editor sidebar | `(metaBoxes: MetaBox[], postType: string)` |
| `admin.dashboard.widgets` | filter | When rendering dashboard | `(widgets: Widget[])` |
| `admin.sidebar.menu_items` | filter | When rendering sidebar nav | `(items: MenuItem[])` |

### Frontend Hooks
| Hook | Type | When Fired | Args |
|---|---|---|---|
| `frontend.head` | filter | Inside `<head>` on every page | `(headContent: string, context: PageContext)` |
| `frontend.body_open` | action | After `<body>` opening tag | `(context: PageContext)` |
| `frontend.body_close` | action | Before `</body>` closing tag | `(context: PageContext)` |

### API Hooks
| Hook | Type | When Fired | Args |
|---|---|---|---|
| `api.post.response` | filter | Before returning post in REST API | `(data: object, post: Post)` |
| `api.posts.query` | filter | Before DB query in list endpoint | `(query: PostQuery)` |

---

## Plugin Example

```typescript
// plugins/kodpress-cache/index.ts
import { hooks } from '@/lib/hooks';

const cacheActionId = hooks.add_action('post.updated', async (post) => {
  await clearCacheForPost(post.id);
}, 20); // priority 20 — runs after core's priority 10

const contentFilterId = hooks.add_filter('post.content', async (content, post) => {
  return content.replace(/\[gallery\]/g, await renderGallery(post));
}, 10);

export const plugin = {
  name: 'KodPress Cache',
  version: '1.0.0',
  description: 'Clears cache when posts are updated.',
  author: 'KodPress Team',
  
  activate() {
    // Hooks are registered above at module load time
    // activate() is for one-time setup (DB tables, options, etc.)
  },
  
  deactivate() {
    hooks.remove_action('post.updated', cacheActionId);
    hooks.remove_filter('post.content', contentFilterId);
  }
};
```

---

## Important Notes for Agents

1. **`apply_filters` MUST be awaited** — it's always async to support async callbacks
2. **`do_action` MUST be awaited** — same reason
3. **Plugins register hooks at module load time** (top level in `index.ts`), NOT inside `activate()`
4. **`deactivate()` should always call `remove_action/filter`** with the stored symbol IDs
5. **Priority ordering**: lower numbers run first (10 = default, 1 = very early, 99 = late)
6. The HookServer is a singleton — import `{ hooks }` from `@/lib/hooks` everywhere
