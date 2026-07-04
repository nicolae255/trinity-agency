import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardStats {
  pages: number;
  posts: number;
  media: number;
  users: number;
  publishedPages: number;
  publishedPosts: number;
  draftPosts: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns aggregated counts for the main CMS entities.
   */
  async getStats(): Promise<DashboardStats> {
    const [
      pages,
      publishedPages,
      posts,
      publishedPosts,
      draftPosts,
      media,
      users,
    ] = await Promise.all([
      this.prisma.page.count(),
      this.prisma.page.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.post.count(),
      this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.post.count({ where: { status: 'DRAFT' } }),
      this.prisma.media.count(),
      this.prisma.user.count(),
    ]);

    return {
      pages,
      publishedPages,
      posts,
      publishedPosts,
      draftPosts,
      media,
      users,
    };
  }

  /**
   * Returns the 10 most recent activity log entries with their associated user.
   */
  async getRecentActivity(): Promise<any[]> {
    return this.prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
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
    });
  }
}
