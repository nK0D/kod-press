import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Database seeding starting...');

  // 1. Create Default Options if they don't exist
  const defaultOptions = [
    { key: 'siteurl', value: 'http://localhost:3000' },
    { key: 'blogname', value: 'My KodPress Site' },
    { key: 'blogdescription', value: 'Just another KodPress site' },
    { key: 'admin_email', value: 'admin@example.com' },
    { key: 'permalink_structure', value: '/%postname%/' },
    { key: 'category_base', value: 'category' },
    { key: 'tag_base', value: 'tag' },
    { key: 'active_theme', value: 'kodpress-default' },
    { key: 'active_plugins', value: '[]' },
    { key: 'posts_per_page', value: '10' },
    { key: 'date_format', value: 'MMMM d, yyyy' },
    { key: 'time_format', value: 'h:mm a' },
    { key: 'timezone_string', value: 'UTC' },
    { key: 'default_category', value: '1' },
    { key: 'default_comment_status', value: 'open' },
    { key: 'show_avatars', value: '1' },
    { key: 'avatar_default', value: 'mystery' },
    { key: 'comment_moderation', value: '0' },
    { key: 'show_on_front', value: 'posts' },
    { key: 'kodpress_version', value: '1.0.0' },
  ];

  for (const opt of defaultOptions) {
    const existing = await db.option.findUnique({ where: { key: opt.key } });
    if (!existing) {
      await db.option.create({
        data: {
          key: opt.key,
          value: opt.value,
        },
      });
      console.log(`- Seeded option: ${opt.key}`);
    }
  }

  // 2. Seed Default Category
  const defaultCategorySlug = 'uncategorized';
  const existingTerm = await db.term.findUnique({
    where: { slug: defaultCategorySlug },
  });

  if (!existingTerm) {
    const term = await db.term.create({
      data: {
        name: 'Uncategorized',
        slug: defaultCategorySlug,
        taxonomies: {
          create: {
            taxonomy: 'category',
            description: 'Default category',
            parent: 0,
            count: 0,
          },
        },
      },
    });
    console.log(`- Seeded term: Uncategorized`);
    
    // Update default_category option to match this ID
    await db.option.upsert({
      where: { key: 'default_category' },
      update: { value: String(term.id) },
      create: { key: 'default_category', value: String(term.id) },
    });
  }

  // 3. Migrate Temporary Admin credentials to User table
  const tempUsernameOpt = await db.option.findUnique({ where: { key: 'temp_admin_username' } });
  const tempPasswordOpt = await db.option.findUnique({ where: { key: 'temp_admin_password_hash' } });
  const tempEmailOpt = await db.option.findUnique({ where: { key: 'temp_admin_email' } });

  if (tempUsernameOpt && tempPasswordOpt && tempEmailOpt) {
    const adminUsername = tempUsernameOpt.value;
    const adminPasswordHash = tempPasswordOpt.value;
    const adminEmail = tempEmailOpt.value;

    const existingUser = await db.user.findUnique({ where: { login: adminUsername } });
    if (!existingUser) {
      await db.user.create({
        data: {
          login: adminUsername,
          password: adminPasswordHash,
          nicename: adminUsername.toLowerCase(),
          email: adminEmail,
          displayName: 'Administrator',
          meta: {
            create: [
              { key: 'capabilities', value: JSON.stringify({ administrator: true }) },
              { key: 'user_level', value: '10' }
            ]
          }
        }
      });
      console.log(`- Created administrator user: ${adminUsername}`);
    }

    // Clean up temporary options so we don't try to migrate them again
    await db.option.delete({ where: { key: 'temp_admin_username' } });
    await db.option.delete({ where: { key: 'temp_admin_password_hash' } });
    await db.option.delete({ where: { key: 'temp_admin_email' } });
    console.log(`- Cleared temporary administrator options`);
  }

  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Prisma client will disconnect automatically
  });
