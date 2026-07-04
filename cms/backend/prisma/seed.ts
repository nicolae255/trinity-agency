import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Hashes a plain-text password using bcrypt with 12 salt rounds.
 */
async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

async function main(): Promise<void> {
  console.log('Starting seed...');

  // -------------------------------------------------------------------------
  // Super Admin user
  // -------------------------------------------------------------------------
  const adminEmail = 'admin@trinity-cms.com';
  const adminPassword = await hashPassword('Admin123!');

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      // Keep the password current in case it was changed externally
      password: adminPassword,
      role: Role.SUPER_ADMIN,
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
    },
  });

  console.log(`Upserted Super Admin: ${admin.email} (id: ${admin.id})`);

  // -------------------------------------------------------------------------
  // Sample Categories
  // -------------------------------------------------------------------------
  const categorySeed = [
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Articles and updates about the latest in tech',
    },
    {
      name: 'Design',
      slug: 'design',
      description: 'UI/UX, graphic design, and visual creativity',
    },
    {
      name: 'Business',
      slug: 'business',
      description: 'Entrepreneurship, strategy, and industry insights',
    },
  ];

  for (const cat of categorySeed) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
    console.log(`Upserted category: ${category.name} (id: ${category.id})`);
  }

  // -------------------------------------------------------------------------
  // Sample Tags
  // -------------------------------------------------------------------------
  const tagSeed = [
    { name: 'featured', slug: 'featured' },
    { name: 'trending', slug: 'trending' },
    { name: 'tutorial', slug: 'tutorial' },
  ];

  for (const tag of tagSeed) {
    const upsertedTag = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: {
        name: tag.name,
        slug: tag.slug,
      },
    });
    console.log(`Upserted tag: ${upsertedTag.name} (id: ${upsertedTag.id})`);
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
