import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/stats
   * Returns entity counts (pages, posts, media, users).
   * Accessible by any authenticated user.
   */
  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  /**
   * GET /dashboard/recent-activity
   * Returns the 10 most recent activity log entries.
   * Accessible by any authenticated user.
   */
  @Get('recent-activity')
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }
}
