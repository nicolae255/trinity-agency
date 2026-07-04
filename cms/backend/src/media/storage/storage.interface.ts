export interface UploadResult {
  /** Path relative to the storage root (e.g. "2024/01/image.png") */
  filePath: string;
  /** Publicly accessible URL for the file */
  url: string;
  /** Width in pixels (images only) */
  width?: number;
  /** Height in pixels (images only) */
  height?: number;
}

export interface IStorageService {
  /**
   * Persist a file to storage.
   * @param file - Express Multer file object
   * @param folder - Logical folder path (e.g. "/", "/avatars")
   */
  upload(file: Express.Multer.File, folder: string): Promise<UploadResult>;

  /**
   * Remove a file from storage.
   * @param filePath - Relative path returned by upload()
   */
  delete(filePath: string): Promise<void>;

  /**
   * Build the public URL for a stored file.
   * @param filePath - Relative path returned by upload()
   */
  getUrl(filePath: string): string;
}

export const STORAGE_SERVICE = 'STORAGE_SERVICE';
