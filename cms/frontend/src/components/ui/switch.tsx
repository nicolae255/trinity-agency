"use client";

import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

const switchSizes = {
  sm: {
    track: "h-4 w-7",
    thumb: "h-3 w-3",
    translate: "translate-x-3",
  },
  md: {
    track: "h-5 w-9",
    thumb: "h-4 w-4",
    translate: "translate-x-4",
  },
  lg: {
    track: "h-6 w-11",
    thumb: "h-5 w-5",
    translate: "translate-x-5",
  },
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, size = "md", id, checked, ...props }, ref) => {
    const switchId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const sizes = switchSizes[size];

    return (
      <label
        htmlFor={switchId}
        className={cn(
          "flex cursor-pointer items-start gap-3",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            role="switch"
            checked={checked}
            className="sr-only"
            {...props}
          />
          {/* Track */}
          <div
            className={cn(
              "rounded-full border-2 border-transparent transition-colors duration-200",
              sizes.track,
              checked
                ? "bg-primary-600"
                : "bg-[rgb(var(--muted))] border-[rgb(var(--border))]"
            )}
          />
          {/* Thumb */}
          <div
            className={cn(
              "absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform duration-200",
              sizes.thumb,
              checked ? sizes.translate : "translate-x-0"
            )}
          />
        </div>

        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-[rgb(var(--muted-foreground))]">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = "Switch";
