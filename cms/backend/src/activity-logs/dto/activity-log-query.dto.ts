import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ActivityAction, ActivityEntity } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ActivityLogQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ActivityEntity)
  entity?: ActivityEntity;

  @IsOptional()
  @IsEnum(ActivityAction)
  action?: ActivityAction;

  @IsOptional()
  @IsString()
  userId?: string;
}
