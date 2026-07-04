"use client";

import { Check, FileText, Film, Trash2, ImageIcon } from "lucide-react";
import { cn, formatFileSize, formatRelativeDate } from "@/lib/utils";
import type { Media } from "@/types/media";

interface MediaItemCardProps {
  item: Media;
  selected?: boolean;
  onSelect?: (item: Media) => void;
  onDelete?: (item: Media) => void;
  selectable?: boolean;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("video/")) {
    return <Film className="h-8 w-8 text-blue-500" />;
  }
  if (mimeType === "application/pdf") {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  return <ImageIcon className="h-8 w-8 text-[rgb(var(--muted-foreground))]" />;
}

export function MediaItemCard({
  item,
  selected = false,
  onSelect,
  onDelete,
  selectable = true,
}: MediaItemCardProps) {
  const isImage = item.mimeType.startsWith("image/");

  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden border-2 transition-all duration-150",
        "bg-[rgb(var(--muted))]/30 cursor-pointer",
        selected
          ? "border-primary-500 ring-2 ring-primary-500/30"
          : "border-[rgb(var(--border))] hover:border-primary-300"
      )}
      onClick={() => selectable && onSelect?.(item)}
      role={selectable ? "button" : undefined}
      aria-pressed={selectable ? selected : undefined}
      aria-label={`${item.originalName}${selected ? " (selected)" : ""}`}
      tabIndex={selectable ? 0 : undefined}
      onKeyDown={(e) => {
        if (selectable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect?.(item);
        }
      }}
    >
      {/* Thumbnail / Preview */}
      <div className="aspect-square flex items-center justify-center bg-[rgb(var(--muted))]/50">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.altText ?? item.originalName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4">
            <FileIcon mimeType={item.mimeType} />
            <span className="text-xs uppercase font-medium text-[rgb(var(--muted-foreground))]">
              {item.mimeType.split("/")[1] ?? "file"}
            </span>
          </div>
        )}
      </div>

      {/* Hover Info Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity",
          "flex flex-col justify-end p-2",
          selected && "opacity-100"
        )}
      >
        <p className="text-white text-xs font-medium truncate leading-tight">
          {item.originalName}
        </p>
        <p className="text-white/70 text-xs">
          {formatFileSize(item.size)} &middot; {formatRelativeDate(item.createdAt)}
        </p>
      </div>

      {/* Selected Checkmark */}
      {selected && (
        <div className="absolute top-2 left-2 h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center shadow-md">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Delete Button */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className={cn(
            "absolute top-2 right-2 h-6 w-6 rounded-full bg-red-600 text-white",
            "flex items-center justify-center shadow-md transition-opacity",
            "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          )}
          aria-label={`Delete ${item.originalName}`}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
