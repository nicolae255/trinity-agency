import { Badge } from "@/components/ui/badge";
import type { PageStatus } from "@/types/page";
import type { PostStatus } from "@/types/post";

type ContentStatus = PageStatus | PostStatus;

const statusConfig: Record<
  ContentStatus,
  { label: string; variant: "success" | "warning" | "secondary" | "outline" | "default" }
> = {
  PUBLISHED: {
    label: "Published",
    variant: "success",
  },
  DRAFT: {
    label: "Draft",
    variant: "warning",
  },
  ARCHIVED: {
    label: "Archived",
    variant: "secondary",
  },
  SCHEDULED: {
    label: "Scheduled",
    variant: "outline",
  },
};

interface StatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    variant: "secondary" as const,
  };

  return (
    <Badge variant={config.variant} className={className}>
      {/* Status indicator dot */}
      <span
        className={
          status === "PUBLISHED"
            ? "inline-block h-1.5 w-1.5 rounded-full bg-success-600 dark:bg-success-400"
            : status === "DRAFT"
            ? "inline-block h-1.5 w-1.5 rounded-full bg-warning-600 dark:bg-warning-400"
            : status === "SCHEDULED"
            ? "inline-block h-1.5 w-1.5 rounded-full bg-primary-600 dark:bg-primary-400"
            : "inline-block h-1.5 w-1.5 rounded-full bg-neutral-400"
        }
        aria-hidden="true"
      />
      {config.label}
    </Badge>
  );
}
