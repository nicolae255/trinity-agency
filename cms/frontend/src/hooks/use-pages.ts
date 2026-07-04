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
  Page,
  CreatePageInput,
  UpdatePageInput,
  PageListParams,
} from "@/types/page";

export const pageKeys = {
  all: ["pages"] as const,
  lists: () => [...pageKeys.all, "list"] as const,
  list: (params: PageListParams) => [...pageKeys.lists(), params] as const,
  details: () => [...pageKeys.all, "detail"] as const,
  detail: (id: string) => [...pageKeys.details(), id] as const,
};

export function usePages(params: PageListParams = {}) {
  return useQuery({
    queryKey: pageKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Page>>("/pages", {
        params,
      });
      return response.data;
    },
  });
}

export function usePage(
  id: string,
  options?: Partial<UseQueryOptions<Page>>
) {
  return useQuery({
    queryKey: pageKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Page>>(`/pages/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePageInput) => {
      const response = await apiClient.post<ApiResponse<Page>>("/pages", input);
      return response.data.data;
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
      toast.success(`Page "${page.title}" created successfully.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdatePageInput) => {
      const response = await apiClient.put<ApiResponse<Page>>(
        `/pages/${id}`,
        input
      );
      return response.data.data;
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(page.id) });
      toast.success(`Page "${page.title}" updated successfully.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/pages/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
      queryClient.removeQueries({ queryKey: pageKeys.detail(id) });
      toast.success("Page deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function usePublishPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<Page>>(
        `/pages/${id}/publish`
      );
      return response.data.data;
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(page.id) });
      toast.success(`Page "${page.title}" published.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUnpublishPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<Page>>(
        `/pages/${id}/unpublish`
      );
      return response.data.data;
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(page.id) });
      toast.success(`Page "${page.title}" unpublished and moved to draft.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
