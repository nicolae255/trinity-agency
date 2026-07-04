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
import type { User, Role } from "@/types/auth";

export interface UserListParams {
  page?: number;
  perPage?: number;
  search?: string;
  role?: Role;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  password: string;
  avatar?: string | null;
}

export interface UpdateUserInput extends Partial<Omit<CreateUserInput, "password">> {
  id: string;
  password?: string;
}

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(params: UserListParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<User>>("/users", {
        params,
      });
      return response.data;
    },
  });
}

export function useUser(
  id: string,
  options?: Partial<UseQueryOptions<User>>
) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const response = await apiClient.post<ApiResponse<User>>("/users", input);
      return response.data.data;
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(
        `User "${user.firstName} ${user.lastName}" created successfully.`
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateUserInput) => {
      const response = await apiClient.put<ApiResponse<User>>(
        `/users/${id}`,
        input
      );
      return response.data.data;
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) });
      toast.success(
        `User "${user.firstName} ${user.lastName}" updated successfully.`
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      toast.success("User deleted successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
