export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagInput {
  name: string;
  slug?: string;
}

export interface UpdateTagInput extends Partial<CreateTagInput> {
  id: string;
}

export interface TagListParams {
  page?: number;
  perPage?: number;
  search?: string;
  orderBy?: string;
  order?: "asc" | "desc";
}
