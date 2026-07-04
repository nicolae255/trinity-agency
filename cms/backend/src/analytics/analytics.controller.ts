import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('analytics')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /analytics/overview
   * Returns high-level traffic statistics (mocked).
   */
  @Get('overview')
  getOverview() {
    return this.analyticsService.getOverview();
  }

  /**
   * GET /analytics/page-views?days=30
   * Returns daily page view counts for the specified number of days.
   * Defaults to 30 days.
   */
  @Get('page-views')
  getPageViews(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.analyticsService.getPageViews(days);
  }

  /**
   * GET /analytics/top-pages?limit=10
   * Returns the most-viewed pages.
   */
  @Get('top-pages')
  getTopPages(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.analyticsService.getTopPages(limit);
  }

  /**
   * GET /analytics/top-posts?limit=10
   * Returns the most-viewed posts.
   */
  @Get('top-posts')
  getTopPosts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.analyticsService.getTopPosts(limit);
  }
}
