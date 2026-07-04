"use client";

import { useState } from "react";
import { Search, FolderOpen, X, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MediaUploadZone } from "@/components/media/media-upload-zone";
import { MediaGrid } from "@/components/media/media-grid";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useMedia, useUpdateMedia, useDeleteMedia } from "@/hooks/use-media";
import { useDebounce } from "@/hooks/use-debounce";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import type { Media } from "@/types/media";

const FOLDERS = [
  { label: "All Files", value: undefined },
  { label: "Images", value: "images" },
  { label: "Videos", value: "videos" },
  { label: "Documents", value: "documents" },
];

export default function MediaPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(
    undefined
  );
  const [selectedItem, setSelectedItem] = useState<Media | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, refetch } = useMedia({
    page,
    perPage: 30,
    search: debouncedSearch || undefined,
    folder: selectedFolder,
  });

  const { mutateAsync: updateMedia, isPending: isUpdating } = useUpdateMedia();
  const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMedia();

  const items = data?.data ?? [];
  const pagination = data?.meta;

  const handleSelect = (item: Media) => {
    setSelectedItem(item);
    setAltText(item.altText ?? "");
    setCaption(item.caption ?? "");
  };

  const handleSaveDetails = async () => {
    if (!selectedItem) return;
    await updateMedia({
      id: selectedItem.id,
      altText,
      caption,
    });
  };

  const handleDelete = (item: Media) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMedia(deleteTarget.id);
    if (selectedItem?.id === deleteTarget.id) {
      setSelectedItem(null);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Manage your uploaded images, videos, and documents."
      />

      {/* Upload Zone */}
      <MediaUploadZone
        folder={selectedFolder}
        onUploadComplete={() => refetch()}
      />

      <div className="flex gap-6 min-h-[500px]">
        {/* Left Sidebar - Folders */}
        <div className="w-48 shrink-0">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
            Folders
          </p>
          <nav className="space-y-0.5">
            {FOLDERS.map((folder) => (
              <button
                key={folder.label}
                type="button"
                onClick={() => {
                  setSelectedFolder(folder.value);
                  setPage(1);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  selectedFolder === folder.value
                    ? "bg-primary-100 text-primary-700 font-medium dark:bg-primary-900/40 dark:text-primary-300"
                    : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
                )}
              >
                <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                {folder.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <Input
              placeholder="Search media..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          {/* Media Grid */}
          <MediaGrid
            items={items}
            selectedIds={selectedItem ? [selectedItem.id] : []}
            onSelect={handleSelect}
            onDelete={handleDelete}
            loading={isLoading}
          />

          {/* Pagination */}
          {pagination && (
            <DataTablePagination
              total={pagination.total}
              page={pagination.page}
              perPage={pagination.perPage}
              onPageChange={setPage}
            />
          )}
        </div>

        {/* Right Panel - Item Details */}
        {selectedItem && (
          <div className="w-64 shrink-0 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 space-y-4 self-start sticky top-6">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] break-all leading-tight">
                {selectedItem.originalName}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="shrink-0 p-0.5 rounded text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
                aria-label="Close details panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Preview */}
            {selectedItem.mimeType.startsWith("image/") && (
              <div className="rounded-lg overflow-hidden bg-[rgb(var(--muted))]/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.url}
                  alt={selectedItem.altText ?? selectedItem.originalName}
                  className="w-full max-h-48 object-contain"
                />
              </div>
            )}

            {/* File Info */}
            <div className="space-y-1 text-xs text-[rgb(var(--muted-foreground))]">
              <p>
                <span className="font-medium text-[rgb(var(--foreground))]">
                  Size:
                </span>{" "}
                {formatFileSize(selectedItem.size)}
              </p>
              {selectedItem.width && selectedItem.height && (
                <p>
                  <span className="font-medium text-[rgb(var(--foreground))]">
                    Dimensions:
                  </span>{" "}
                  {selectedItem.width} x {selectedItem.height}
                </p>
              )}
              <p>
                <span className="font-medium text-[rgb(var(--foreground))]">
                  Uploaded:
                </span>{" "}
                {formatDate(selectedItem.createdAt)}
              </p>
            </div>

            <Separator />

            {/* Editable Fields */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[rgb(var(--foreground))]">
                  Alt Text
                </label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image..."
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[rgb(var(--foreground))]">
                  Caption
                </label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Optional caption..."
                  rows={2}
                  className="text-xs resize-none"
                />
              </div>

              <Button
                size="sm"
                className="w-full"
                loading={isUpdating}
                onClick={handleSaveDetails}
              >
                <Save className="h-3.5 w-3.5" />
                Save Details
              </Button>

              <Button
                size="sm"
                variant="destructive"
                className="w-full"
                onClick={() => handleDelete(selectedItem)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete File
              </Button>

              {/* Copy URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[rgb(var(--foreground))]">
                  URL
                </label>
                <div className="flex gap-1">
                  <input
                    readOnly
                    value={selectedItem.url}
                    className="flex-1 min-w-0 text-xs rounded border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/50 px-2 py-1 text-[rgb(var(--muted-foreground))] truncate"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(selectedItem.url)
                    }
                    className="shrink-0 text-xs px-2 py-1 rounded border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete File"
        description={`Are you sure you want to delete "${deleteTarget?.originalName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
      />
    </div>
  );
}
