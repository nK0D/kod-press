import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, databaseUrl } = body;

    if (!provider || !databaseUrl) {
      return NextResponse.json(
        { success: false, error: 'Database provider and connection URL are required.' },
        { status: 400 }
      );
    }

    // Check if the application is already installed
    try {
      const installedOpt = await db.option.findUnique({
        where: { key: 'kodpress_installed' },
      });
      if (installedOpt?.value === 'true') {
        return NextResponse.json(
          { success: false, error: 'KodPress is already installed.' },
          { status: 403 }
        );
      }
    } catch (e) {
      // Table might not exist yet, which is expected for fresh installs.
    }

    if (provider === 'sqlite') {
      try {
        const { PrismaClient } = await import('@prisma/client');
        const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
        
        const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
        const tempClient = new PrismaClient({ adapter });
        
        await tempClient.$queryRawUnsafe('SELECT 1');
        await tempClient.$disconnect();
        
        return NextResponse.json({ success: true, message: 'Database connection successful!' });
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: `SQLite Connection failed: ${err.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: `Database provider "${provider}" connection testing will be fully unlocked in Phase 2. Please use SQLite for Phase 1.` },
      { status: 400 }
    );

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
