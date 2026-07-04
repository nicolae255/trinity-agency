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
  Tag,
  CreateTagInput,
  UpdateTagInput,
  TagListParams,
} from "@/types/tag";

export const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  list: (params: TagListParams) => [...tagKeys.lists(), params] as const,
  details: () => [...tagKeys.all, "detail"] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
};

export function useTags(params: TagListParams = {}) {
  return useQuery({
    queryKey: tagKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Tag>>("/tags", {
        params,
      });
      return response.data;
    },
  });
}

export function useAllTags() {
  return useQuery({
    queryKey: [...tagKeys.all, "all"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Tag[]>>("/tags/all");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTag(id: string, options?: Partial<UseQueryOptions<Tag>>) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Tag>>(`/tags/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTagInput) => {
      const response = await apiClient.post<ApiResponse<Tag>>("/tags", input);
      return response.data.data;
    },
    onSuccess: (tag) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      toast.success(`Tag "${tag.name}" created successfully.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTagInput) => {
      const response = await apiClient.put<ApiResponse<Tag>>(
        `/tags/${id}`,
        input
      );
      return response.data.data;
    },
    onSuccess: (tag) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      toast.success(`Tag "${tag.name}" updated successfully.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tags/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      toast.success("Tag deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
