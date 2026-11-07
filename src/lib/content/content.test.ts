import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AccessDenied, type Actor } from '@/lib/access';
import { HookServer } from '@/lib/hooks';
import { createTestDatabase } from '@/test/database';
import { createContentStore, type ContentStore } from './store';

let env: Awaited<ReturnType<typeof createTestDatabase>>;
let hooks: HookServer;
let content: ContentStore;
let admin: Actor;
let author: Actor;
let contributor: Actor;

beforeEach(async () => {
  env = await createTestDatabase();
  hooks = new HookServer();
  content = createContentStore({ db: env.db, hooks });
  admin = await env.createActor('administrator', 'Ada Admin');
  author = await env.createActor('author', 'Arthur Author');
  contributor = await env.createActor('contributor', 'Connie Contributor');
});

afterEach(async () => {
  await env.cleanup();
});

describe('saving posts', () => {
  it('creates a draft with a slug from the title and the default category', async () => {
    const post = await content.save(author, { type: 'post', title: 'Hello, Wörld! It’s here', content: '<p>Hi</p>', status: 'draft' });

    expect(post.slug).toBe('hello-world-its-here');
    expect(post.status).toBe('draft');
    expect(post.author.displayName).toBe('Arthur Author');
    expect(post.categories.map((c) => c.id)).toEqual([env.defaultCategoryId]);
    expect(post.can).toEqual({ edit: true, trash: true, delete: true, publish: true });
  });

  it('keeps slugs unique and away from reserved app routes', async () => {
    const first = await content.save(author, { type: 'post', title: 'Same title', status: 'draft' });
    const second = await content.save(author, { type: 'post', title: 'Same title', status: 'draft' });
    const page = await content.save(admin, { type: 'page', title: 'Same title', status: 'draft' });
    const reserved = await content.save(admin, { type: 'page', title: 'Admin', status: 'draft' });
    const untitled = await content.save(author, { type: 'post', title: '   ', status: 'draft' });

    expect([first.slug, second.slug, page.slug]).toEqual(['same-title', 'same-title-2', 'same-title-3']);
    expect(reserved.slug).toBe('admin-2');
    expect(untitled.slug).toBe('post');
  });

  it('honours an edited slug and regenerates a cleared one', async () => {
    const post = await content.save(author, { type: 'post', title: 'Original', status: 'draft' });
    const renamed = await content.save(author, { id: post.id, type: 'post', title: 'Original', slug: 'My Custom URL', status: 'draft' });
    const cleared = await content.save(author, { id: post.id, type: 'post', title: 'New title', slug: '', status: 'draft' });

    expect(renamed.slug).toBe('my-custom-url');
    expect(cleared.slug).toBe('new-title');
  });

  it('strips unsafe HTML from content and tags from excerpts', async () => {
    const post = await content.save(author, {
      type: 'post',
      title: 'XSS',
      content: '<p onclick="steal()">Hi<script>alert(1)</script> <a href="javascript:alert(1)">x</a> <a href="https://ok.test" target="_blank">ok</a></p>',
      excerpt: '<b>Short</b> summary',
      status: 'draft',
    });

    expect(post.content).toBe('<p>Hi <a>x</a> <a href="https://ok.test" target="_blank" rel="noopener noreferrer nofollow">ok</a></p>');
    expect(post.excerpt).toBe('Short summary');
  });

  it('turns publishing into a pending review for users who cannot publish', async () => {
    const post = await content.save(contributor, { type: 'post', title: 'Please review', status: 'publish' });

    expect(post.status).toBe('pending');
    expect(post.can.publish).toBe(false);
  });

  it('stops users editing content they do not own, or their own live content without the publish capability', async () => {
    const authorsPost = await content.save(author, { type: 'post', title: 'Mine', status: 'draft' });
    await expect(content.save(contributor, { id: authorsPost.id, type: 'post', title: 'Hijack', status: 'draft' })).rejects.toBeInstanceOf(AccessDenied);

    const contributorsPost = await content.save(contributor, { type: 'post', title: 'Mine too', status: 'draft' });
    await content.setStatus(admin, [contributorsPost.id], 'publish');
    await expect(content.get(contributor, contributorsPost.id)).rejects.toBeInstanceOf(AccessDenied);
    await expect(content.get(admin, contributorsPost.id)).resolves.toMatchObject({ status: 'publish' });
  });

  it('refuses subscribers entirely', async () => {
    const subscriber = await env.createActor('subscriber');
    await expect(content.save(subscriber, { type: 'post', title: 'Nope', status: 'draft' })).rejects.toBeInstanceOf(AccessDenied);
    await expect(content.list(subscriber, { type: 'post' })).rejects.toBeInstanceOf(AccessDenied);
  });

  it('rejects unknown types and statuses', async () => {
    await expect(content.save(admin, { type: 'widget', title: 'x', status: 'draft' })).rejects.toThrow('Unknown post type');
    await expect(content.save(admin, { type: 'post', title: 'x', status: 'trash' })).rejects.toThrow('valid status');
  });

  it('fires lifecycle hooks, including post.published only on the transition', async () => {
    const fired: string[] = [];
    for (const name of ['post.creating', 'post.created', 'post.updated', 'post.published']) {
      hooks.add_action(name, () => void fired.push(name));
    }
    const post = await content.save(author, { type: 'post', title: 'Hooks', status: 'publish' });
    await content.save(author, { id: post.id, type: 'post', title: 'Hooks again', status: 'publish' });

    expect(fired).toEqual(['post.creating', 'post.created', 'post.published', 'post.updated']);
  });
});

