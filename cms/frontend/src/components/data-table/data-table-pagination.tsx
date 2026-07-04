"use client";

import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PER_PAGE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

interface DataTablePaginationProps {
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  className?: string;
  showPerPageSelector?: boolean;
}

export function DataTablePagination({
  total,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  className,
  showPerPageSelector = true,
}: DataTablePaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 sm:flex-row",
        className
      )}
    >
      {/* Results count */}
      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        Showing{" "}
        <span className="font-medium text-[rgb(var(--foreground))]">
          {start}
        </span>{" "}
        to{" "}
        <span className="font-medium text-[rgb(var(--foreground))]">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-[rgb(var(--foreground))]">
          {total}
        </span>{" "}
        results
      </p>

      <div className="flex items-center gap-4">
        {/* Per page selector */}
        {showPerPageSelector && onPerPageChange && (
          <Select
            options={PER_PAGE_OPTIONS}
            value={String(perPage)}
            onChange={(e) => {
              onPerPageChange(Number(e.target.value));
              onPageChange(1); // Reset to first page when changing per-page
            }}
            aria-label="Items per page"
            className="w-36 h-8 text-xs"
          />
        )}

        {/* Pagination controls */}
        <Pagination
          total={total}
          page={page}
          perPage={perPage}
          onPageChange={onPageChange}
          showPageNumbers
        />
      </div>
    </div>
  );
}
