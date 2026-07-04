import type { User } from "./auth";

export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "UNPUBLISH"
  | "ARCHIVE"
  | "LOGIN"
  | "LOGOUT"
  | "UPLOAD"
  | "DOWNLOAD";

export type ActivityEntity =
  | "PAGE"
  | "POST"
  | "MEDIA"
  | "USER"
  | "CATEGORY"
  | "TAG"
  | "SETTINGS"
  | "AUTH";

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string | null;
  entityTitle?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface ActivityLogListParams {
  page?: number;
  perPage?: number;
  action?: ActivityAction;
  entity?: ActivityEntity;
  userId?: string;
  startDate?: string;
  endDate?: string;
}
