"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PaginationProps {
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
}

function getPageNumbers(
  currentPage: number,
  totalPages: number
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];

  if (currentPage <= 4) {
    pages.push(2, 3, 4, 5, "ellipsis", totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages
    );
  } else {
    pages.push(
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages
    );
  }

  return pages;
}

export function Pagination({
  total,
  page,
  perPage,
  onPageChange,
  className,
  showPageNumbers = true,
}: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const pageNumbers = showPageNumbers ? getPageNumbers(page, totalPages) : [];

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center gap-1", className)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showPageNumbers &&
        pageNumbers.map((pageNum, idx) => {
          if (pageNum === "ellipsis") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-9 w-9 items-center justify-center"
                aria-hidden="true"
              >
                <MoreHorizontal className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
              </span>
            );
          }

          return (
            <Button
              key={pageNum}
              variant={pageNum === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(pageNum)}
              aria-label={`Page ${pageNum}`}
              aria-current={pageNum === page ? "page" : undefined}
            >
              {pageNum}
            </Button>
          );
        })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
