import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsUrl,
  IsArray,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ContentStatus } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  excerpt?: string;

  @IsOptional()
  content?: Record<string, any>;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus = ContentStatus.DRAFT;

  @IsOptional()
  @IsUUID()
  featuredImageId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ogTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogDescription?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  canonicalUrl?: string;

  @IsOptional()
  @IsUUID()
  ogImageId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