describe('categories and tags on posts', () => {
  it('creates missing tags, reuses existing ones, and counts only published posts', async () => {
    const draft = await content.save(author, { type: 'post', title: 'Draft', status: 'draft', tags: ['News', 'tips'] });
    const published = await content.save(author, { type: 'post', title: 'Live', status: 'publish', tags: ['news', ' Tips '] });

    expect(draft.tags.map((t) => t.name)).toEqual(['News', 'tips']);
    expect(published.tags.map((t) => t.id).sort()).toEqual(draft.tags.map((t) => t.id).sort());

    const tags = await content.terms.list('post_tag');
    expect(tags.map((t) => [t.name, t.count])).toEqual([['News', 1], ['tips', 1]]);
  });

  it('creates a new category from the editor only for users who manage categories', async () => {
    const post = await content.save(admin, { type: 'post', title: 'Cat', status: 'publish', newCategory: 'Travel' });
    expect(post.categories.map((c) => c.name)).toEqual(['Travel']);

    await expect(content.save(author, { type: 'post', title: 'Cat 2', status: 'draft', newCategory: 'Food' })).rejects.toBeInstanceOf(AccessDenied);
  });

  it('ignores category ids that are not categories', async () => {
    const tagged = await content.save(author, { type: 'post', title: 'T', status: 'draft', tags: ['oops'] });
    const post = await content.save(author, { type: 'post', title: 'P', status: 'draft', categoryIds: [tagged.tags[0].id, 9999] });

    expect(post.categories.map((c) => c.id)).toEqual([env.defaultCategoryId]);
  });

  it('gives pages no taxonomies', async () => {
    const page = await content.save(admin, { type: 'page', title: 'About', status: 'publish', tags: ['x'], newCategory: 'Nope' });
    expect(page.categories).toEqual([]);
    expect(page.tags).toEqual([]);
  });
});

describe('page hierarchy', () => {
  it('rejects a parent that would create a cycle', async () => {
    const parent = await content.save(admin, { type: 'page', title: 'Parent', status: 'publish' });
    const child = await content.save(admin, { type: 'page', title: 'Child', status: 'publish', parent: parent.id });

    expect(child.parent).toBe(parent.id);
    await expect(content.save(admin, { id: parent.id, type: 'page', title: 'Parent', status: 'publish', parent: child.id })).rejects.toThrow('own parent');
    await expect(content.save(admin, { type: 'page', title: 'Orphan', status: 'draft', parent: 9999 })).rejects.toThrow('does not exist');
  });
});

