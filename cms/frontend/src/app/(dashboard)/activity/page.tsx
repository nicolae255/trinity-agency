"use client";

import { useState } from "react";
import {
  Activity,
  FileText,
  Image,
  Users,
  Tag,
  Hash,
  Settings,
  LogIn,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { formatDateTime } from "@/lib/utils";
import type { ActivityLog, ActivityAction, ActivityEntity } from "@/types/activity-log";

const entityIcons: Record<ActivityEntity, React.ReactNode> = {
  PAGE: <FileText className="h-3.5 w-3.5" />,
  POST: <FileText className="h-3.5 w-3.5" />,
  MEDIA: <Image className="h-3.5 w-3.5" />,
  USER: <Users className="h-3.5 w-3.5" />,
  CATEGORY: <Tag className="h-3.5 w-3.5" />,
  TAG: <Hash className="h-3.5 w-3.5" />,
  SETTINGS: <Settings className="h-3.5 w-3.5" />,
  AUTH: <LogIn className="h-3.5 w-3.5" />,
};

const actionVariants: Record<
  ActivityAction,
  "default" | "secondary" | "success" | "warning" | "outline" | "destructive"
> = {
  CREATE: "success",
  UPDATE: "default",
  DELETE: "destructive",
  PUBLISH: "success",
  UNPUBLISH: "warning",
  ARCHIVE: "secondary",
  LOGIN: "outline",
  LOGOUT: "outline",
  UPLOAD: "success",
  DOWNLOAD: "outline",
};

const actionLabels: Record<ActivityAction, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  PUBLISH: "Published",
  UNPUBLISH: "Unpublished",
  ARCHIVE: "Archived",
  LOGIN: "Logged In",
  LOGOUT: "Logged Out",
  UPLOAD: "Uploaded",
  DOWNLOAD: "Downloaded",
};

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<ActivityAction | "">("");
  const [entityFilter, setEntityFilter] = useState<ActivityEntity | "">("");

  const { data, isLoading } = useActivityLogs({
    page,
    perPage: 25,
    action: actionFilter || undefined,
    entity: entityFilter || undefined,
  });

  const logs = data?.data ?? [];
  const pagination = data?.meta;

  const columns: ColumnDef<ActivityLog>[] = [
    {
      id: "action",
      header: "Action",
      cell: (row) => (
        <Badge variant={actionVariants[row.action] ?? "secondary"}>
          {actionLabels[row.action] ?? row.action}
        </Badge>
      ),
    },
    {
      id: "entity",
      header: "Entity",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-[rgb(var(--muted-foreground))]">
          {entityIcons[row.entity]}
          {row.entity}
        </div>
      ),
    },
    {
      id: "entityTitle",
      header: "Title",
      cell: (row) => (
        <span className="text-sm font-medium text-[rgb(var(--foreground))] max-w-xs truncate block">
          {row.entityTitle ?? "—"}
        </span>
      ),
    },
    {
      id: "user",
      header: "User",
      cell: (row) => {
        const user = row.user;
        if (!user) {
          return (
            <span className="text-sm text-[rgb(var(--muted-foreground))]">
              System
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar
              src={user.avatar ?? undefined}
              firstName={user.firstName}
              lastName={user.lastName}
              size="xs"
            />
            <span className="text-sm text-[rgb(var(--foreground))]">
              {user.firstName} {user.lastName}
            </span>
          </div>
        );
      },
    },
    {
      id: "createdAt",
      header: "Time",
      cell: (row) => (
        <span className="text-sm text-[rgb(var(--muted-foreground))] whitespace-nowrap">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Track all actions taken within the CMS."
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value as ActivityAction | "");
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="">All Actions</option>
          <option value="CREATE">Created</option>
          <option value="UPDATE">Updated</option>
          <option value="DELETE">Deleted</option>
          <option value="PUBLISH">Published</option>
          <option value="UNPUBLISH">Unpublished</option>
          <option value="UPLOAD">Uploaded</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
        </Select>

        <Select
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value as ActivityEntity | "");
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="">All Entities</option>
          <option value="PAGE">Pages</option>
          <option value="POST">Posts</option>
          <option value="MEDIA">Media</option>
          <option value="USER">Users</option>
          <option value="CATEGORY">Categories</option>
          <option value="TAG">Tags</option>
          <option value="AUTH">Authentication</option>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns as any}
        data={logs as any}
        keyField="id"
        loading={isLoading}
        emptyMessage="No activity logs found."
        emptyIcon={<Activity className="h-8 w-8" />}
      />

      {/* Pagination */}
      {pagination && (
        <DataTablePagination
          total={pagination.total}
          page={pagination.page}
          perPage={pagination.perPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
