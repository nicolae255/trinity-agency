import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

/**
 * Merges class names with Tailwind conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or Date object to a human-readable format.
 * Default: "MMM d, yyyy" (e.g., "Jan 1, 2024")
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatStr = "MMM d, yyyy"
): string {
  if (!date) return "—";

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) return "—";

  return format(dateObj, formatStr);
}

/**
 * Formats a date as a relative time string (e.g., "5 minutes ago", "2 days ago").
 */
export function formatRelativeDate(
  date: string | Date | null | undefined
): string {
  if (!date) return "—";

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) return "—";

  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Formats a date with both date and time (e.g., "Jan 1, 2024 at 2:30 PM").
 */
export function formatDateTime(
  date: string | Date | null | undefined
): string {
  return formatDate(date, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Formats file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Truncates a string to a maximum length and appends ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Generates initials from a full name (e.g., "John Doe" -> "JD").
 */
export function getInitials(
  firstName?: string | null,
  lastName?: string | null
): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? "";
  const last = lastName?.charAt(0)?.toUpperCase() ?? "";
  return `${first}${last}` || "?";
}

/**
 * Slugifies a string for use in URLs.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Converts a role key to a display-friendly label.
 */
export function formatRole(role: string): string {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Determines if a user has at least a minimum required role.
 * Role hierarchy: SUPER_ADMIN > ADMIN > EDITOR > AUTHOR
 */
const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  EDITOR: 2,
  AUTHOR: 1,
};

export function hasMinimumRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userLevel >= requiredLevel;
}

/**
 * Extracts a readable error message from an axios error or unknown error.
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    // Axios error shape
    const axiosError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return (
      axiosError.response?.data?.message ??
      axiosError.message ??
      "An unexpected error occurred"
    );
  }

  return "An unexpected error occurred";
}