describe('trash lifecycle', () => {
  it('trashes, restores to the previous status, and keeps term counts right', async () => {
    const post = await content.save(author, { type: 'post', title: 'Lifecycle', status: 'publish', tags: ['life'] });

    expect(await content.trash(author, [post.id])).toEqual({ changed: 1, skipped: 0 });
    expect((await content.terms.list('post_tag'))[0].count).toBe(0);
    await expect(content.save(author, { id: post.id, type: 'post', title: 'x', status: 'draft' })).rejects.toThrow('trash');

    expect(await content.restore(author, [post.id])).toEqual({ changed: 1, skipped: 0 });
    expect((await content.get(author, post.id)).status).toBe('publish');
    expect((await content.terms.list('post_tag'))[0].count).toBe(1);
  });

  it('only deletes permanently from the trash, and takes revisions with it', async () => {
    const post = await content.save(author, { type: 'post', title: 'Doomed', content: '<p>v1</p>', status: 'draft' });
    await content.save(author, { id: post.id, type: 'post', title: 'Doomed', content: '<p>v2</p>', status: 'draft' });

    expect(await content.remove(author, [post.id])).toEqual({ changed: 0, skipped: 1 });
    await content.trash(author, [post.id]);
    expect(await content.remove(author, [post.id])).toEqual({ changed: 1, skipped: 0 });

    expect(await env.db.post.count()).toBe(0);
  });

  it('skips items the actor may not touch in bulk actions', async () => {
    const mine = await content.save(contributor, { type: 'post', title: 'Mine', status: 'draft' });
    const theirs = await content.save(author, { type: 'post', title: 'Theirs', status: 'draft' });

    expect(await content.trash(contributor, [mine.id, theirs.id, 424242])).toEqual({ changed: 1, skipped: 2 });
  });
});

describe('revisions', () => {
  it('records each change and restores an earlier version', async () => {
    const post = await content.save(author, { type: 'post', title: 'Rev', content: '<p>first</p>', status: 'draft' });
    await content.save(author, { id: post.id, type: 'post', title: 'Rev', content: '<p>first</p>', status: 'draft' });
    await content.save(author, { id: post.id, type: 'post', title: 'Rev', content: '<p>second</p>', status: 'draft' });

    const history = await content.revisions(author, post.id);
    expect(history).toHaveLength(2);

    const restored = await content.restoreRevision(author, history[1].id);
    expect(restored.content).toBe('<p>first</p>');
    expect(await content.revisions(author, post.id)).toHaveLength(3);
  });

  it('keeps only the ten most recent revisions', async () => {
    const post = await content.save(author, { type: 'post', title: 'Many', content: '<p>0</p>', status: 'draft' });
    for (let i = 1; i <= 12; i++) {
      await content.save(author, { id: post.id, type: 'post', title: 'Many', content: `<p>${i}</p>`, status: 'draft' });
    }
    expect(await content.revisions(author, post.id)).toHaveLength(10);
  });
});

describe('listing', () => {
  it('filters by status and search, paginates, and reports per-status counts', async () => {
    for (let i = 1; i <= 3; i++) await content.save(author, { type: 'post', title: `Published ${i}`, status: 'publish' });
    await content.save(author, { type: 'post', title: 'A draft', status: 'draft' });
    const trashed = await content.save(author, { type: 'post', title: 'Gone', status: 'draft' });
    await content.trash(author, [trashed.id]);

    const all = await content.list(admin, { type: 'post', perPage: 2 });
    expect(all.total).toBe(4);
    expect(all.pageCount).toBe(2);
    expect(all.items).toHaveLength(2);
    expect(all.counts).toEqual({ all: 4, publish: 3, draft: 1, pending: 0, private: 0, trash: 1 });

    expect((await content.list(admin, { type: 'post', status: 'trash' })).items.map((p) => p.title)).toEqual(['Gone']);
    expect((await content.list(admin, { type: 'post', search: 'draft' })).items.map((p) => p.title)).toEqual(['A draft']);
  });

  it('reports what each viewer may do per row', async () => {
    await content.save(admin, { type: 'post', title: 'Admin post', status: 'publish' });
    const [row] = (await content.list(contributor, { type: 'post' })).items;
    expect(row.can).toEqual({ edit: false, trash: false, delete: false, publish: false });
  });
});

