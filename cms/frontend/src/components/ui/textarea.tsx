import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[rgb(var(--foreground))]"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-error-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : hint
              ? `${textareaId}-hint`
              : undefined
          }
          className={cn(
            "flex min-h-[80px] w-full rounded-md border bg-[rgb(var(--card))] px-3 py-2 text-sm",
            "border-[rgb(var(--border))] text-[rgb(var(--foreground))]",
            "placeholder:text-[rgb(var(--muted-foreground))]",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[rgb(var(--muted))]",
            "resize-y",
            error && "border-error-500 focus-visible:ring-error-500",
            className
          )}
          {...props}
        />

        {error && (
          <p
            id={`${textareaId}-error`}
            role="alert"
            className="text-xs text-error-600 dark:text-error-400"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${textareaId}-hint`}
            className="text-xs text-[rgb(var(--muted-foreground))]"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
