import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type ButtonSize = "sm" | "default" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
  destructive:
    "bg-error-600 text-white hover:bg-error-700 active:bg-error-800 shadow-sm focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2",
  outline:
    "border border-[rgb(var(--border))] bg-transparent text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] active:bg-[rgb(var(--muted))] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
  secondary:
    "bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] hover:bg-neutral-200 dark:hover:bg-neutral-700 active:bg-neutral-300 dark:active:bg-neutral-600 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] active:bg-[rgb(var(--muted))] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
  link: "bg-transparent text-primary-600 dark:text-primary-400 underline-offset-4 hover:underline p-0 h-auto focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-md gap-1.5",
  default: "h-9 px-4 text-sm rounded-md gap-2",
  lg: "h-11 px-6 text-base rounded-lg gap-2",
  icon: "h-9 w-9 rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center whitespace-nowrap font-medium",
          "transition-colors duration-150",
          "focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2
            className={cn(
              "animate-spin shrink-0",
              size === "sm" ? "h-3 w-3" : "h-4 w-4"
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