describe('public reads', () => {
  it('returns only published items, with title and content filters applied', async () => {
    hooks.add_filter('post.title', (title: string) => title.toUpperCase());
    const live = await content.save(author, { type: 'post', title: 'Live one', content: '<p>Body</p>', status: 'publish' });
    const draft = await content.save(author, { type: 'post', title: 'Not yet', status: 'draft' });

    expect(await content.findPublished(live.slug)).toMatchObject({ title: 'LIVE ONE', content: '<p>Body</p>', excerpt: 'Body' });
    expect(await content.findPublished(draft.slug)).toBeNull();
    expect((await content.latestPublished()).map((p) => p.slug)).toEqual([live.slug]);
  });
});

describe('managing terms', () => {
  it('builds the category tree in order and refuses loops', async () => {
    const parent = await content.terms.create(admin, 'category', { name: 'Parent' });
    const child = await content.terms.create(admin, 'category', { name: 'Child', parent: parent.id });

    expect((await content.terms.list('category')).map((t) => [t.name, t.depth])).toEqual([
      ['Parent', 0],
      ['Child', 1],
      ['Uncategorized', 0],
    ]);
    await expect(content.terms.update(admin, parent.id, { name: 'Parent', parent: child.id })).rejects.toThrow('under itself');
    expect((await content.terms.list('category')).filter((t) => t.isDefault).map((t) => t.name)).toEqual(['Uncategorized']);
  });

  it('rejects duplicates and lets a tag share a name with a category', async () => {
    await content.terms.create(admin, 'category', { name: 'News' });
    await expect(content.terms.create(admin, 'category', { name: 'News' })).rejects.toThrow('already exists');

    const tag = await content.terms.create(admin, 'post_tag', { name: 'News' });
    expect(tag.slug).toBe('news-2');
  });

  it('moves posts to the default category when their only category is deleted', async () => {
    const travel = await content.terms.create(admin, 'category', { name: 'Travel' });
    const post = await content.save(author, { type: 'post', title: 'Trip', status: 'publish', categoryIds: [travel.id] });

    await content.terms.remove(admin, travel.id);
    expect((await content.get(author, post.id)).categories.map((c) => c.id)).toEqual([env.defaultCategoryId]);
    await expect(content.terms.remove(admin, env.defaultCategoryId)).rejects.toThrow('default category');
  });

  it('requires the matching capability', async () => {
    await expect(content.terms.create(author, 'category', { name: 'Nope' })).rejects.toBeInstanceOf(AccessDenied);
  });
});

describe('content cleanup', () => {
  it('drops trailing empty paragraphs the editor leaves behind', async () => {
    const post = await content.save(author, { type: 'post', title: 'Tidy', content: '<h2>Hi</h2><p>Body</p><p></p><p><br></p>', status: 'draft' });
    expect(post.content).toBe('<h2>Hi</h2><p>Body</p>');
  });

  it('builds a readable automatic excerpt from block content', async () => {
    await content.save(author, { type: 'post', title: 'Auto', content: '<h2>Intro</h2><p>First line.</p><ul><li><p>One</p></li><li><p>Two</p></li></ul>', status: 'publish' });
    const [post] = await content.latestPublished();
    expect(post.excerpt).toBe('Intro First line. One Two');
  });
});
