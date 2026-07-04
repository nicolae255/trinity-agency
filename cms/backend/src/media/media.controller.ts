import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaQueryDto } from './dto/media-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';
import { IsString, IsOptional, MaxLength } from 'class-validator';

class UpdateMetadataDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;
}

class CreateFolderDto {
  @IsString()
  @MaxLength(255)
  folder: string;
}

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * POST /media/upload
   * Upload a single file. Stored in-memory buffer then delegated to storage service.
   * Requires authenticated user (any role).
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB hard limit at multer level
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadMediaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided in the "file" field');
    }
    return this.mediaService.upload(file, uploadDto, user);
  }

  /**
   * GET /media
   * List all media with pagination and filters.
   */
  @Get()
  findAll(@Query() query: MediaQueryDto) {
    return this.mediaService.findAll(query);
  }

  /**
   * GET /media/folders
   * List all distinct folders in the media library.
   */
  @Get('folders')
  listFolders() {
    return this.mediaService.listFolders();
  }

  /**
   * POST /media/folders
   * Create a logical folder. Requires EDITOR or higher.
   */
  @Post('folders')
  @Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  createFolder(@Body() body: CreateFolderDto) {
    return this.mediaService.createFolder(body.folder);
  }

  /**
   * GET /media/:id
   * Get a single media item by UUID.
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.findOne(id);
  }

  /**
   * PUT /media/:id
   * Update media metadata (altText, caption). Requires EDITOR or higher.
   */
  @Put(':id')
  @Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  updateMetadata(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMetadataDto,
  ) {
    return this.mediaService.updateMetadata(id, dto);
  }

  /**
   * DELETE /media/:id
   * Delete a media item and its physical file. Requires ADMIN or higher.
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.remove(id);
  }
}
