# KodPress: Technical Architecture

This document provides a deeper dive into the proposed technical architecture for KodPress, focusing on the theming and plugin systems.

## 1. Directory Structure

A KodPress project would have a conventional Next.js App Router structure with specific additions for the CMS:

```
/
|-- .next/
|-- app/
|   |-- admin/                # Admin panel routes (e.g., /admin)
|   |-- api/                  # API routes (e.g., /api)
|   |-- layout.tsx            # Root frontend layout
|   |-- page.tsx              # Root frontend page (homepage)
|   |-- [slug]/page.tsx       # Example dynamic frontend route
|   |-- ...                   # Other frontend routes
|-- content/                  # User-uploaded content (optional)
|-- kodpress.config.ts           # Main configuration file
|-- node_modules/
|-- package.json
|-- plugins/
|   |-- my-first-plugin/
|   |   |-- index.ts
|-- themes/
|   |-- my-theme/
|       |-- components/
|       |-- styles/
|       |-- theme.json
|-- tsconfig.json
```

## 2. Theming System: Component Shadowing

The theming system needs to be flexible enough to allow for complete control over the frontend's appearance and structure, similar to WordPress themes. A "Component Shadowing" approach, inspired by frameworks like Gatsby, is proposed.

### How it Works

1.  **Base Components:** KodPress provides a set of core, unstyled or lightly-styled functional components for rendering content (e.g., `Post.tsx`, `Header.tsx`, `Comment.tsx`). These components are located in a core directory that is not meant to be edited directly.

2.  **Theme Overrides:** An active theme can "override" any base component by creating a file with the same name in a corresponding directory.

    For example, to override the post title component:

    *   **Base Component Path:** `core/components/post/Title.tsx`
    *   **Theme Override Path:** `themes/my-theme/components/post/Title.tsx`

3.  **Dynamic Resolution:** KodPress's rendering logic will be wrapped in a custom resolver. When a component is requested (e.g., `<KodPressComponent name="post/Title" />`), the resolver will:
    a. Check if a file exists in the active theme's override directory (`themes/my-theme/components/post/Title.tsx`).
    b. If it exists, import and render that component.
    c. If not, fall back to the base component (`core/components/post/Title.tsx`).

This allows themes to be highly flexible, from simple CSS changes to completely rebuilding the markup of a page.

## 3. Plugin Architecture: Event-Driven Hooks

Replicating WordPress's hook system (`add_action`, `apply_filters`) is the biggest architectural challenge. We can achieve this with a custom event-driven system.

### Core Concepts

1.  **`HookServer`:** A singleton instance that manages all hooks and events. It will be initialized when the application starts.

2.  **`add_filter` (Filtering Data):**
    *   Plugins can register a "filter" for a specific event. A filter is a function that receives data, modifies it, and **must return it**.
    *   **Example:** A plugin wants to add "!! 🎉" to every post title.
        ```typescript
        // In: plugins/my-party-plugin/index.ts
        import { hooks } from '@kodpress/core';

        hooks.add_filter('post.title.render', (title: string) => {
            return title + '!! 🎉';
        });
        ```
    *   In the core application, when rendering a post title:
        ```typescript
        // In: core/components/PostTitle.tsx
        import { hooks } from '@kodpress/core';

        const rawTitle = database.getPostTitle(id);
        const renderedTitle = hooks.apply_filters('post.title.render', rawTitle);

        return <h1>{renderedTitle}</h1>;
        ```
    *   The `apply_filters` method would execute all registered callbacks for that hook in series, passing the output of one function as the input to the next.

3.  **`add_action` (Triggering Side-Effects):**
    *   Plugins can register an "action" to be executed when a specific event occurs. Actions do not return values. They are for performing side-effects.
    *   **Example:** A plugin wants to send an email when a post is published.
        ```typescript
        // In: plugins/email-notify-plugin/index.ts
        import { hooks } from '@kodpress/core';

        hooks.add_action('post.published', async (post: PostObject) => {
            await sendEmailToSubscribers(post.title);
        });
        ```
    *   In the core application, after saving a new post:
        ```typescript
        // In: app/(admin)/posts/actions.ts
        import { hooks } from '@kodpress/core';

        const newPost = await database.createPost(data);
        hooks.do_action('post.published', newPost);
        ```
    *   The `do_action` method would execute all registered callbacks for that hook, potentially in parallel.

### Implementation Details

*   The `HookServer` would be a simple object mapping hook names to arrays of callback functions.
*   Care must be taken to handle asynchronous callbacks correctly, especially for `add_filter` where the order of execution matters.
*   Plugins would be discovered by scanning the `/plugins` directory at build time. Each plugin's entry point (`index.ts`) would be imported to register its hooks. This would require a custom build step in `next.config.js`.

This architecture provides a solid foundation for a flexible and extensible CMS, while acknowledging the significant engineering effort required to build it robustly.

## 4. Dynamic Routing (Permalinks)

To replicate the flexibility of WordPress's permalink system, KodPress will use a "catch-all" route within the Next.js App Router. This allows URL structures to be defined in the admin panel rather than being dictated by the filesystem.

### How It Works

1.  **Permalink Configuration:** An administrator can define a permalink structure in the admin panel (e.g., `Dashboard > Settings > Permalinks`). This setting is stored in the `Option` table in the database.
    *   **Examples:** `/%year%/%month%/%postname%/`, `/%category%/%postname%/`, or simply `/%postname%/`.

2.  **Catch-All Route:** A single dynamic route at `app/[[...slug]]/page.tsx` will be created. This route intercepts most incoming frontend requests that don't match a static file or a more specific route like `/admin` or `/api`.

3.  **Request Resolution Logic:** Inside the catch-all `page.tsx`, the following server-side logic will execute for each request:
    a. **Fetch URL Segments:** The `slug` parameter (e.g., `['2024', '10', 'my-post-title']`) is retrieved from the request.
    b. **Fetch Permalink Setting:** The active `permalink_structure` is fetched from the database (e.g., `/%year%/%month%/%postname%/`). This value should be aggressively cached for performance.
    c. **Parse and Match:** A router utility parses both the setting and the URL segments to extract meaningful information. For example, it would determine that `my-post-title` is the post's slug, `2024` is the year, and `10` is the month.
    d. **Query Database:** The application queries the `Post` table using the extracted slug (`WHERE slug = 'my-post-title'`). It can also use the date parts to disambiguate if needed.
    e. **Render Content:** If a matching post is found, the page renders the post using the active theme's components. If no post is found, it might try to resolve the URL as a category, tag, or author archive page. If no content can be matched, it renders a 404 "Not Found" page.

### Key Considerations

*   **Performance:** The database lookups (for the setting and the content) on every request must be highly optimized.
*   **Link Generation:** A helper function, `generateLink(post)`, will be necessary. This function will read the current permalink setting and construct the correct URL for a given piece of content, ensuring that all internal links are always correct.
*   **Resolution Hierarchy:** A clear and predictable hierarchy must be established to resolve ambiguity (e.g., if a page and a category share the same slug). For example: `Page > Post > Category > Tag`.
