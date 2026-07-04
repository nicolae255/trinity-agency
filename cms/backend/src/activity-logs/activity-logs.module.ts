import { Module } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsController } from './activity-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityLogsController],
  providers: [ActivityLogsService],
  // Export so other modules (auth, pages, posts, etc.) can inject and call log()
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
