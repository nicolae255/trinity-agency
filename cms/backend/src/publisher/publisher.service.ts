import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { renderPostHtml } from './templates/post.template';
import { renderBlogIndexHtml } from './templates/blog-index.template';
import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PublisherService {
  private readonly logger = new Logger(PublisherService.name);
  private readonly repoPath: string;
  private readonly baseUrl: string;
  private readonly git: SimpleGit;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.repoPath = path.resolve(
      __dirname,
      '../../..',
      this.configService.get<string>('SITE_REPO_PATH') || '../..',
    );
    this.baseUrl =
      this.configService.get<string>('SITE_BASE_URL') ||
      'https://foundagency.be';
    this.git = simpleGit(this.repoPath);
  }

  /**
   * Publish a post: render HTML, write to disk, regenerate index, git commit+push.
   */
  async publishPost(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        categories: { include: { category: true } },
        author: { select: { firstName: true, lastName: true } },
      },
    });

    if (!post || post.status !== 'PUBLISHED') {
      this.logger.warn(`Post ${postId} not found or not published, skipping.`);
      return;
    }

    const category =
      post.categories?.[0]?.category?.name || 'Marketing';
    const categorySlug =
      post.categories?.[0]?.category?.slug || 'strategy';

    const date = this.formatDate(post.publishedAt || post.createdAt);
    const readTime = this.estimateReadTime(post.contentHtml || '');

    const html = renderPostHtml({
      title: post.title,
      metaDescription: post.metaDescription || post.excerpt || '',
      slug: post.slug,
      category,
      categorySlug,
      content: post.contentHtml || '',
      date,
      readTime,
      ogTitle: post.ogTitle || undefined,
      ogDescription: post.ogDescription || undefined,
      baseUrl: this.baseUrl,
    });

    // Write file
    const postDir = path.join(this.repoPath, 'blog', post.slug);
    await fs.mkdir(postDir, { recursive: true });
    await fs.writeFile(path.join(postDir, 'index.html'), html, 'utf-8');
    this.logger.log(`Written blog/${post.slug}/index.html`);

    // Regenerate blog index
    await this.regenerateBlogIndex();

    // Git commit and push
    await this.gitCommitAndPush(`Publish: ${post.title}`);
  }

  /**
   * Unpublish a post: remove the HTML file, regenerate index, git commit+push.
   */
  async unpublishPost(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) return;

    const postDir = path.join(this.repoPath, 'blog', post.slug);
    try {
      await fs.rm(postDir, { recursive: true });
      this.logger.log(`Removed blog/${post.slug}/`);
    } catch {
      // Directory might not exist
    }

    await this.regenerateBlogIndex();
    await this.gitCommitAndPush(`Unpublish: ${post.title}`);
  }

  /**
   * Regenerate blog/index.html from all published posts.
   */
  async regenerateBlogIndex(): Promise<void> {
    const posts = await this.prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      include: {
        categories: { include: { category: true } },
      },
    });

    const cards = posts.map((post) => {
      const category =
        post.categories?.[0]?.category?.name || 'Marketing';
      const categorySlug =
        post.categories?.[0]?.category?.slug || 'strategy';
      const date = this.formatDate(post.publishedAt || post.createdAt);
      const readTime = this.estimateReadTime(post.contentHtml || '');

      // Generate a short thumb label from the title (first 3-4 words or key phrase)
      const thumbLabel =
        post.excerpt?.split('.')[0]?.substring(0, 30) ||
        post.title.split(':')[0].trim();

      return {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || post.metaDescription || '',
        category,
        categorySlug,
        date,
        readTime,
        thumbLabel,
      };
    });

    const html = renderBlogIndexHtml(cards);
    const indexPath = path.join(this.repoPath, 'blog', 'index.html');
    await fs.writeFile(indexPath, html, 'utf-8');
    this.logger.log('Regenerated blog/index.html');
  }

  /**
   * Commit all changes in the blog/ directory and push to origin.
   */
  private async gitCommitAndPush(message: string): Promise<void> {
    try {
      const userName =
        this.configService.get<string>('GIT_USER_NAME') || 'Trinity CMS';
      const userEmail =
        this.configService.get<string>('GIT_USER_EMAIL') ||
        'cms@foundagency.be';

      await this.git.addConfig('user.name', userName, false, 'local');
      await this.git.addConfig('user.email', userEmail, false, 'local');

      await this.git.add('blog/*');
      const status = await this.git.status();

      if (status.staged.length === 0 && status.modified.length === 0) {
        this.logger.log('No changes to commit.');
        return;
      }

      await this.git.commit(message);
      await this.git.push('origin', 'main');
      this.logger.log(`Pushed: ${message}`);
    } catch (error) {
      this.logger.error(`Git push failed: ${error.message}`, error.stack);
      // Don't throw — the post is still published in the DB, just not deployed yet
    }
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private estimateReadTime(html: string): string {
    const text = html.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 250));
    return `${minutes} min read`;
  }
}
