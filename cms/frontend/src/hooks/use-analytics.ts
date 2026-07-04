import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

export interface AnalyticsOverview {
  totalPageViews: number;
  uniqueVisitors: number;
  totalPosts: number;
  totalPages: number;
  publishedPosts: number;
  publishedPages: number;
  totalMedia: number;
  totalUsers: number;
  pageViewsChange: number; // percentage change from previous period
  uniqueVisitorsChange: number;
}

export interface PageViewDataPoint {
  date: string;
  views: number;
  uniqueVisitors: number;
}

export interface TopPage {
  id: string;
  title: string;
  slug: string;
  views: number;
  type: "page" | "post";
}

export interface TopPost {
  id: string;
  title: string;
  slug: string;
  views: number;
  readingTime?: number;
}

export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: () => [...analyticsKeys.all, "overview"] as const,
  pageViews: (days: number) =>
    [...analyticsKeys.all, "page-views", days] as const,
  topPages: (limit: number) =>
    [...analyticsKeys.all, "top-pages", limit] as const,
  topPosts: (limit: number) =>
    [...analyticsKeys.all, "top-posts", limit] as const,
};

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AnalyticsOverview>>(
        "/analytics/overview"
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePageViews(days = 30) {
  return useQuery({
    queryKey: analyticsKeys.pageViews(days),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PageViewDataPoint[]>>(
        "/analytics/page-views",
        { params: { days } }
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopPages(limit = 10) {
  return useQuery({
    queryKey: analyticsKeys.topPages(limit),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<TopPage[]>>(
        "/analytics/top-pages",
        { params: { limit } }
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopPosts(limit = 10) {
  return useQuery({
    queryKey: analyticsKeys.topPosts(limit),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<TopPost[]>>(
        "/analytics/top-posts",
        { params: { limit } }
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
