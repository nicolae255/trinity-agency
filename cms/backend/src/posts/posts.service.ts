import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { generateSlug } from '../common/utils/slug.util';
import { ContentStatus, Role } from '@prisma/client';
import { PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a unique slug for a post. Appends -1, -2, etc. on collision.
   */
  private async generateUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.post.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Builds the Prisma include object for post queries.
   */
  private get postInclude() {
    return {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      featuredImage: {
        select: { id: true, url: true, altText: true, filename: true },
      },
      categories: {
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    };
  }

  async create(dto: CreatePostDto, user: JwtPayload): Promise<any> {
    const baseSlug = dto.slug
      ? generateSlug(dto.slug)
      : generateSlug(dto.title);

    const slug = await this.generateUniqueSlug(baseSlug);

    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content ?? undefined,
        contentHtml: dto.contentHtml,
        status: dto.status ?? ContentStatus.DRAFT,
        featuredImageId: dto.featuredImageId,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        ogTitle: dto.ogTitle,
        ogDescription: dto.ogDescription,
        canonicalUrl: dto.canonicalUrl,
        ogImageId: dto.ogImageId,
        authorId: user.sub,
        publishedAt:
          dto.status === ContentStatus.PUBLISHED ? new Date() : null,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        // Connect categories
        categories: dto.categoryIds?.length
          ? {
              create: dto.categoryIds.map((categoryId) => ({
                category: { connect: { id: categoryId } },
              })),
            }
          : undefined,
        // Connect tags
        tags: dto.tagIds?.length
          ? {
              create: dto.tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: this.postInclude,
    });

    return post;
  }

  async findAll(query: PostQueryDto): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      perPage = 20,
      search,
      status,
      categoryId,
      tagId,
      authorId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * perPage;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (categoryId) {
      where.categories = {
        some: { categoryId },
      };
    }

    if (tagId) {
      where.tags = {
        some: { tagId },
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { [sortBy]: sortOrder },
        include: this.postInclude,
      }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return {
      data,
      meta: {
        total,
        page,
        perPage,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        ...this.postInclude,
        ogImage: {
          select: { id: true, url: true, altText: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    return post;
  }

  async findBySlug(slug: string): Promise<any> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        ...this.postInclude,
        ogImage: {
          select: { id: true, url: true, altText: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    return post;
  }

  async update(id: string, dto: UpdatePostDto, user: JwtPayload): Promise<any> {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    // Authors may only update their own posts
    if (user.role === Role.AUTHOR && post.authorId !== user.sub) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    let slug = post.slug;

    if (dto.slug && dto.slug !== post.slug) {
      slug = await this.generateUniqueSlug(generateSlug(dto.slug), id);
    }

    const updateData: any = { slug };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.excerpt !== undefined) updateData.excerpt = dto.excerpt;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.contentHtml !== undefined) updateData.contentHtml = dto.contentHtml;
    if (dto.featuredImageId !== undefined)
      updateData.featuredImageId = dto.featuredImageId;
    if (dto.metaTitle !== undefined) updateData.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined)
      updateData.metaDescription = dto.metaDescription;
    if (dto.ogTitle !== undefined) updateData.ogTitle = dto.ogTitle;
    if (dto.ogDescription !== undefined)
      updateData.ogDescription = dto.ogDescription;
    if (dto.canonicalUrl !== undefined)
      updateData.canonicalUrl = dto.canonicalUrl;
    if (dto.ogImageId !== undefined) updateData.ogImageId = dto.ogImageId;
    if (dto.scheduledAt !== undefined)
      updateData.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;

    // Handle status transition
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (
        dto.status === ContentStatus.PUBLISHED &&
        post.status !== ContentStatus.PUBLISHED
      ) {
        updateData.publishedAt = new Date();
        updateData.scheduledAt = null;
      }
    }

    // Handle category reconnection by deleting existing and recreating
    if (dto.categoryIds !== undefined) {
      updateData.categories = {
        deleteMany: {},
        create: dto.categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      };
    }

    // Handle tag reconnection by deleting existing and recreating
    if (dto.tagIds !== undefined) {
      updateData.tags = {
        deleteMany: {},
        create: dto.tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      };
    }

    const updated = await this.prisma.post.update({
      where: { id },
      data: updateData,
      include: this.postInclude,
    });

    return updated;
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    await this.prisma.post.delete({ where: { id } });
  }

  async publish(id: string, user: JwtPayload): Promise<any> {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    if (user.role === Role.AUTHOR && post.authorId !== user.sub) {
      throw new ForbiddenException('You can only publish your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: post.publishedAt ?? new Date(),
        scheduledAt: null,
      },
      include: this.postInclude,
    });
  }

  async unpublish(id: string, user: JwtPayload): Promise<any> {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    if (user.role === Role.AUTHOR && post.authorId !== user.sub) {
      throw new ForbiddenException('You can only unpublish your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: { status: ContentStatus.DRAFT },
      include: this.postInclude,
    });
  }

  async schedule(
    id: string,
    scheduledAt: string,
    user: JwtPayload,
  ): Promise<any> {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    if (user.role === Role.AUTHOR && post.authorId !== user.sub) {
      throw new ForbiddenException('You can only schedule your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        scheduledAt: new Date(scheduledAt),
        status: ContentStatus.DRAFT,
      },
      include: this.postInclude,
    });
  }

  /**
   * Cron job: runs every minute to publish scheduled posts whose scheduledAt
   * datetime has passed while status is still DRAFT.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduledPosts(): Promise<void> {
    const now = new Date();

    const scheduledPosts = await this.prisma.post.findMany({
      where: {
        status: ContentStatus.DRAFT,
        scheduledAt: {
          lte: now,
        },
      },
      select: { id: true },
    });

    if (scheduledPosts.length === 0) return;

    const ids = scheduledPosts.map((p) => p.id);

    await this.prisma.post.updateMany({
      where: { id: { in: ids } },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: now,
        scheduledAt: null,
      },
    });
  }
}
