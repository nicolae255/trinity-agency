import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';
import { IStorageService, UploadResult } from './storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);

  /** Absolute path to the uploads root directory */
  private readonly uploadsRoot: string;

  /** Base URL prefix for serving uploaded files */
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsRoot = path.resolve(
      process.cwd(),
      this.configService.get<string>('UPLOADS_DIR', 'uploads'),
    );
    this.baseUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );

    // Ensure the root uploads directory exists on startup
    this.ensureDir(this.uploadsRoot);
  }

  /**
   * Creates a directory and all intermediate paths if they do not exist.
   */
  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Builds a year/month sub-directory path based on the current date
   * and optionally a user-supplied folder prefix.
   *
   * Example: folder="/avatars" -> "avatars/2024/01"
   */
  private buildStoragePath(folder: string): string {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Normalise folder: strip leading slash, default to root
    const normFolder = folder.replace(/^\/+/, '').trim();

    return normFolder
      ? path.join(normFolder, year, month)
      : path.join(year, month);
  }

  /**
   * Sanitises a filename to avoid path traversal or special character issues.
   */
  private sanitiseFilename(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const base = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
    const timestamp = Date.now();
    return `${base}-${timestamp}${ext}`;
  }

  /**
   * Attempts to read pixel dimensions from an image buffer using sharp.
   * Returns undefined values for non-image files.
   */
  private async getImageDimensions(
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ width?: number; height?: number }> {
    if (!mimeType.startsWith('image/')) {
      return {};
    }

    try {
      const metadata = await sharp(buffer).metadata();
      return { width: metadata.width, height: metadata.height };
    } catch (err) {
      this.logger.warn(`Could not read image dimensions: ${err.message}`);
      return {};
    }
  }

  async upload(
    file: Express.Multer.File,
    folder: string = '/',
  ): Promise<UploadResult> {
    const relativeDir = this.buildStoragePath(folder);
    const absoluteDir = path.join(this.uploadsRoot, relativeDir);
    this.ensureDir(absoluteDir);

    const filename = this.sanitiseFilename(file.originalname);
    const absoluteFilePath = path.join(absoluteDir, filename);

    // Write file to disk
    fs.writeFileSync(absoluteFilePath, file.buffer);

    const filePath = path.join(relativeDir, filename);
    const url = this.getUrl(filePath);

    const { width, height } = await this.getImageDimensions(
      file.buffer,
      file.mimetype,
    );

    this.logger.log(`File uploaded: ${filePath}`);

    return { filePath, url, width, height };
  }

  async delete(filePath: string): Promise<void> {
    const absolutePath = path.join(this.uploadsRoot, filePath);

    if (!fs.existsSync(absolutePath)) {
      this.logger.warn(`File not found for deletion: ${filePath}`);
      return;
    }

    fs.unlinkSync(absolutePath);
    this.logger.log(`File deleted: ${filePath}`);
  }

  getUrl(filePath: string): string {
    // Normalise path separators for URL (Windows support)
    const urlPath = filePath.replace(/\\/g, '/');
    return `${this.baseUrl}/uploads/${urlPath}`;
  }
}
