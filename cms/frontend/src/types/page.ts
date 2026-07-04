import type { User } from "./auth";

export type PageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  contentHtml: string;
  status: PageStatus;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  canonicalUrl?: string | null;
  authorId: string;
  author?: User;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageInput {
  title: string;
  slug?: string;
  content: string;
  contentHtml?: string;
  status?: PageStatus;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  canonicalUrl?: string | null;
}

export interface UpdatePageInput extends Partial<CreatePageInput> {
  id: string;
}

export interface PageListParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: PageStatus;
  orderBy?: string;
  order?: "asc" | "desc";
}
