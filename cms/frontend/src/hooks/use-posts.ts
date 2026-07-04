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
  Post,
  CreatePostInput,
  UpdatePostInput,
  PostListParams,
  SchedulePostInput,
} from "@/types/post";

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (params: PostListParams) => [...postKeys.lists(), params] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

export function usePosts(params: PostListParams = {}) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Post>>("/posts", {
        params,
      });
      return response.data;
    },
  });
}

export function usePost(
  id: string,
  options?: Partial<UseQueryOptions<Post>>
) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const response = await apiClient.post<ApiResponse<Post>>("/posts", input);
      return response.data.data;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      toast.success(`Post "${post.title}" created successfully.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdatePostInput) => {
      const response = await apiClient.put<ApiResponse<Post>>(
        `/posts/${id}`,
        input
      );
      return response.data.data;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(post.id) });
      toast.success(`Post "${post.title}" updated successfully.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/posts/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.removeQueries({ queryKey: postKeys.detail(id) });
      toast.success("Post deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<Post>>(
        `/posts/${id}/publish`
      );
      return response.data.data;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(post.id) });
      toast.success(`Post "${post.title}" published.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUnpublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<Post>>(
        `/posts/${id}/unpublish`
      );
      return response.data.data;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(post.id) });
      toast.success(`Post "${post.title}" moved to draft.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSchedulePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scheduledAt }: SchedulePostInput) => {
      const response = await apiClient.post<ApiResponse<Post>>(
        `/posts/${id}/schedule`,
        { scheduledAt }
      );
      return response.data.data;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(post.id) });
      toast.success(`Post "${post.title}" scheduled successfully.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
