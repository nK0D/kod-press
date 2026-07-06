import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, databaseUrl, siteName, siteTagline, siteEmail, adminUsername, adminPassword } = body;

    // Validate inputs
    if (!provider || !databaseUrl || !siteName || !siteTagline || !siteEmail || !adminUsername || !adminPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Check if already installed
    try {
      const installedOpt = await db.option.findUnique({
        where: { key: 'depot_installed' },
      });
      if (installedOpt?.value === 'true') {
        return NextResponse.json(
          { success: false, error: 'Depot is already installed.' },
          { status: 403 }
        );
      }
    } catch (e) {
      // Table might not exist yet, that's fine.
    }

    // 1. Update the .env file with database connection settings and generate AUTH_SECRET
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const dbUrlLine = `DATABASE_URL="${databaseUrl}"`;
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/, dbUrlLine);
    } else {
      envContent += `\n${dbUrlLine}`;
    }

    const dbProviderLine = `DATABASE_PROVIDER="${provider}"`;
    if (envContent.includes('DATABASE_PROVIDER=')) {
      envContent = envContent.replace(/DATABASE_PROVIDER=.*/, dbProviderLine);
    } else {
      envContent += `\n${dbProviderLine}`;
    }

    const authSecret = crypto.randomBytes(32).toString('hex');
    const authSecretLine = `AUTH_SECRET="${authSecret}"`;
    if (envContent.includes('AUTH_SECRET=')) {
      envContent = envContent.replace(/AUTH_SECRET=.*/, authSecretLine);
    } else {
      envContent += `\n${authSecretLine}`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');

    // 2. Programmatically run Prisma migrations to build tables (Option model)
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: `Migration deployment failed: ${err.message}` },
        { status: 500 }
      );
    }

    // Hash administrator password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 3. Write core settings to the Option table
    // Since Phase 1 has a minimal schema (Option table only), we store admin credentials
    // in temporary options. They will be seeded into the User table in Phase 2.
    const siteUrl = new URL(request.url).origin;

    const optionsToCreate = [
      { key: 'siteurl', value: siteUrl },
      { key: 'blogname', value: siteName },
      { key: 'blogdescription', value: siteTagline },
      { key: 'admin_email', value: siteEmail },
      { key: 'permalink_structure', value: '/%postname%/' },
      { key: 'active_theme', value: 'depot-default' },
      { key: 'active_plugins', value: '[]' },
      
      // Temporary Admin credentials to be migrated to User table in Phase 2
      { key: 'temp_admin_username', value: adminUsername },
      { key: 'temp_admin_password_hash', value: hashedPassword },
      { key: 'temp_admin_email', value: siteEmail },

      // Installation flag
      { key: 'depot_installed', value: 'true' },
    ];

    for (const opt of optionsToCreate) {
      await db.option.upsert({
        where: { key: opt.key },
        update: { value: opt.value },
        create: { key: opt.key, value: opt.value },
      });
    }

    // 4. Generate depot-config.json config file at the root
    const configPath = path.resolve(process.cwd(), 'depot-config.json');
    const configData = {
      installed: true,
      database: {
        provider,
        url: databaseUrl,
      },
      site: {
        title: siteName,
        tagline: siteTagline,
        email: siteEmail,
        url: siteUrl,
      }
    };
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: 'Installation completed successfully!' });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
