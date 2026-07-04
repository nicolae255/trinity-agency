import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { ActivityLog, ActivityLogListParams } from "@/types/activity-log";

export const activityLogKeys = {
  all: ["activity-logs"] as const,
  lists: () => [...activityLogKeys.all, "list"] as const,
  list: (params: ActivityLogListParams) =>
    [...activityLogKeys.lists(), params] as const,
  mine: () => [...activityLogKeys.all, "mine"] as const,
};

export function useActivityLogs(params: ActivityLogListParams = {}) {
  return useQuery({
    queryKey: activityLogKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<ActivityLog>>(
        "/activity-logs",
        { params }
      );
      return response.data;
    },
  });
}

export function useMyActivityLogs(params: Omit<ActivityLogListParams, "userId"> = {}) {
  return useQuery({
    queryKey: [...activityLogKeys.mine(), params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<ActivityLog>>(
        "/activity-logs/me",
        { params }
      );
      return response.data;
    },
  });
}
