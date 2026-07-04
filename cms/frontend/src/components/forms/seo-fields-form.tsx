"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SeoFieldValues {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  canonicalUrl?: string | null;
}

function CharCounter({
  value,
  max,
}: {
  value: string | null | undefined;
  max: number;
}) {
  const length = value?.length ?? 0;
  const ratio = length / max;

  return (
    <span
      className={cn(
        "text-xs font-medium tabular-nums",
        ratio < 0.75
          ? "text-green-600 dark:text-green-400"
          : ratio < 1
          ? "text-yellow-600 dark:text-yellow-400"
          : "text-red-600 dark:text-red-400"
      )}
    >
      {length}/{max}
    </span>
  );
}

export function SeoFieldsForm() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SeoFieldValues>();

  const metaTitle = watch("metaTitle");
  const metaDescription = watch("metaDescription");
  const ogTitle = watch("ogTitle");
  const ogDescription = watch("ogDescription");

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3",
          "bg-[rgb(var(--muted))]/40 hover:bg-[rgb(var(--muted))]/60 transition-colors",
          "text-sm font-semibold text-[rgb(var(--foreground))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
        )}
        aria-expanded={isOpen}
      >
        <span>SEO Settings</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
        )}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-4 py-4 space-y-4 border-t border-[rgb(var(--border))]">
          {/* Meta Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[rgb(var(--foreground))]">
                Meta Title
              </label>
              <CharCounter value={metaTitle} max={60} />
            </div>
            <Input
              {...register("metaTitle")}
              placeholder="SEO page title..."
              className="text-sm"
            />
            {errors.metaTitle && (
              <p className="text-xs text-red-600">{errors.metaTitle.message as string}</p>
            )}
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[rgb(var(--foreground))]">
                Meta Description
              </label>
              <CharCounter value={metaDescription} max={160} />
            </div>
            <Textarea
              {...register("metaDescription")}
              placeholder="Brief description for search engines..."
              rows={3}
              className="text-sm resize-none"
            />
            {errors.metaDescription && (
              <p className="text-xs text-red-600">
                {errors.metaDescription.message as string}
              </p>
            )}
          </div>

          {/* OG Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[rgb(var(--foreground))]">
                OG Title
              </label>
              <CharCounter value={ogTitle} max={60} />
            </div>
            <Input
              {...register("ogTitle")}
              placeholder="Open Graph title (for social sharing)..."
              className="text-sm"
            />
          </div>

          {/* OG Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[rgb(var(--foreground))]">
                OG Description
              </label>
              <CharCounter value={ogDescription} max={160} />
            </div>
            <Textarea
              {...register("ogDescription")}
              placeholder="Open Graph description..."
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {/* Canonical URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[rgb(var(--foreground))]">
              Canonical URL
            </label>
            <Input
              {...register("canonicalUrl")}
              placeholder="https://example.com/canonical-url"
              type="url"
              className="text-sm"
            />
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Leave blank to use the default page URL.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
