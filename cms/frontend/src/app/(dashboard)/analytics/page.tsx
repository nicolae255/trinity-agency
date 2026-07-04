"use client";

import { useState } from "react";
import {
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import {
  useAnalyticsOverview,
  usePageViews,
  useTopPages,
  useTopPosts,
} from "@/hooks/use-analytics";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
}

function StatCard({ title, value, change, icon, loading }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[rgb(var(--muted-foreground))] font-medium">
              {title}
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-[rgb(var(--foreground))]">
                {value}
              </p>
            )}
            {change !== undefined && !loading && (
              <div
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs font-medium",
                  isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(change).toFixed(1)}% vs last period
              </div>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: pageViews, isLoading: pageViewsLoading } = usePageViews(days);
  const { data: topPages, isLoading: topPagesLoading } = useTopPages(10);
  const { data: topPosts, isLoading: topPostsLoading } = useTopPosts(10);

  const chartData = pageViews?.map((d) => ({
    date: formatDate(d.date, "MMM d"),
    "Page Views": d.views,
    "Unique Visitors": d.uniqueVisitors,
  })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track your content performance and audience insights."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Page Views"
          value={overview?.totalPageViews?.toLocaleString() ?? 0}
          change={overview?.pageViewsChange}
          icon={<Eye className="h-5 w-5" />}
          loading={overviewLoading}
        />
        <StatCard
          title="Unique Visitors"
          value={overview?.uniqueVisitors?.toLocaleString() ?? 0}
          change={overview?.uniqueVisitorsChange}
          icon={<Users className="h-5 w-5" />}
          loading={overviewLoading}
        />
        <StatCard
          title="Published Posts"
          value={overview?.publishedPosts ?? 0}
          icon={<BarChart3 className="h-5 w-5" />}
          loading={overviewLoading}
        />
        <StatCard
          title="Published Pages"
          value={overview?.publishedPages ?? 0}
          icon={<Clock className="h-5 w-5" />}
          loading={overviewLoading}
        />
      </div>

      {/* Page Views Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Page Views Over Time</CardTitle>
          <Select
            value={String(days)}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-36 h-8 text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Select>
        </CardHeader>
        <CardContent>
          {pageViewsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[rgb(var(--muted-foreground))]">
              <p className="text-sm">No data available for this period.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={chartData}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(var(--border), 0.5)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid rgb(var(--border))",
                    background: "rgb(var(--card))",
                    color: "rgb(var(--foreground))",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                />
                <Line
                  type="monotone"
                  dataKey="Page Views"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Unique Visitors"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Pages and Top Posts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {topPagesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : !topPages || topPages.length === 0 ? (
              <p className="text-sm text-[rgb(var(--muted-foreground))] py-4 text-center">
                No page view data available.
              </p>
            ) : (
              <div className="space-y-2">
                {topPages.map((page, index) => (
                  <div
                    key={page.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[rgb(var(--muted))]/50 transition-colors"
                  >
                    <span className="w-5 text-xs font-bold text-[rgb(var(--muted-foreground))] tabular-nums">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                        {page.title}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">
                        /{page.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-[rgb(var(--muted-foreground))] tabular-nums shrink-0">
                      <Eye className="h-3 w-3" />
                      {page.views.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Top Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {topPostsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : !topPosts || topPosts.length === 0 ? (
              <p className="text-sm text-[rgb(var(--muted-foreground))] py-4 text-center">
                No post view data available.
              </p>
            ) : (
              <div className="space-y-2">
                {topPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[rgb(var(--muted))]/50 transition-colors"
                  >
                    <span className="w-5 text-xs font-bold text-[rgb(var(--muted-foreground))] tabular-nums">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                        {post.title}
                      </p>
                      {post.readingTime && (
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">
                          {post.readingTime} min read
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-[rgb(var(--muted-foreground))] tabular-nums shrink-0">
                      <Eye className="h-3 w-3" />
                      {post.views.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
