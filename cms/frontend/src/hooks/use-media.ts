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
  Media,
  UploadMediaInput,
  UpdateMediaInput,
  MediaListParams,
} from "@/types/media";

export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (params: MediaListParams) => [...mediaKeys.lists(), params] as const,
  details: () => [...mediaKeys.all, "detail"] as const,
  detail: (id: string) => [...mediaKeys.details(), id] as const,
};

export function useMedia(params: MediaListParams = {}) {
  return useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Media>>(
        "/media",
        { params }
      );
      return response.data;
    },
  });
}

export function useMediaItem(
  id: string,
  options?: Partial<UseQueryOptions<Media>>
) {
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Media>>(`/media/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, altText, caption, folder }: UploadMediaInput) => {
      // Build a FormData object for multipart/form-data upload
      const formData = new FormData();
      formData.append("file", file);
      if (altText) formData.append("altText", altText);
      if (caption) formData.append("caption", caption);
      if (folder) formData.append("folder", folder);

      const response = await apiClient.post<ApiResponse<Media>>(
        "/media/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    },
    onSuccess: (media) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success(`"${media.originalName}" uploaded successfully.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateMediaInput) => {
      const response = await apiClient.put<ApiResponse<Media>>(
        `/media/${id}`,
        input
      );
      return response.data.data;
    },
    onSuccess: (media) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(media.id) });
      toast.success("Media updated successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/media/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      queryClient.removeQueries({ queryKey: mediaKeys.detail(id) });
      toast.success("Media deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
