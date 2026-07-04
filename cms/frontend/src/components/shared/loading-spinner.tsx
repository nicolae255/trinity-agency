import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  centered?: boolean;
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading...",
  centered = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      className={cn(
        "inline-flex items-center gap-2 text-[rgb(var(--muted-foreground))]",
        centered && "justify-center",
        className
      )}
    >
      <Loader2
        className={cn("animate-spin shrink-0", sizes[size])}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center py-16">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" label="Loading page..." />
    </div>
  );
}
