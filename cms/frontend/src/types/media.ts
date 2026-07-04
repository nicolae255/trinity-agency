import type { User } from "./auth";

export type MediaMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp"
  | "image/svg+xml"
  | "video/mp4"
  | "video/webm"
  | "application/pdf"
  | "text/plain"
  | string;

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: MediaMimeType;
  size: number;
  width?: number | null;
  height?: number | null;
  url: string;
  altText?: string | null;
  caption?: string | null;
  folder?: string | null;
  uploadedById: string;
  uploadedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface UploadMediaInput {
  file: File;
  altText?: string;
  caption?: string;
  folder?: string;
}

export interface UpdateMediaInput {
  id: string;
  altText?: string | null;
  caption?: string | null;
  folder?: string | null;
}

export interface MediaListParams {
  page?: number;
  perPage?: number;
  search?: string;
  mimeType?: string;
  folder?: string;
  orderBy?: string;
  order?: "asc" | "desc";
}
