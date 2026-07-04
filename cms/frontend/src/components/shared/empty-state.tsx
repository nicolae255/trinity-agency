import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[rgb(var(--muted))]">
          {icon}
        </div>
      )}

      <h3 className="text-base font-semibold text-[rgb(var(--foreground))]">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[rgb(var(--muted-foreground))]">
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          className="mt-5"
          size="sm"
        >
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
}
