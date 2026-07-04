"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Globe, EyeOff, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type ColumnDef } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePages, useDeletePage, usePublishPage, useUnpublishPage } from "@/hooks/use-pages";
import { useDebounce } from "@/hooks/use-debounce";
import { formatRelativeDate } from "@/lib/utils";
import type { Page } from "@/types/page";
import type { PageStatus } from "@/types/page";
import { MoreHorizontal } from "lucide-react";

export default function PagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PageStatus | "">("");
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = usePages({
    page,
    perPage: 20,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  const { mutate: deletePage, isPending: isDeleting } = useDeletePage();
  const { mutate: publishPage } = usePublishPage();
  const { mutate: unpublishPage } = useUnpublishPage();

  const pages = data?.data ?? [];
  const pagination = data?.meta;

  const columns: ColumnDef<Page>[] = [
    {
      id: "title",
      header: "Title",
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-[rgb(var(--muted-foreground))] shrink-0" />
          <Link
            href={`/pages/${row.id}/edit`}
            className="font-medium text-[rgb(var(--foreground))] hover:text-primary-600 truncate max-w-xs transition-colors"
          >
            {row.title}
          </Link>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "author",
      header: "Author",
      cell: (row) => (
        <span className="text-sm text-[rgb(var(--muted-foreground))]">
          {row.author ? `${row.author.firstName} ${row.author.lastName}` : "—"}
        </span>
      ),
    },
    {
      id: "updatedAt",
      header: "Last Updated",
      cell: (row) => (
        <span className="text-sm text-[rgb(var(--muted-foreground))]">
          {formatRelativeDate(row.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "w-10",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${row.title}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/pages/${row.id}/edit`} className="flex items-center gap-2">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.status !== "PUBLISHED" ? (
              <DropdownMenuItem
                onClick={() => publishPage(row.id)}
                className="flex items-center gap-2"
              >
                <Globe className="h-3.5 w-3.5" /> Publish
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => unpublishPage(row.id)}
                className="flex items-center gap-2"
              >
                <EyeOff className="h-3.5 w-3.5" /> Unpublish
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteTarget(row)}
              className="text-red-600 focus:text-red-600 flex items-center gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pages"
        description="Manage your site's static pages."
        actions={
          <Button asChild>
            <Link href="/pages/new">
              <Plus className="h-4 w-4" />
              New Page
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search pages..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as PageStatus | "");
            setPage(1);
          }}
          className="sm:w-40"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={pages as any}
        keyField="id"
        loading={isLoading}
        emptyMessage="No pages found. Create your first page."
        emptyIcon={<FileText className="h-8 w-8" />}
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deletePage(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Page"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
      />
    </div>
  );
}
