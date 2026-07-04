"use client";

import { useState, useCallback } from "react";
import { Search, FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaGrid } from "@/components/media/media-grid";
import { MediaUploadZone } from "@/components/media/media-upload-zone";
import { useMedia } from "@/hooks/use-media";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import type { Media } from "@/types/media";

const FOLDERS = [
  { label: "All Files", value: undefined },
  { label: "Images", value: "images" },
  { label: "Videos", value: "videos" },
  { label: "Documents", value: "documents" },
];

interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
  multiple?: boolean;
}

export function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  multiple = false,
}: MediaLibraryModalProps) {
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(
    undefined
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<Media[]>([]);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, refetch } = useMedia({
    search: debouncedSearch || undefined,
    folder: selectedFolder,
    perPage: 50,
  });

  const items = data?.data ?? [];

  const handleSelect = useCallback(
    (item: Media) => {
      if (multiple) {
        setSelectedIds((prev) => {
          if (prev.includes(item.id)) {
            setSelectedItems((items) =>
              items.filter((i) => i.id !== item.id)
            );
            return prev.filter((id) => id !== item.id);
          } else {
            setSelectedItems((items) => [...items, item]);
            return [...prev, item.id];
          }
        });
      } else {
        setSelectedIds([item.id]);
        setSelectedItems([item]);
      }
    },
    [multiple]
  );

  const handleConfirm = () => {
    if (selectedItems.length > 0) {
      if (multiple) {
        selectedItems.forEach((item) => onSelect(item));
      } else {
        onSelect(selectedItems[0]);
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    setSelectedItems([]);
    setSearch("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} size="full">
      <DialogHeader>
        <DialogTitle>Media Library</DialogTitle>
      </DialogHeader>

      <DialogBody className="p-0 flex flex-col" style={{ maxHeight: "70vh" }}>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Sidebar - Folder Navigation */}
          <div className="w-48 shrink-0 border-r border-[rgb(var(--border))] p-3 overflow-y-auto">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
              Folders
            </p>
            <nav className="space-y-0.5">
              {FOLDERS.map((folder) => (
                <button
                  key={folder.label}
                  type="button"
                  onClick={() => setSelectedFolder(folder.value)}
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
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {/* Upload Zone + Search */}
            <div className="border-b border-[rgb(var(--border))] p-4 space-y-3">
              <MediaUploadZone
                folder={selectedFolder}
                onUploadComplete={() => refetch()}
                compact
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                <Input
                  placeholder="Search media..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <MediaGrid
                items={items}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                loading={isLoading}
              />
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <div className="flex items-center gap-3 w-full">
          <p className="text-sm text-[rgb(var(--muted-foreground))] flex-1">
            {selectedIds.length > 0
              ? `${selectedIds.length} file${selectedIds.length > 1 ? "s" : ""} selected`
              : "No files selected"}
          </p>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
          >
            {selectedIds.length > 1
              ? `Insert ${selectedIds.length} Files`
              : "Insert"}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
