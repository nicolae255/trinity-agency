import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options?: SelectOption[];
  containerClassName?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      placeholder,
      options,
      containerClassName,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
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

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                ? `${selectId}-hint`
                : undefined
            }
            className={cn(
              "flex h-9 w-full appearance-none rounded-md border bg-[rgb(var(--card))] px-3 py-1 pr-8 text-sm",
              "border-[rgb(var(--border))] text-[rgb(var(--foreground))]",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[rgb(var(--muted))]",
              error && "border-error-500 focus-visible:ring-error-500",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              : children}
          </select>

          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]"
            aria-hidden="true"
          />
        </div>

        {error && (
          <p
            id={`${selectId}-error`}
            role="alert"
            className="text-xs text-error-600 dark:text-error-400"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${selectId}-hint`}
            className="text-xs text-[rgb(var(--muted-foreground))]"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
