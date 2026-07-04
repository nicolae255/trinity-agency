import { IsOptional, IsEnum, IsUUID, IsString } from 'class-validator';
import { ContentStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class PostQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  tagId?: string;

  @IsOptional()
  @IsString()
  authorId?: string;
}
