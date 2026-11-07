import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaClient: PrismaClient;

function createPrismaClient() {
  let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  let provider = process.env.DATABASE_PROVIDER || 'sqlite';

  try {
    const configPath = path.resolve(process.cwd(), 'kodpress-config.json');
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (configData.database) {
        if (configData.database.url) dbUrl = configData.database.url;
        if (configData.database.provider) provider = configData.database.provider;
      }
    }
  } catch (e) {
    // Fail silently during initial install when config file does not exist
  }
  
  if (dbUrl.startsWith('file:') || dbUrl.includes('.db') || provider === 'sqlite') {
    const adapter = new PrismaBetterSqlite3({ url: dbUrl });
    return new PrismaClient({ adapter });
  }
  
  // Fallbacks for other providers will be fully implemented in Phase 2
  throw new Error(`Unsupported database provider or URL: ${dbUrl}. Phase 1 currently supports SQLite.`);
}

if (process.env.NODE_ENV === 'production') {
  prismaClient = createPrismaClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  prismaClient = globalForPrisma.prisma;
}

export const db = prismaClient;
