import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ActivityLog } from "@/types/activity-log";

// Shape returned by backend
interface BackendStats {
  pages: number;
  publishedPages: number;
  posts: number;
  publishedPosts: number;
  draftPosts: number;
  media: number;
  users: number;
}

// Shape the frontend dashboard expects
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
    totalSize: number;
    imagesCount: number;
  };
  users: {
    totalUsers: number;
    activeUsersThisMonth: number;
  };
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
      const response = await apiClient.get<{ data: BackendStats }>(
        "/dashboard/stats"
      );
      const raw = response.data.data;
      const mapped: DashboardStats = {
        content: {
          totalPosts: raw.posts,
          publishedPosts: raw.publishedPosts,
          draftPosts: raw.draftPosts,
          scheduledPosts: 0,
          totalPages: raw.pages,
          publishedPages: raw.publishedPages,
          draftPages: raw.pages - raw.publishedPages,
        },
        media: {
          totalFiles: raw.media,
          totalSize: 0,
          imagesCount: 0,
        },
        users: {
          totalUsers: raw.users,
          activeUsersThisMonth: 0,
        },
      };
      return mapped;
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: [...dashboardKeys.recentActivity(), limit],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ActivityLog[] }>(
        "/dashboard/recent-activity",
        { params: { limit } }
      );
      const logs = response.data.data ?? [];
      return { logs, total: logs.length } as RecentActivity;
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}
