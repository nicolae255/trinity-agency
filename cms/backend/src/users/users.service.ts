import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { hashPassword } from '../common/utils/hash.util';
import { Role, User } from '@prisma/client';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

type UserWithoutPassword = Omit<User, 'password' | 'refreshTokenHash' | 'passwordResetToken' | 'passwordResetExpires'>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<UserWithoutPassword>> {
    const { page = 1, perPage = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * perPage;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return {
      data: users as unknown as UserWithoutPassword[],
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

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto, currentUser: JwtPayload) {
    if (
      dto.role === Role.SUPER_ADMIN &&
      currentUser.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Only Super Admin can create Super Admins');
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto, currentUser: JwtPayload) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (
      user.role === Role.SUPER_ADMIN &&
      currentUser.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Cannot modify Super Admin');
    }

    const data: any = { ...dto };
    if (dto.password) {
      data.password = await hashPassword(dto.password);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, currentUser: JwtPayload) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.id === currentUser.sub) {
      throw new ForbiddenException('Cannot delete yourself');
    }

    if (
      user.role === Role.SUPER_ADMIN &&
      currentUser.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Cannot delete Super Admin');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
