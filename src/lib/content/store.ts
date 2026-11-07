import type { Prisma, PrismaClient } from '@prisma/client';
import { AccessDenied, assertCan, can, type Actor } from '@/lib/access';
import type { HookServer } from '@/lib/hooks';
import { getPostType, supports, type PostTypeDefinition } from './post-types';
import { sanitizeContent, toPlainText } from './sanitize';
import { slugify, uniqueSlug } from './slug';
import { TAXONOMIES, type TaxonomyName } from './taxonomies';

/**
 * Content module — owns posts and pages: listing, drafting, publishing,
 * slugging, revisions, trash, and category/tag assignment. Every operation is
 * performed on behalf of an Actor and refuses what that Actor may not do, so
 * Server Actions only translate forms into calls.
 *
 * Term ids in this interface are TermTaxonomy ids (WordPress `term_taxonomy_id`).
 */

export const POST_STATUSES = ['publish', 'draft', 'pending', 'private', 'trash'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
export type EditableStatus = Exclude<PostStatus, 'trash'>;

const MAX_REVISIONS = 10;
const TRASH_STATUS_META = '_trash_meta_status';

export class ContentError extends Error {
  constructor(
    message: string,
    readonly code: 'not_found' | 'invalid',
  ) {
    super(message);
    this.name = 'ContentError';
  }
}

export interface TermRef {
  id: number;
  name: string;
  slug: string;
}

export interface TermView extends TermRef {
  taxonomy: TaxonomyName;
  description: string;
  parent: number;
  count: number;
  /** Nesting depth in the category tree (0 for top level and for tags). */
  depth: number;
}

export interface PostPermissions {
  edit: boolean;
  trash: boolean;
  delete: boolean;
  publish: boolean;
}

export interface PostSummary {
  id: number;
  type: string;
  title: string;
  slug: string;
  status: PostStatus;
  date: Date;
  modified: Date;
  author: { id: number; displayName: string };
  parent: number;
  menuOrder: number;
  categories: TermRef[];
  tags: TermRef[];
  commentCount: number;
  can: PostPermissions;
}

export interface PostDetail extends PostSummary {
  content: string;
  excerpt: string;
  commentStatus: 'open' | 'closed';
  pingStatus: 'open' | 'closed';
}

export interface RevisionSummary {
  id: number;
  date: Date;
  title: string;
  author: { id: number; displayName: string };
}

export interface ListQuery {
  type: string;
  status?: PostStatus | 'all';
  search?: string;
  categoryId?: number;
  tagId?: number;
  authorId?: number;
  page?: number;
  perPage?: number;
}

export interface ListResult {
  items: PostSummary[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  /** Per-status totals for the type, ignoring search and filters. `all` excludes trash. */
  counts: Record<PostStatus | 'all', number>;
}

export interface SaveInput {
  id?: number;
  type: string;
  title: string;
  content?: string;
  excerpt?: string;
  /** Blank means "generate from the title". */
  slug?: string;
  status: EditableStatus;
  commentStatus?: 'open' | 'closed';
  pingStatus?: 'open' | 'closed';
  parent?: number;
  menuOrder?: number;
  categoryIds?: number[];
  /** Name of a category to create and assign (needs `manage_categories`). */
  newCategory?: string;
  /** Tag names; missing tags are created. */
  tags?: string[];
}

export interface PublicPost {
  id: number;
  type: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: Date;
  author: { displayName: string };
  categories: TermRef[];
  tags: TermRef[];
}

export interface BulkResult {
  changed: number;
  skipped: number;
}

export interface TermInput {
  name: string;
  slug?: string;
  description?: string;
  parent?: number;
}

export interface ContentStoreDeps {
  db: PrismaClient;
  hooks: HookServer;
}

type Tx = Prisma.TransactionClient;

const postInclude = {
  author: { select: { id: true, displayName: true } },
  termRelationships: { include: { termTaxonomy: { include: { term: true } } } },
} satisfies Prisma.PostInclude;

type PostRow = Prisma.PostGetPayload<{ include: typeof postInclude }>;

function requireType(name: string): PostTypeDefinition {
  const definition = getPostType(name);
  if (!definition) throw new ContentError(`Unknown post type "${name}".`, 'invalid');
  return definition;
}

function isStatus(value: string): value is PostStatus {
  return (POST_STATUSES as readonly string[]).includes(value);
}

function isEditableStatus(value: string): value is EditableStatus {
  return isStatus(value) && value !== 'trash';
}

function isLive(status: string): boolean {
  return status === 'publish' || status === 'private';
}

function permissionsFor(actor: Actor, post: { authorId: number; status: string }, definition: PostTypeDefinition): PostPermissions {
  const own = post.authorId === actor.id;
  const publish = can(actor, definition.caps.publish);
  // Without the publish capability a user may not change content that is already live.
  const edit = own ? can(actor, definition.caps.edit) && (!isLive(post.status) || publish) : can(actor, definition.caps.editOthers);
  const remove = own
    ? can(actor, definition.caps.delete) && (!isLive(post.status) || publish)
    : can(actor, definition.caps.editOthers) && can(actor, definition.caps.delete);
  return { edit, trash: remove, delete: remove, publish: publish && edit };
}

function termRefs(row: PostRow, taxonomy: TaxonomyName): TermRef[] {
  return row.termRelationships
    .filter((rel) => rel.termTaxonomy.taxonomy === taxonomy)
    .map((rel) => ({ id: rel.termTaxonomy.id, name: rel.termTaxonomy.term.name, slug: rel.termTaxonomy.term.slug }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function toSummary(actor: Actor, row: PostRow, definition: PostTypeDefinition): PostSummary {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    slug: row.slug,
    status: isStatus(row.status) ? row.status : 'draft',
    date: row.date,
    modified: row.modified,
    author: row.author,
    parent: row.parent,
    menuOrder: row.menuOrder,
    categories: termRefs(row, 'category'),
    tags: termRefs(row, 'post_tag'),
    commentCount: row.commentCount,
    can: permissionsFor(actor, row, definition),
  };
}

function toDetail(actor: Actor, row: PostRow, definition: PostTypeDefinition): PostDetail {
  return {
    ...toSummary(actor, row, definition),
    content: row.content,
    excerpt: row.excerpt,
    commentStatus: row.commentStatus === 'closed' ? 'closed' : 'open',
    pingStatus: row.pingStatus === 'closed' ? 'closed' : 'open',
  };
}

function cleanIds(ids: readonly number[]): number[] {
  return [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))];
}

export function createContentStore({ db, hooks }: ContentStoreDeps) {
  // ─── internal helpers ────────────────────────────────────────────────

  async function loadRow(id: number, client: Tx | PrismaClient = db): Promise<PostRow | null> {
    return client.post.findUnique({ where: { id }, include: postInclude });
  }

  async function loadEditable(actor: Actor, id: number) {
    const row = await loadRow(id);
    const definition = row ? getPostType(row.type) : null;
    if (!row || !definition) throw new ContentError('That item no longer exists.', 'not_found');
    return { row, definition, can: permissionsFor(actor, row, definition) };
  }

  async function uniquePostSlug(base: string, excludeId: number | undefined, client: Tx): Promise<string> {
    return uniqueSlug(base, async (candidate) => {
      const hit = await client.post.findFirst({
        where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
        select: { id: true },
      });
      return hit !== null;
    });
  }

  async function uniqueTermSlug(base: string, excludeTermId: number | undefined, client: Tx | PrismaClient): Promise<string> {
    return uniqueSlug(base, async (candidate) => {
      const hit = await client.term.findFirst({
        where: { slug: candidate, ...(excludeTermId ? { NOT: { id: excludeTermId } } : {}) },
        select: { id: true },
      });
      return hit !== null;
    });
  }

  async function defaultCategoryId(client: Tx | PrismaClient): Promise<number | null> {
    const option = await client.option.findUnique({ where: { key: 'default_category' } });
    const termId = Number(option?.value);
    if (!Number.isInteger(termId)) return null;
    const tt = await client.termTaxonomy.findUnique({ where: { termId_taxonomy: { termId, taxonomy: 'category' } } });
    return tt?.id ?? null;
  }

  /** Term counts are the number of published objects in the term, as in WordPress. */
  async function recount(termTaxonomyIds: Iterable<number>, client: Tx | PrismaClient) {
    for (const id of new Set(termTaxonomyIds)) {
      const count = await client.termRelationship.count({ where: { termTaxonomyId: id, post: { status: 'publish' } } });
      await client.termTaxonomy.update({ where: { id }, data: { count } });
    }
  }

  async function createTermRow(client: Tx | PrismaClient, taxonomy: TaxonomyName, input: TermInput) {
    const name = input.name.trim().slice(0, 200);
    if (!name) throw new ContentError('A name is required.', 'invalid');
    const base = slugify(input.slug?.trim() || name) || taxonomy;

    const sameName = await client.termTaxonomy.findFirst({ where: { taxonomy, term: { OR: [{ slug: base }, { name }] } } });
    if (sameName) throw new ContentError(`A ${TAXONOMIES[taxonomy].singular.toLowerCase()} with that name already exists.`, 'invalid');

    let parent = 0;
    if (TAXONOMIES[taxonomy].hierarchical && input.parent) {
      const parentTt = await client.termTaxonomy.findFirst({ where: { id: input.parent, taxonomy } });
      if (!parentTt) throw new ContentError('The parent category does not exist.', 'invalid');
      parent = parentTt.id;
    }

    const term = await client.term.create({
      data: {
        name,
        slug: await uniqueTermSlug(base, undefined, client),
        taxonomies: { create: { taxonomy, description: input.description?.trim() ?? '', parent } },
      },
      include: { taxonomies: true },
    });
    return term.taxonomies[0];
  }

  async function resolveTags(client: Tx, names: readonly string[]): Promise<number[]> {
    const ids: number[] = [];
    for (const raw of names) {
      const name = raw.trim().slice(0, 200);
      if (!name) continue;
      const slug = slugify(name);
      const existing = await client.termTaxonomy.findFirst({
        where: { taxonomy: 'post_tag', term: { OR: [{ name }, ...(slug ? [{ slug }] : [])] } },
      });
      ids.push(existing ? existing.id : (await createTermRow(client, 'post_tag', { name })).id);
    }
    return cleanIds(ids);
  }

  async function assertValidParent(client: Tx, definition: PostTypeDefinition, postId: number | undefined, parent: number) {
    if (!parent) return;
    let cursor: number = parent;
    for (let depth = 0; cursor && depth < 100; depth++) {
      if (cursor === postId) throw new ContentError(`A ${definition.singular.toLowerCase()} cannot be its own parent.`, 'invalid');
      const row: { parent: number; type: string } | null = await client.post.findUnique({ where: { id: cursor }, select: { parent: true, type: true } });
      if (!row || row.type !== definition.name) throw new ContentError(`The parent ${definition.singular.toLowerCase()} does not exist.`, 'invalid');
      cursor = row.parent;
    }
  }

  async function saveRevision(client: Tx, actor: Actor, post: { id: number; title: string; content: string; excerpt: string }) {
    const latest = await client.post.findFirst({ where: { type: 'revision', parent: post.id }, orderBy: { id: 'desc' } });
    if (latest && latest.title === post.title && latest.content === post.content && latest.excerpt === post.excerpt) return;

    await client.post.create({
      data: {
        type: 'revision',
        status: 'inherit',
        parent: post.id,
        authorId: actor.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        // Revisions need a unique slug; a leading underscore can never come out of slugify().
        slug: `_rev-${post.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      },
    });

    const stale = await client.post.findMany({
      where: { type: 'revision', parent: post.id },
      orderBy: { id: 'desc' },
      skip: MAX_REVISIONS,
      select: { id: true },
    });
    if (stale.length) await client.post.deleteMany({ where: { id: { in: stale.map((r) => r.id) } } });
  }

  async function syncTerms(client: Tx, postId: number, definition: PostTypeDefinition, termTaxonomyIds: number[]) {
    const taxonomies = definition.taxonomies;
    if (!taxonomies.length) return [] as number[];
    const previous = await client.termRelationship.findMany({
      where: { objectId: postId, termTaxonomy: { taxonomy: { in: taxonomies } } },
      select: { termTaxonomyId: true },
    });
    await client.termRelationship.deleteMany({ where: { objectId: postId, termTaxonomyId: { in: previous.map((p) => p.termTaxonomyId) } } });
    if (termTaxonomyIds.length) {
      await client.termRelationship.createMany({ data: termTaxonomyIds.map((termTaxonomyId) => ({ objectId: postId, termTaxonomyId })) });
    }
    return [...previous.map((p) => p.termTaxonomyId), ...termTaxonomyIds];
  }

  async function termIdsOf(client: Tx | PrismaClient, postIds: number[]): Promise<number[]> {
    const rels = await client.termRelationship.findMany({ where: { objectId: { in: postIds } }, select: { termTaxonomyId: true } });
    return rels.map((r) => r.termTaxonomyId);
  }

  // ─── posts & pages ───────────────────────────────────────────────────

  async function list(actor: Actor, query: ListQuery): Promise<ListResult> {
    const definition = requireType(query.type);
    assertCan(actor, definition.caps.edit);

    const perPage = Math.min(Math.max(Math.trunc(query.perPage ?? 20), 1), 100);
    const page = Math.max(Math.trunc(query.page ?? 1), 1);
    const search = query.search?.trim();

    const where: Prisma.PostWhereInput = {
      type: definition.name,
      status: query.status && query.status !== 'all' ? query.status : { not: 'trash' },
      ...(query.authorId ? { authorId: query.authorId } : {}),
      ...(search ? { OR: [{ title: { contains: search } }, { slug: { contains: search } }] } : {}),
      AND: [
        ...(query.categoryId ? [{ termRelationships: { some: { termTaxonomyId: query.categoryId } } }] : []),
        ...(query.tagId ? [{ termRelationships: { some: { termTaxonomyId: query.tagId } } }] : []),
      ],
    };

    const [rows, total, grouped] = await Promise.all([
      db.post.findMany({
        where,
        include: postInclude,
        orderBy: definition.hierarchical ? [{ menuOrder: 'asc' }, { title: 'asc' }] : [{ date: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      db.post.count({ where }),
      db.post.groupBy({ by: ['status'], where: { type: definition.name }, _count: { _all: true } }),
    ]);

    const counts = { all: 0, publish: 0, draft: 0, pending: 0, private: 0, trash: 0 } satisfies ListResult['counts'];
    for (const group of grouped) {
      if (!isStatus(group.status)) continue;
      counts[group.status] = group._count._all;
      if (group.status !== 'trash') counts.all += group._count._all;
    }

    return {
      items: rows.map((row) => toSummary(actor, row, definition)),
      total,
      page,
      perPage,
      pageCount: Math.max(Math.ceil(total / perPage), 1),
      counts,
    };
  }

  async function get(actor: Actor, id: number): Promise<PostDetail> {
    const { row, definition, can: perms } = await loadEditable(actor, id);
    if (!perms.edit) throw new AccessDenied(`You are not allowed to edit this ${definition.singular.toLowerCase()}.`);
    return toDetail(actor, row, definition);
  }

  async function save(actor: Actor, input: SaveInput): Promise<PostDetail> {
    const definition = requireType(input.type);
    assertCan(actor, definition.caps.edit);

    const requestedStatus: string = input.status;
    if (!isEditableStatus(requestedStatus)) throw new ContentError('Choose a valid status.', 'invalid');
    let status: EditableStatus = requestedStatus;
    if (isLive(status) && !can(actor, definition.caps.publish)) status = 'pending';

    const existing = input.id ? await loadRow(input.id) : null;
    if (input.id && (!existing || existing.type !== definition.name)) {
      throw new ContentError('That item no longer exists.', 'not_found');
    }
    if (existing) {
      if (!permissionsFor(actor, existing, definition).edit) {
        throw new AccessDenied(`You are not allowed to edit this ${definition.singular.toLowerCase()}.`);
      }
      if (existing.status === 'trash') throw new ContentError('Restore it from the trash before editing.', 'invalid');
    }

    const title = input.title.trim().slice(0, 500);
    const content = supports(definition, 'editor') ? sanitizeContent(input.content ?? '') : '';
    const excerpt = supports(definition, 'excerpt') ? toPlainText(input.excerpt ?? '').slice(0, 2000) : '';
    const becomesPublic = status === 'publish' && existing?.status !== 'publish';

    const data = {
      title,
      content,
      excerpt,
      status,
      commentStatus: input.commentStatus ?? existing?.commentStatus ?? 'open',
      pingStatus: input.pingStatus ?? existing?.pingStatus ?? 'open',
      parent: definition.hierarchical ? Math.max(Math.trunc(input.parent ?? 0), 0) : 0,
      menuOrder: supports(definition, 'page-attributes') ? Math.trunc(input.menuOrder ?? 0) || 0 : 0,
    };

    await hooks.do_action(existing ? 'post.updating' : 'post.creating', { ...data, type: definition.name }, existing);

    const id = await db.$transaction(async (tx) => {
      await assertValidParent(tx, definition, existing?.id, data.parent);
      const slug = await uniquePostSlug(slugify(input.slug?.trim() || title) || definition.name, existing?.id, tx);

      let termTaxonomyIds: number[] = [];
      if (definition.taxonomies.includes('category')) {
        const requested = cleanIds(input.categoryIds ?? []);
        const valid = await tx.termTaxonomy.findMany({ where: { id: { in: requested }, taxonomy: 'category' }, select: { id: true } });
        termTaxonomyIds = valid.map((v) => v.id);
        const newCategory = input.newCategory?.trim();
        if (newCategory) {
          assertCan(actor, 'manage_categories', 'You are not allowed to create categories.');
          const existingCategory = await tx.termTaxonomy.findFirst({ where: { taxonomy: 'category', term: { name: newCategory } } });
          termTaxonomyIds.push(existingCategory ? existingCategory.id : (await createTermRow(tx, 'category', { name: newCategory })).id);
        }
        if (!termTaxonomyIds.length) {
          const fallback = await defaultCategoryId(tx);
          if (fallback) termTaxonomyIds.push(fallback);
        }
      }
      if (definition.taxonomies.includes('post_tag')) {
        termTaxonomyIds.push(...(await resolveTags(tx, input.tags ?? [])));
      }

      const now = new Date();
      const post = existing
        ? await tx.post.update({
            where: { id: existing.id },
            data: { ...data, slug, ...(becomesPublic ? { date: now, dateGmt: now } : {}) },
          })
        : await tx.post.create({ data: { ...data, slug, type: definition.name, authorId: actor.id, date: now, dateGmt: now } });

      const touched = await syncTerms(tx, post.id, definition, cleanIds(termTaxonomyIds));
      await recount(touched, tx);
      if (supports(definition, 'revisions')) await saveRevision(tx, actor, post);
      return post.id;
    });

    const saved = await loadRow(id);
    if (!saved) throw new ContentError('That item no longer exists.', 'not_found');
    const detail = toDetail(actor, saved, definition);
    await hooks.do_action(existing ? 'post.updated' : 'post.created', detail);
    if (becomesPublic) await hooks.do_action('post.published', detail);
    return detail;
  }

  async function setStatus(actor: Actor, ids: readonly number[], requested: string): Promise<BulkResult> {
    if (!isEditableStatus(requested)) throw new ContentError('Choose a valid status.', 'invalid');
    const result: BulkResult = { changed: 0, skipped: 0 };
    for (const id of cleanIds(ids)) {
      const row = await loadRow(id);
      const definition = row ? getPostType(row.type) : null;
      if (!row || !definition || row.status === 'trash' || !permissionsFor(actor, row, definition).edit) {
        result.skipped++;
        continue;
      }
      const status = isLive(requested) && !can(actor, definition.caps.publish) ? 'pending' : requested;
      const becomesPublic = status === 'publish' && row.status !== 'publish';
      const now = new Date();
      await db.post.update({ where: { id }, data: { status, ...(becomesPublic ? { date: now, dateGmt: now } : {}) } });
      await recount(await termIdsOf(db, [id]), db);
      result.changed++;
      if (becomesPublic) {
        const saved = await loadRow(id);
        if (saved) await hooks.do_action('post.published', toDetail(actor, saved, definition));
      }
    }
    return result;
  }

  async function trash(actor: Actor, ids: readonly number[]): Promise<BulkResult> {
    const result: BulkResult = { changed: 0, skipped: 0 };
    for (const id of cleanIds(ids)) {
      const row = await loadRow(id);
      const definition = row ? getPostType(row.type) : null;
      if (!row || !definition || row.status === 'trash' || !permissionsFor(actor, row, definition).trash) {
        result.skipped++;
        continue;
      }
      await db.$transaction(async (tx) => {
        await tx.postMeta.deleteMany({ where: { postId: id, key: TRASH_STATUS_META } });
        await tx.postMeta.create({ data: { postId: id, key: TRASH_STATUS_META, value: row.status } });
        await tx.post.update({ where: { id }, data: { status: 'trash' } });
        await recount(await termIdsOf(tx, [id]), tx);
      });
      result.changed++;
      await hooks.do_action('post.trashed', id);
    }
    return result;
  }

  async function restore(actor: Actor, ids: readonly number[]): Promise<BulkResult> {
    const result: BulkResult = { changed: 0, skipped: 0 };
    for (const id of cleanIds(ids)) {
      const row = await loadRow(id);
      const definition = row ? getPostType(row.type) : null;
      if (!row || !definition || row.status !== 'trash' || !permissionsFor(actor, row, definition).trash) {
        result.skipped++;
        continue;
      }
      await db.$transaction(async (tx) => {
        const meta = await tx.postMeta.findFirst({ where: { postId: id, key: TRASH_STATUS_META } });
        let status: string = meta?.value && isStatus(meta.value) && meta.value !== 'trash' ? meta.value : 'draft';
        if (isLive(status) && !can(actor, definition.caps.publish)) status = 'pending';
        await tx.post.update({ where: { id }, data: { status } });
        await tx.postMeta.deleteMany({ where: { postId: id, key: TRASH_STATUS_META } });
        await recount(await termIdsOf(tx, [id]), tx);
      });
      result.changed++;
      await hooks.do_action('post.restored', id);
    }
    return result;
  }

  /** Permanently deletes items that are already in the trash. */
  async function remove(actor: Actor, ids: readonly number[]): Promise<BulkResult> {
    const result: BulkResult = { changed: 0, skipped: 0 };
    for (const id of cleanIds(ids)) {
      const row = await loadRow(id);
      const definition = row ? getPostType(row.type) : null;
      if (!row || !definition || row.status !== 'trash' || !permissionsFor(actor, row, definition).delete) {
        result.skipped++;
        continue;
      }
      await db.$transaction(async (tx) => {
        const touched = await termIdsOf(tx, [id]);
        await tx.post.deleteMany({ where: { type: 'revision', parent: id } });
        await tx.post.updateMany({ where: { parent: id, type: row.type }, data: { parent: row.parent } });
        await tx.post.delete({ where: { id } });
        await recount(touched, tx);
      });
      result.changed++;
      await hooks.do_action('post.deleted', id);
    }
    return result;
  }

  async function revisions(actor: Actor, postId: number): Promise<RevisionSummary[]> {
    const { can: perms, definition } = await loadEditable(actor, postId);
    if (!perms.edit) throw new AccessDenied(`You are not allowed to edit this ${definition.singular.toLowerCase()}.`);
    const rows = await db.post.findMany({
      where: { type: 'revision', parent: postId },
      orderBy: { id: 'desc' },
      include: { author: { select: { id: true, displayName: true } } },
    });
    return rows.map((r) => ({ id: r.id, date: r.date, title: r.title, author: r.author }));
  }

  async function restoreRevision(actor: Actor, revisionId: number): Promise<PostDetail> {
    const revision = await db.post.findUnique({ where: { id: revisionId } });
    if (!revision || revision.type !== 'revision') throw new ContentError('That revision no longer exists.', 'not_found');
    const current = await get(actor, revision.parent);
    if (current.status === 'trash') throw new ContentError('Restore it from the trash before editing.', 'invalid');
    return save(actor, {
      id: current.id,
      type: current.type,
      title: revision.title,
      content: revision.content,
      excerpt: revision.excerpt,
      slug: current.slug,
      status: current.status,
      commentStatus: current.commentStatus,
      pingStatus: current.pingStatus,
      parent: current.parent,
      menuOrder: current.menuOrder,
      categoryIds: current.categories.map((c) => c.id),
      tags: current.tags.map((t) => t.name),
    });
  }

  /** Total non-trashed items per post type, for dashboards and menus. */
  async function totals(): Promise<Record<string, number>> {
    const grouped = await db.post.groupBy({ by: ['type'], where: { status: { not: 'trash' }, type: { not: 'revision' } }, _count: { _all: true } });
    return Object.fromEntries(grouped.map((g) => [g.type, g._count._all]));
  }

  // ─── public reads (no Actor) ─────────────────────────────────────────

  async function toPublic(row: PostRow): Promise<PublicPost> {
    return {
      id: row.id,
      type: row.type,
      slug: row.slug,
      title: await hooks.apply_filters('post.title', row.title, row),
      content: await hooks.apply_filters('post.content', row.content, row),
      excerpt: row.excerpt || toPlainText(row.content).slice(0, 280),
      date: row.date,
      author: { displayName: row.author.displayName },
      categories: termRefs(row, 'category'),
      tags: termRefs(row, 'post_tag'),
    };
  }

  async function findPublished(slug: string): Promise<PublicPost | null> {
    const row = await db.post.findFirst({ where: { slug, status: 'publish' }, include: postInclude });
    if (!row || !getPostType(row.type)?.public) return null;
    return toPublic(row);
  }

  async function latestPublished(options: { type?: string; limit?: number } = {}): Promise<PublicPost[]> {
    const rows = await db.post.findMany({
      where: { type: options.type ?? 'post', status: 'publish' },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take: Math.min(Math.max(options.limit ?? 10, 1), 50),
      include: postInclude,
    });
    return Promise.all(rows.map(toPublic));
  }

  // ─── categories & tags ───────────────────────────────────────────────

  async function listTerms(taxonomy: TaxonomyName, options: { search?: string } = {}): Promise<TermView[]> {
    const search = options.search?.trim();
    const rows = await db.termTaxonomy.findMany({
      where: { taxonomy, ...(search ? { term: { name: { contains: search } } } : {}) },
      include: { term: true },
    });
    const views = rows
      .map((r) => ({ id: r.id, name: r.term.name, slug: r.term.slug, taxonomy, description: r.description, parent: r.parent, count: r.count, depth: 0 }))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!TAXONOMIES[taxonomy].hierarchical || search) return views;

    // Depth-first order so children follow their parent.
    const byParent = new Map<number, TermView[]>();
    const ids = new Set(views.map((v) => v.id));
    for (const view of views) {
      const parent = ids.has(view.parent) ? view.parent : 0;
      byParent.set(parent, [...(byParent.get(parent) ?? []), view]);
    }
    const ordered: TermView[] = [];
    const walk = (parent: number, depth: number) => {
      for (const view of byParent.get(parent) ?? []) {
        if (ordered.includes(view)) continue;
        ordered.push({ ...view, depth });
        walk(view.id, depth + 1);
      }
    };
    walk(0, 0);
    return ordered;
  }

  async function createTerm(actor: Actor, taxonomy: TaxonomyName, input: TermInput): Promise<TermView> {
    assertCan(actor, TAXONOMIES[taxonomy].cap);
    const tt = await createTermRow(db, taxonomy, input);
    const view = (await listTerms(taxonomy)).find((t) => t.id === tt.id);
    if (!view) throw new ContentError('That term no longer exists.', 'not_found');
    return view;
  }

  async function updateTerm(actor: Actor, id: number, input: TermInput): Promise<TermView> {
    const tt = await db.termTaxonomy.findUnique({ where: { id }, include: { term: true } });
    if (!tt || !(tt.taxonomy in TAXONOMIES)) throw new ContentError('That term no longer exists.', 'not_found');
    const taxonomy = tt.taxonomy as TaxonomyName;
    assertCan(actor, TAXONOMIES[taxonomy].cap);

    const name = input.name.trim().slice(0, 200);
    if (!name) throw new ContentError('A name is required.', 'invalid');
    const duplicate = await db.termTaxonomy.findFirst({ where: { taxonomy, NOT: { id }, term: { name } } });
    if (duplicate) throw new ContentError(`A ${TAXONOMIES[taxonomy].singular.toLowerCase()} with that name already exists.`, 'invalid');

    let parent = 0;
    if (TAXONOMIES[taxonomy].hierarchical && input.parent) {
      // Refuse to move a category under itself or one of its descendants.
      for (let cursor = input.parent, depth = 0; cursor && depth < 100; depth++) {
        if (cursor === id) throw new ContentError('A category cannot be nested under itself.', 'invalid');
        const row = await db.termTaxonomy.findFirst({ where: { id: cursor, taxonomy } });
        if (!row) throw new ContentError('The parent category does not exist.', 'invalid');
        cursor = row.parent;
      }
      parent = input.parent;
    }

    const slug = await uniqueTermSlug(slugify(input.slug?.trim() || name) || taxonomy, tt.termId, db);
    await db.$transaction([
      db.term.update({ where: { id: tt.termId }, data: { name, slug } }),
      db.termTaxonomy.update({ where: { id }, data: { description: input.description?.trim() ?? tt.description, parent } }),
    ]);
    const view = (await listTerms(taxonomy)).find((t) => t.id === id);
    if (!view) throw new ContentError('That term no longer exists.', 'not_found');
    return view;
  }

  async function removeTerm(actor: Actor, id: number): Promise<void> {
    const tt = await db.termTaxonomy.findUnique({ where: { id } });
    if (!tt || !(tt.taxonomy in TAXONOMIES)) throw new ContentError('That term no longer exists.', 'not_found');
    const taxonomy = tt.taxonomy as TaxonomyName;
    assertCan(actor, TAXONOMIES[taxonomy].cap);

    await db.$transaction(async (tx) => {
      const fallback = taxonomy === 'category' ? await defaultCategoryId(tx) : null;
      if (fallback === id) throw new ContentError('The default category cannot be deleted.', 'invalid');

      const affected = await tx.termRelationship.findMany({ where: { termTaxonomyId: id }, select: { objectId: true } });
      await tx.termTaxonomy.updateMany({ where: { taxonomy, parent: id }, data: { parent: tt.parent } });
      await tx.termTaxonomy.delete({ where: { id } });
      const otherTaxonomies = await tx.termTaxonomy.count({ where: { termId: tt.termId } });
      if (!otherTaxonomies) await tx.term.delete({ where: { id: tt.termId } });

      // Posts left without a category fall back to the default one.
      if (fallback) {
        for (const { objectId } of affected) {
          const remaining = await tx.termRelationship.count({ where: { objectId, termTaxonomy: { taxonomy: 'category' } } });
          if (!remaining) await tx.termRelationship.create({ data: { objectId, termTaxonomyId: fallback } });
        }
        await recount([fallback], tx);
      }
    });
  }

  return {
    list,
    get,
    save,
    setStatus,
    trash,
    restore,
    remove,
    revisions,
    restoreRevision,
    totals,
    findPublished,
    latestPublished,
    terms: {
      list: listTerms,
      create: createTerm,
      update: updateTerm,
      remove: removeTerm,
    },
  };
}

export type ContentStore = ReturnType<typeof createContentStore>;
