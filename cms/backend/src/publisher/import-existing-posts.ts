/**
 * One-time script to import existing blog posts from the static site into the CMS database.
 * Run with: npx ts-node src/publisher/import-existing-posts.ts
 */
import { PrismaClient, ContentStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ParsedPost {
  slug: string;
  title: string;
  metaDescription: string;
  category: string;
  categorySlug: string;
  content: string; // article body HTML
  date: string;
}

function parsePostHtml(slug: string, html: string): ParsedPost {
  // Extract title
  const titleMatch = html.match(/<h1>(.*?)<\/h1>/);
  const title = titleMatch ? titleMatch[1] : slug;

  // Extract meta description
  const metaMatch = html.match(
    /<meta\s+name="description"\s+content="([^"]+)"/,
  );
  const metaDescription = metaMatch ? metaMatch[1] : '';

  // Extract category (eyebrow)
  const eyebrowMatch = html.match(
    /<p class="eyebrow">(.*?)<\/p>/,
  );
  const category = eyebrowMatch ? eyebrowMatch[1] : 'Marketing';

  // Extract article body content
  const bodyMatch = html.match(
    /<div class="container article-body reveal">([\s\S]*?)<\/div>\s*<\/section>/,
  );
  const content = bodyMatch ? bodyMatch[1].trim() : '';

  // Extract date from article-meta
  const dateMatch = html.match(
    /<div class="article-meta">[\s\S]*?<span>(.*?)<\/span>\s*<span class="dot"><\/span>\s*<span>(.*?)<\/span>/,
  );
  const date = dateMatch ? dateMatch[2] : 'July 2026';

  return {
    slug,
    title,
    metaDescription,
    category,
    categorySlug: category.toLowerCase(),
    content,
    date,
  };
}

async function main() {
  const repoRoot = path.resolve(__dirname, '../../../..');
  const blogDir = path.join(repoRoot, 'blog');

  const slugs = fs
    .readdirSync(blogDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  console.log(`Found ${slugs.length} blog post directories: ${slugs.join(', ')}`);

  // Get or create a user to be the author
  const author = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (!author) {
    console.error('No SUPER_ADMIN user found. Run seed first.');
    process.exit(1);
  }

  for (const slug of slugs) {
    const htmlPath = path.join(blogDir, slug, 'index.html');
    if (!fs.existsSync(htmlPath)) continue;

    const html = fs.readFileSync(htmlPath, 'utf-8');
    const parsed = parsePostHtml(slug, html);

    // Find or create category
    let category = await prisma.category.findUnique({
      where: { slug: parsed.categorySlug },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: parsed.category,
          slug: parsed.categorySlug,
        },
      });
      console.log(`Created category: ${category.name}`);
    }

    // Check if post already exists
    const existing = await prisma.post.findUnique({
      where: { slug: parsed.slug },
    });

    if (existing) {
      console.log(`Post already exists: ${parsed.slug} — skipping`);
      continue;
    }

    const post = await prisma.post.create({
      data: {
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.metaDescription,
        contentHtml: parsed.content,
        content: undefined,
        metaDescription: parsed.metaDescription,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        authorId: author.id,
        categories: {
          create: [{ category: { connect: { id: category.id } } }],
        },
      },
    });

    console.log(`Imported: ${post.title} (${post.slug})`);
  }

  console.log('Import complete.');
}

main()
  .catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
