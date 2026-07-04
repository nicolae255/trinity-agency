export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    posts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

export interface CategoryListParams {
  page?: number;
  perPage?: number;
  search?: string;
  parentId?: string | null;
  orderBy?: string;
  order?: "asc" | "desc";
}
