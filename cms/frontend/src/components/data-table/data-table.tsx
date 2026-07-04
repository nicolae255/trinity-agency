"use client";

import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface SortState {
  column: string;
  direction: "asc" | "desc";
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  loadingRows?: number;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (row: T) => void;
  sortState?: SortState;
  onSortChange?: (sort: SortState) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  loading = false,
  loadingRows = 5,
  emptyMessage = "No data found.",
  emptyIcon,
  onRowClick,
  sortState,
  onSortChange,
  className,
}: DataTableProps<T>) {
  const handleSort = (columnId: string) => {
    if (!onSortChange) return;

    if (sortState?.column === columnId) {
      onSortChange({
        column: columnId,
        direction: sortState.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ column: columnId, direction: "asc" });
    }
  };

  const getSortIcon = (columnId: string) => {
    if (sortState?.column !== columnId) {
      return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40" />;
    }
    return sortState.direction === "asc" ? (
      <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
    ) : (
      <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
    );
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]",
        "overflow-hidden",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.id}
                sortable={col.sortable && !!onSortChange}
                sorted={
                  sortState?.column === col.id ? sortState.direction : false
                }
                onClick={
                  col.sortable && onSortChange
                    ? () => handleSort(col.id)
                    : undefined
                }
                className={col.headerClassName}
              >
                <span className="inline-flex items-center">
                  {col.header}
                  {col.sortable && onSortChange && getSortIcon(col.id)}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            // Loading skeleton rows
            Array.from({ length: loadingRows }).map((_, rowIdx) => (
              <TableRow key={`skeleton-${rowIdx}`}>
                {columns.map((col, colIdx) => (
                  <TableCell key={col.id}>
                    <Skeleton
                      className={cn(
                        "h-4",
                        colIdx === 0 ? "w-3/4" : "w-1/2"
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-16 text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  {emptyIcon && (
                    <div className="text-[rgb(var(--muted-foreground))]">
                      {emptyIcon}
                    </div>
                  )}
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {emptyMessage}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            // Data rows
            data.map((row) => {
              const rowKey = String(row[keyField]);
              return (
                <TableRow
                  key={rowKey}
                  clickable={!!onRowClick}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.className}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? "—")
                        : "—"}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
