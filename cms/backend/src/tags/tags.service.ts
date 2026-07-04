import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { generateSlug } from '../common/utils/slug.util';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a unique slug for a tag.
   */
  private async generateUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.tag.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async create(dto: CreateTagDto): Promise<any> {
    // Check for unique name
    const nameExists = await this.prisma.tag.findUnique({
      where: { name: dto.name },
    });
    if (nameExists) {
      throw new ConflictException(
        `A tag with name "${dto.name}" already exists`,
      );
    }

    const baseSlug = dto.slug ? generateSlug(dto.slug) : generateSlug(dto.name);
    const slug = await this.generateUniqueSlug(baseSlug);

    return this.prisma.tag.create({
      data: {
        name: dto.name,
        slug,
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async findOne(id: string): Promise<any> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with id "${id}" not found`);
    }

    return tag;
  }

  async findBySlug(slug: string): Promise<any> {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }

    return tag;
  }

  async update(id: string, dto: UpdateTagDto): Promise<any> {
    const tag = await this.prisma.tag.findUnique({ where: { id } });

    if (!tag) {
      throw new NotFoundException(`Tag with id "${id}" not found`);
    }

    // Check name uniqueness if changing name
    if (dto.name && dto.name !== tag.name) {
      const nameExists = await this.prisma.tag.findUnique({
        where: { name: dto.name },
      });
      if (nameExists) {
        throw new ConflictException(
          `A tag with name "${dto.name}" already exists`,
        );
      }
    }

    let slug = tag.slug;
    if (dto.slug && dto.slug !== tag.slug) {
      slug = await this.generateUniqueSlug(generateSlug(dto.slug), id);
    } else if (dto.name && dto.name !== tag.name && !dto.slug) {
      slug = await this.generateUniqueSlug(generateSlug(dto.name), id);
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        name: dto.name,
        slug,
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    const tag = await this.prisma.tag.findUnique({ where: { id } });

    if (!tag) {
      throw new NotFoundException(`Tag with id "${id}" not found`);
    }

    await this.prisma.tag.delete({ where: { id } });
  }
}
