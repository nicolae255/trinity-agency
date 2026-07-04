import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { ActivityLog } from "@/types/activity-log";

export interface DashboardStats {
  content: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    scheduledPosts: number;
    totalPages: number;
    publishedPages: number;
    draftPages: number;
  };
  media: {
    totalFiles: number;
    totalSize: number; // in bytes
    imagesCount: number;
  };
  users: {
    totalUsers: number;
    activeUsersThisMonth: number;
  };
  recentActivity: ActivityLog[];
}

export interface RecentActivity {
  logs: ActivityLog[];
  total: number;
}

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  recentActivity: () => [...dashboardKeys.all, "recent-activity"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        "/dashboard/stats"
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard stats can be slightly stale
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 minutes
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: [...dashboardKeys.recentActivity(), limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<RecentActivity>>(
        "/dashboard/recent-activity",
        { params: { limit } }
      );
      return response.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // auto-refresh every 2 minutes
  });
}
