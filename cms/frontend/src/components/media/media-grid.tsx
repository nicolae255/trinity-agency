"use client";

import { MediaItemCard } from "@/components/media/media-item-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ImageIcon } from "lucide-react";
import type { Media } from "@/types/media";

interface MediaGridProps {
  items: Media[];
  selectedIds?: string[];
  onSelect?: (item: Media) => void;
  onDelete?: (item: Media) => void;
  multiple?: boolean;
  loading?: boolean;
}

export function MediaGrid({
  items,
  selectedIds = [],
  onSelect,
  onDelete,
  loading = false,
}: MediaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-[rgb(var(--muted))] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ImageIcon className="h-10 w-10" />}
        title="No media files"
        description="Upload your first file to get started."
      />
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      role="list"
      aria-label="Media files"
    >
      {items.map((item) => (
        <div key={item.id} role="listitem">
          <MediaItemCard
            item={item}
            selected={selectedIds.includes(item.id)}
            onSelect={onSelect}
            onDelete={onDelete}
            selectable={!!onSelect}
          />
        </div>
      ))}
    </div>
  );
}
