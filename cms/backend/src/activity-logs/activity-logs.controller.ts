import { Controller, Get, Query } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogQueryDto } from './dto/activity-log-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  /**
   * GET /activity-logs
   * List all activity logs with pagination and filters.
   * Requires ADMIN or SUPER_ADMIN role.
   */
  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findAll(@Query() query: ActivityLogQueryDto) {
    return this.activityLogsService.findAll(query);
  }

  /**
   * GET /activity-logs/me
   * Returns activity logs for the currently authenticated user.
   * Accessible by all authenticated users.
   */
  @Get('me')
  findMine(
    @Query() query: ActivityLogQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityLogsService.findByUser(user.sub, query);
  }
}
