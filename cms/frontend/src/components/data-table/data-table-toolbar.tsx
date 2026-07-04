"use client";

import { type ReactNode, useCallback } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface DataTableToolbarProps {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: FilterConfig[];
  actions?: ReactNode;
  bulkActions?: ReactNode;
  selectedCount?: number;
  className?: string;
}

export function DataTableToolbar({
  search,
  filters,
  actions,
  bulkActions,
  selectedCount = 0,
  className,
}: DataTableToolbarProps) {
  const [localSearch, setLocalSearch] = useState(search?.value ?? "");
  const debouncedSearch = useDebounce(localSearch, 350);

  // Propagate debounced search up
  useEffect(() => {
    if (search?.onChange && debouncedSearch !== search.value) {
      search.onChange(debouncedSearch);
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearch(e.target.value);
    },
    []
  );

  const handleSearchClear = useCallback(() => {
    setLocalSearch("");
    search?.onChange("");
  }, [search]);

  const hasActiveFilters =
    filters?.some((f) => f.value !== "") || localSearch !== "";

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main toolbar row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        {search && (
          <div className="relative flex-1 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder={search.placeholder ?? "Search..."}
              aria-label={search.placeholder ?? "Search"}
              className={cn(
                "flex h-9 w-full rounded-md border bg-[rgb(var(--card))] pl-9 pr-4 text-sm",
                "border-[rgb(var(--border))] text-[rgb(var(--foreground))]",
                "placeholder:text-[rgb(var(--muted-foreground))]",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500",
                localSearch && "pr-8"
              )}
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        {filters && filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <div key={filter.id} className="relative">
                <select
                  id={`filter-${filter.id}`}
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  aria-label={filter.label}
                  className={cn(
                    "h-9 appearance-none rounded-md border bg-[rgb(var(--card))] pl-3 pr-7 text-sm",
                    "border-[rgb(var(--border))] text-[rgb(var(--foreground))]",
                    "transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                    filter.value && "border-primary-400 text-primary-700 dark:text-primary-300"
                  )}
                >
                  <option value="">{filter.label}: All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[rgb(var(--muted-foreground))]"
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions slot */}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>

      {/* Bulk actions bar (shown when rows are selected) */}
      {selectedCount > 0 && bulkActions && (
        <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 dark:border-primary-800 dark:bg-primary-950/30">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
          </span>
          <div className="flex items-center gap-2">{bulkActions}</div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
          <span>Filters active</span>
          <button
            type="button"
            onClick={() => {
              handleSearchClear();
              filters?.forEach((f) => f.onChange(""));
            }}
            className="text-primary-600 hover:underline dark:text-primary-400"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
