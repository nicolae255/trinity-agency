import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryListParams,
} from "@/types/category";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params: CategoryListParams) =>
    [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategories(params: CategoryListParams = {}) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Category>>(
        "/categories",
        { params }
      );
      return response.data;
    },
  });
}

export function useAllCategories() {
  return useQuery({
    queryKey: [...categoryKeys.all, "all"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Category[]>>(
        "/categories/all"
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  });
}

export function useCategory(
  id: string,
  options?: Partial<UseQueryOptions<Category>>
) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Category>>(
        `/categories/${id}`
      );
      return response.data.data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const response = await apiClient.post<ApiResponse<Category>>(
        "/categories",
        input
      );
      return response.data.data;
    },
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(`Category "${category.name}" created successfully.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateCategoryInput) => {
      const response = await apiClient.put<ApiResponse<Category>>(
        `/categories/${id}`,
        input
      );
      return response.data.data;
    },
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(`Category "${category.name}" updated successfully.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/categories/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
