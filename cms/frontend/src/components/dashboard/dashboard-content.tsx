"use client";

import Link from "next/link";
import {
  BarChart3,
  FileText,
  HardDrive,
  Newspaper,
  TrendingUp,
  Users,
} from "lucide-react";
import { useDashboardStats, useRecentActivity } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeDate, formatFileSize } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  href?: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  href,
  loading,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        "transition-shadow",
        href && "hover:shadow-md cursor-pointer"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
              {title}
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : (
              <p className="mt-1 text-3xl font-bold tracking-tight text-[rgb(var(--foreground))]">
                {value}
              </p>
            )}
            {subtitle && !loading && (
              <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
            <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        {trend !== undefined && !loading && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            <TrendingUp
              className={cn(
                "h-3.5 w-3.5",
                trend >= 0 ? "text-success-600" : "text-error-600 rotate-180"
              )}
            />
            <span
              className={
                trend >= 0 ? "text-success-600" : "text-error-600"
              }
            >
              {trend >= 0 ? "+" : ""}
              {trend}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function DashboardContent() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activity, isLoading: activityLoading } = useRecentActivity(5);

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Posts"
          value={stats?.content.totalPosts ?? 0}
          subtitle={`${stats?.content.publishedPosts ?? 0} published`}
          icon={Newspaper}
          href="/posts"
          loading={statsLoading}
        />
        <StatCard
          title="Total Pages"
          value={stats?.content.totalPages ?? 0}
          subtitle={`${stats?.content.publishedPages ?? 0} published`}
          icon={FileText}
          href="/pages"
          loading={statsLoading}
        />
        <StatCard
          title="Media Files"
          value={stats?.media.totalFiles ?? 0}
          subtitle={
            stats?.media.totalSize
              ? formatFileSize(stats.media.totalSize)
              : undefined
          }
          icon={HardDrive}
          href="/media"
          loading={statsLoading}
        />
        <StatCard
          title="Users"
          value={stats?.users.totalUsers ?? 0}
          subtitle={`${stats?.users.activeUsersThisMonth ?? 0} active this month`}
          icon={Users}
          href="/users"
          loading={statsLoading}
        />
      </div>

      {/* Content overview + Recent activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Content overview */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                Content Overview
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: "Published Posts",
                    value: stats?.content.publishedPosts ?? 0,
                    total: stats?.content.totalPosts ?? 0,
                    color: "bg-success-500",
                  },
                  {
                    label: "Draft Posts",
                    value: stats?.content.draftPosts ?? 0,
                    total: stats?.content.totalPosts ?? 0,
                    color: "bg-warning-500",
                  },
                  {
                    label: "Published Pages",
                    value: stats?.content.publishedPages ?? 0,
                    total: stats?.content.totalPages ?? 0,
                    color: "bg-primary-500",
                  },
                  {
                    label: "Draft Pages",
                    value: stats?.content.draftPages ?? 0,
                    total: stats?.content.totalPages ?? 0,
                    color: "bg-neutral-400",
                  },
                ].map((item) => {
                  const percentage =
                    item.total > 0
                      ? Math.round((item.value / item.total) * 100)
                      : 0;

                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[rgb(var(--muted-foreground))]">
                          {item.label}
                        </span>
                        <span className="font-semibold text-[rgb(var(--foreground))]">
                          {item.value}
                          <span className="ml-1 text-xs font-normal text-[rgb(var(--muted-foreground))]">
                            / {item.total}
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--muted))]">
                        <div
                          className={cn("h-full rounded-full transition-all", item.color)}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/activity" className="text-xs">
                  View all
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity?.logs.length === 0 ? (
              <p className="text-center text-sm text-[rgb(var(--muted-foreground))] py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {activity?.logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <Avatar
                      firstName={log.user?.firstName}
                      lastName={log.user?.lastName}
                      src={log.user?.avatar}
                      size="xs"
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[rgb(var(--foreground))] leading-relaxed">
                        <span className="font-medium">
                          {log.user?.firstName} {log.user?.lastName}
                        </span>{" "}
                        <span className="lowercase">{log.action}</span>
                        {log.entityTitle && (
                          <>
                            {" "}
                            <span className="font-medium truncate">
                              &ldquo;{log.entityTitle}&rdquo;
                            </span>
                          </>
                        )}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {log.entity}
                        </Badge>
                        <span className="text-[10px] text-[rgb(var(--muted-foreground))]">
                          {formatRelativeDate(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/posts/new">
                <Newspaper className="h-4 w-4" />
                New Post
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/pages/new">
                <FileText className="h-4 w-4" />
                New Page
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/media">
                <HardDrive className="h-4 w-4" />
                Upload Media
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/users/new">
                <Users className="h-4 w-4" />
                Invite User
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
