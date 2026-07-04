import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IStorageService, STORAGE_SERVICE } from './storage/storage.interface';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaQueryDto } from './dto/media-query.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { PaginatedResult } from '../common/dto/pagination.dto';

/** Allowed MIME types for upload */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
];

/** Maximum file size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  /**
   * Validates a file before processing.
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type "${file.mimetype}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds the maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024} MB`,
      );
    }
  }

  async upload(
    file: Express.Multer.File,
    dto: UploadMediaDto,
    user: JwtPayload,
  ): Promise<any> {
    this.validateFile(file);

    const folder = dto.folder || '/';

    // Upload to storage backend
    const result = await this.storageService.upload(file, folder);

    // Persist metadata to database
    const media = await this.prisma.media.create({
      data: {
        filename: result.filePath,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        width: result.width,
        height: result.height,
        url: result.url,
        altText: dto.altText,
        caption: dto.caption,
        folder,
        uploadedById: user.sub,
      },
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return media;
  }

  async findAll(query: MediaQueryDto): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      perPage = 20,
      search,
      folder,
      mimeType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * perPage;

    const where: any = {};

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (folder) {
      where.folder = folder;
    }

    if (mimeType) {
      // Support partial match, e.g. "image" matches "image/jpeg", "image/png"
      where.mimeType = { contains: mimeType, mode: 'insensitive' };
    }

    const [total, data] = await Promise.all([
      this.prisma.media.count({ where }),
      this.prisma.media.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { [sortBy]: sortOrder },
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return {
      data,
      meta: {
        total,
        page,
        perPage,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!media) {
      throw new NotFoundException(`Media with id "${id}" not found`);
    }

    return media;
  }

  async updateMetadata(
    id: string,
    dto: Partial<{ altText: string; caption: string }>,
  ): Promise<any> {
    const media = await this.prisma.media.findUnique({ where: { id } });

    if (!media) {
      throw new NotFoundException(`Media with id "${id}" not found`);
    }

    return this.prisma.media.update({
      where: { id },
      data: {
        altText: dto.altText,
        caption: dto.caption,
      },
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    const media = await this.prisma.media.findUnique({ where: { id } });

    if (!media) {
      throw new NotFoundException(`Media with id "${id}" not found`);
    }

    // Delete physical file from storage
    try {
      await this.storageService.delete(media.filename);
    } catch (err) {
      this.logger.error(
        `Failed to delete file from storage: ${media.filename}`,
        err,
      );
      // Continue with DB deletion even if file removal fails
    }

    await this.prisma.media.delete({ where: { id } });
  }

  /**
   * Lists distinct folder paths present in the media library.
   */
  async listFolders(): Promise<string[]> {
    const results = await this.prisma.media.findMany({
      select: { folder: true },
      distinct: ['folder'],
      orderBy: { folder: 'asc' },
    });

    return results.map((r) => r.folder);
  }

  /**
   * Ensures a logical folder exists by creating a placeholder entry or
   * simply returns confirmation. Folders are virtual in local storage.
   */
  async createFolder(folder: string): Promise<{ folder: string }> {
    if (!folder || folder.trim() === '') {
      throw new BadRequestException('Folder name cannot be empty');
    }
    // Normalise: ensure leading slash
    const normalised = folder.startsWith('/') ? folder : `/${folder}`;
    return { folder: normalised };
  }
}
