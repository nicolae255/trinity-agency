"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadMedia } from "@/hooks/use-media";

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface MediaUploadZoneProps {
  folder?: string;
  onUploadComplete?: () => void;
  compact?: boolean;
}

export function MediaUploadZone({
  folder,
  onUploadComplete,
  compact = false,
}: MediaUploadZoneProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([]);
  const { mutateAsync: uploadMedia } = useUploadMedia();

  const processFiles = useCallback(
    async (files: File[]) => {
      const newItems: UploadFile[] = files.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: "pending" as const,
        progress: 0,
      }));

      setUploadQueue((prev) => [...prev, ...newItems]);

      for (const item of newItems) {
        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "uploading", progress: 30 } : q
          )
        );

        try {
          await uploadMedia({ file: item.file, folder });
          setUploadQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: "success", progress: 100 }
                : q
            )
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Upload failed";
          setUploadQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: "error", error: message, progress: 0 }
                : q
            )
          );
        }
      }

      onUploadComplete?.();

      // Clear completed after 3 seconds
      setTimeout(() => {
        setUploadQueue((prev) =>
          prev.filter((q) => q.status !== "success")
        );
      }, 3000);
    },
    [uploadMedia, folder, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
      "video/*": [".mp4", ".webm"],
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  const removeFromQueue = (id: string) => {
    setUploadQueue((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl transition-all cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          isDragActive
            ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10"
            : "border-[rgb(var(--border))] hover:border-primary-400 hover:bg-[rgb(var(--muted))]/30",
          compact ? "py-6 px-4" : "py-12 px-6"
        )}
      >
        <input {...getInputProps()} aria-label="Upload media files" />
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              isDragActive
                ? "bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400"
                : "bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]"
            )}
          >
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
              {isDragActive ? "Drop files here" : "Upload media"}
            </p>
            {!compact && (
              <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                Drag and drop or click to browse. Supports images, PDFs, and
                videos.
              </p>
            )}
          </div>
          {!compact && (
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              JPG, PNG, GIF, WEBP, SVG, MP4, PDF
            </p>
          )}
        </div>
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          {uploadQueue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2"
            >
              {/* Status Icon */}
              <div className="shrink-0">
                {item.status === "uploading" && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                )}
                {item.status === "success" && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {item.status === "error" && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                {item.status === "pending" && (
                  <div className="h-4 w-4 rounded-full border-2 border-[rgb(var(--border))]" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-[rgb(var(--foreground))]">
                  {item.file.name}
                </p>
                {item.status === "uploading" && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[rgb(var(--muted))]">
                    <div
                      className="h-full bg-primary-600 transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === "error" && (
                  <p className="text-xs text-red-600">{item.error}</p>
                )}
                {item.status === "success" && (
                  <p className="text-xs text-green-600">Uploaded</p>
                )}
              </div>

              {/* Remove Button */}
              {item.status !== "uploading" && (
                <button
                  type="button"
                  onClick={() => removeFromQueue(item.id)}
                  className="shrink-0 p-1 rounded text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
                  aria-label="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
