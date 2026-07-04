import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateSlug } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a unique slug for a category.
   */
  private async generateUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.category.findUnique({
        where: { slug },
      });
      if (!existing || existing.id === excludeId) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async create(dto: CreateCategoryDto): Promise<any> {
    // Check for unique name
    const nameExists = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });
    if (nameExists) {
      throw new ConflictException(
        `A category with name "${dto.name}" already exists`,
      );
    }

    const baseSlug = dto.slug ? generateSlug(dto.slug) : generateSlug(dto.name);
    const slug = await this.generateUniqueSlug(baseSlug);

    // Verify parentId exists if provided
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent category with id "${dto.parentId}" not found`,
        );
      }
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        parentId: dto.parentId,
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  /**
   * Returns only root-level categories (no parent) with their full subtree.
   */
  async findTree(): Promise<any[]> {
    return this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      include: {
        children: {
          orderBy: { name: 'asc' },
          include: {
            children: {
              orderBy: { name: 'asc' },
              include: {
                _count: { select: { posts: true } },
              },
            },
            _count: { select: { posts: true } },
          },
        },
        _count: { select: { posts: true } },
      },
    });
  }

  async findOne(id: string): Promise<any> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return category;
  }

  async findBySlug(slug: string): Promise<any> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<any> {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    // Check name uniqueness if changing name
    if (dto.name && dto.name !== category.name) {
      const nameExists = await this.prisma.category.findUnique({
        where: { name: dto.name },
      });
      if (nameExists) {
        throw new ConflictException(
          `A category with name "${dto.name}" already exists`,
        );
      }
    }

    // Verify parentId if provided
    if (dto.parentId && dto.parentId !== category.parentId) {
      if (dto.parentId === id) {
        throw new ConflictException('A category cannot be its own parent');
      }
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent category with id "${dto.parentId}" not found`,
        );
      }
    }

    let slug = category.slug;
    if (dto.slug && dto.slug !== category.slug) {
      slug = await this.generateUniqueSlug(generateSlug(dto.slug), id);
    } else if (dto.name && dto.name !== category.name && !dto.slug) {
      slug = await this.generateUniqueSlug(generateSlug(dto.name), id);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        parentId: dto.parentId,
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    await this.prisma.category.delete({ where: { id } });
  }
}
