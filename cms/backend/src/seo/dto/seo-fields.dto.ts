import { IsOptional, IsString, IsUUID, IsUrl, MaxLength } from 'class-validator';

/**
 * Reusable SEO fields DTO. Extend or compose this in any DTO that requires
 * SEO metadata (pages, posts, etc.).
 */
export class SeoFieldsDto {
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
}
