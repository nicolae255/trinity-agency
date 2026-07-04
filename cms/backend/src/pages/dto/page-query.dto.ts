import { IsOptional, IsEnum } from 'class-validator';
import { ContentStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class PageQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
