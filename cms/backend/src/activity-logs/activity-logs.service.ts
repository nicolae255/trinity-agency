import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogQueryDto } from './dto/activity-log-query.dto';
import { ActivityAction, ActivityEntity } from '@prisma/client';
import { PaginatedResult } from '../common/dto/pagination.dto';

export interface CreateActivityLogDto {
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string;
  entityTitle?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
}

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new activity log entry. Designed to be called from other services.
   * Errors are silently swallowed so that a logging failure never breaks a user action.
   */
  async log(dto: CreateActivityLogDto): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          action: dto.action,
          entity: dto.entity,
          entityId: dto.entityId,
          entityTitle: dto.entityTitle,
          details: dto.details ?? undefined,
          ipAddress: dto.ipAddress ?? 'unknown',
          userAgent: dto.userAgent ?? 'unknown',
          userId: dto.userId,
        },
      });
    } catch (err) {
      // Log to stderr but do not propagate; activity logging must not be a
      // critical failure path
      console.error('[ActivityLog] Failed to write log entry:', err);
    }
  }

  async findAll(
    query: ActivityLogQueryDto,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      perPage = 20,
      search,
      entity,
      action,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * perPage;

    const where: any = {};

    if (entity) {
      where.entity = entity;
    }

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { entityTitle: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.activityLog.count({ where }),
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
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

  async findByUser(
    userId: string,
    query: ActivityLogQueryDto,
  ): Promise<PaginatedResult<any>> {
    return this.findAll({ ...query, userId });
  }
}
