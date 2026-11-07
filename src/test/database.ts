import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import type { Actor } from '@/lib/access';
import type { RoleName } from '@/lib/roles';

/**
 * A throwaway SQLite database with every Prisma migration applied, so tests
 * run against the real schema rather than a mock.
 */
export async function createTestDatabase() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kodpress-test-'));
  const file = path.join(dir, 'test.db');

  const raw = new Database(file);
  const migrationsDir = path.resolve('prisma/migrations');
  const migrations = fs
    .readdirSync(migrationsDir)
    .filter((name) => fs.statSync(path.join(migrationsDir, name)).isDirectory())
    .sort();
  for (const name of migrations) {
    raw.exec(fs.readFileSync(path.join(migrationsDir, name, 'migration.sql'), 'utf8'));
  }
  raw.close();

  const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${file}` }) });

  // The seeded default category, as `prisma/seed.ts` creates it.
  const uncategorized = await db.term.create({
    data: { name: 'Uncategorized', slug: 'uncategorized', taxonomies: { create: { taxonomy: 'category' } } },
    include: { taxonomies: true },
  });
  await db.option.create({ data: { key: 'default_category', value: String(uncategorized.id) } });

  let userCount = 0;
  async function createActor(role: RoleName, displayName = `${role} ${++userCount}`): Promise<Actor> {
    const login = `${role}-${userCount}-${Math.random().toString(36).slice(2, 6)}`;
    const user = await db.user.create({
      data: {
        login,
        password: 'x',
        nicename: login,
        email: `${login}@example.test`,
        displayName,
        meta: { create: { key: 'capabilities', value: JSON.stringify({ [role]: true }) } },
      },
    });
    return { id: user.id, role };
  }

  return {
    db,
    createActor,
    defaultCategoryId: uncategorized.taxonomies[0].id,
    async cleanup() {
      await db.$disconnect();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}
