import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--foreground))] truncate">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-shrink-0 items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
