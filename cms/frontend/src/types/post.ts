import type { User } from "./auth";
import type { Category } from "./category";
import type { Tag } from "./tag";
import type { Media } from "./media";

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  contentHtml: string;
  status: PostStatus;
  featuredImage?: string | null;
  featuredImageMedia?: Media | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  canonicalUrl?: string | null;
  authorId: string;
  author?: User;
  categories?: Category[];
  tags?: Tag[];
  publishedAt?: string | null;
  scheduledAt?: string | null;
  readingTime?: number | null;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  contentHtml?: string;
  status?: PostStatus;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  canonicalUrl?: string | null;
  categoryIds?: string[];
  tagIds?: string[];
  scheduledAt?: string | null;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

export interface PostListParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: PostStatus;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface SchedulePostInput {
  id: string;
  scheduledAt: string;
}
