import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  secondary:
    "bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]",
  destructive:
    "bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-300",
  outline:
    "border border-[rgb(var(--border))] text-[rgb(var(--foreground))] bg-transparent",
  success:
    "bg-success-100 text-success-700 dark:bg-success-700/20 dark:text-success-400",
  warning:
    "bg-warning-100 text-warning-700 dark:bg-warning-700/20 dark:text-warning-400",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        "transition-colors duration-150",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
