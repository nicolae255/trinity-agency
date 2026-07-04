import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { generateSlug } from '../common/utils/slug.util';
import { ContentStatus, Role } from '@prisma/client';
import { PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a unique slug for a page. If the base slug already exists,
   * appends an incrementing numeric suffix (-1, -2, etc.).
   */
  private async generateUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.page.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async create(dto: CreatePageDto, user: JwtPayload): Promise<any> {
    const baseSlug = dto.slug
      ? generateSlug(dto.slug)
      : generateSlug(dto.title);

    const slug = await this.generateUniqueSlug(baseSlug);

    const page = await this.prisma.page.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content ?? undefined,
        contentHtml: dto.contentHtml,
        status: dto.status ?? ContentStatus.DRAFT,
        featuredImageId: dto.featuredImageId,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        ogTitle: dto.ogTitle,
        ogDescription: dto.ogDescription,
        canonicalUrl: dto.canonicalUrl,
        ogImageId: dto.ogImageId,
        authorId: user.sub,
        publishedAt:
          dto.status === ContentStatus.PUBLISHED ? new Date() : null,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        featuredImage: true,
      },
    });

    return page;
  }

  async findAll(query: PageQueryDto): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      perPage = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * perPage;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [total, data] = await Promise.all([
      this.prisma.page.count({ where }),
      this.prisma.page.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          featuredImage: {
            select: { id: true, url: true, altText: true, filename: true },
          },
          parent: {
            select: { id: true, title: true, slug: true },
          },
        },
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
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        featuredImage: true,
        ogImage: {
          select: { id: true, url: true, altText: true },
        },
        parent: {
          select: { id: true, title: true, slug: true },
        },
        children: {
          select: { id: true, title: true, slug: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!page) {
      throw new NotFoundException(`Page with id "${id}" not found`);
    }

    return page;
  }

  async findBySlug(slug: string): Promise<any> {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        featuredImage: true,
        ogImage: {
          select: { id: true, url: true, altText: true },
        },
        parent: {
          select: { id: true, title: true, slug: true },
        },
        children: {
          select: { id: true, title: true, slug: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }

    return page;
  }

  async update(id: string, dto: UpdatePageDto, user: JwtPayload): Promise<any> {
    const page = await this.prisma.page.findUnique({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with id "${id}" not found`);
    }

    // Authors can only edit their own pages
    if (user.role === Role.AUTHOR && page.authorId !== user.sub) {
      throw new ForbiddenException('You can only edit your own pages');
    }

    let slug = page.slug;

    if (dto.slug && dto.slug !== page.slug) {
      slug = await this.generateUniqueSlug(generateSlug(dto.slug), id);
    } else if (dto.title && dto.title !== page.title && !dto.slug) {
      // Only auto-regenerate slug if title changed and no explicit slug was provided
      // and the current slug was auto-generated from the original title
      const autoSlug = generateSlug(dto.title);
      if (autoSlug !== generateSlug(page.title)) {
        // Keep existing slug to avoid breaking URLs - only update if explicitly requested
      }
    }

    const updateData: any = {
      slug,
    };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.contentHtml !== undefined) updateData.contentHtml = dto.contentHtml;
    if (dto.featuredImageId !== undefined)
      updateData.featuredImageId = dto.featuredImageId;
    if (dto.parentId !== undefined) updateData.parentId = dto.parentId;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.metaTitle !== undefined) updateData.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined)
      updateData.metaDescription = dto.metaDescription;
    if (dto.ogTitle !== undefined) updateData.ogTitle = dto.ogTitle;
    if (dto.ogDescription !== undefined)
      updateData.ogDescription = dto.ogDescription;
    if (dto.canonicalUrl !== undefined)
      updateData.canonicalUrl = dto.canonicalUrl;
    if (dto.ogImageId !== undefined) updateData.ogImageId = dto.ogImageId;

    // Handle status transitions
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (
        dto.status === ContentStatus.PUBLISHED &&
        page.status !== ContentStatus.PUBLISHED
      ) {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await this.prisma.page.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        featuredImage: true,
      },
    });

    return updated;
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    const page = await this.prisma.page.findUnique({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with id "${id}" not found`);
    }

    // Only ADMIN and SUPER_ADMIN can delete (enforced at controller level via Roles guard)
    // Additional author check not needed here since delete requires Admin+

    await this.prisma.page.delete({ where: { id } });
  }

  async publish(id: string, user: JwtPayload): Promise<any> {
    const page = await this.prisma.page.findUnique({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with id "${id}" not found`);
    }

    if (user.role === Role.AUTHOR && page.authorId !== user.sub) {
      throw new ForbiddenException('You can only publish your own pages');
    }

    return this.prisma.page.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: page.publishedAt ?? new Date(),
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async unpublish(id: string, user: JwtPayload): Promise<any> {
    const page = await this.prisma.page.findUnique({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with id "${id}" not found`);
    }

    if (user.role === Role.AUTHOR && page.authorId !== user.sub) {
      throw new ForbiddenException('You can only unpublish your own pages');
    }

    return this.prisma.page.update({
      where: { id },
      data: { status: ContentStatus.DRAFT },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }
}
