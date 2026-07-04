import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class MediaQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  folder?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;
}
