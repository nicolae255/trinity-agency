"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type ColumnDef } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CategoryForm } from "@/components/forms/category-form";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/utils";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";
import { MoreHorizontal } from "lucide-react";

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useCategories({
    page,
    perPage: 20,
    search: debouncedSearch || undefined,
  });

  const { mutateAsync: createCategory, isPending: isCreating } =
    useCreateCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } =
    useUpdateCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const categories = data?.data ?? [];
  const pagination = data?.meta;

  const handleCreate = async (input: CreateCategoryInput) => {
    await createCategory(input);
    setFormOpen(false);
  };

  const handleUpdate = async (input: CreateCategoryInput) => {
    if (!editTarget) return;
    await updateCategory({ id: editTarget.id, ...input } as UpdateCategoryInput);
    setEditTarget(null);
  };

  const columns: ColumnDef<Category>[] = [
    {
      id: "name",
      header: "Name",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-[rgb(var(--muted-foreground))] shrink-0" />
          <span className="font-medium text-[rgb(var(--foreground))]">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      id: "slug",
      header: "Slug",
      cell: (row) => (
        <code className="text-xs bg-[rgb(var(--muted))] px-1.5 py-0.5 rounded text-[rgb(var(--muted-foreground))]">
          {row.slug}
        </code>
      ),
    },
    {
      id: "parent",
      header: "Parent",
      cell: (row) => (
        <span className="text-sm text-[rgb(var(--muted-foreground))]">
          {row.parent?.name ?? "—"}
        </span>
      ),
    },
    {
      id: "posts",
      header: "Posts",
      cell: (row) => (
        <span className="text-sm font-medium text-[rgb(var(--foreground))]">
          {row._count?.posts ?? 0}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      cell: (row) => (
        <span className="text-sm text-[rgb(var(--muted-foreground))]">
          {formatDate(row.createdAt)}
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
              aria-label={`Actions for ${row.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setEditTarget(row)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
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
        title="Categories"
        description="Organize your posts with categories."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={categories as any}
        keyField="id"
        loading={isLoading}
        emptyMessage="No categories found. Create your first category."
        emptyIcon={<Tag className="h-8 w-8" />}
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

      {/* Create Form Dialog */}
      <CategoryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />

      {/* Edit Form Dialog */}
      {editTarget && (
        <CategoryForm
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleUpdate}
          initialData={editTarget}
          isLoading={isUpdating}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteCategory(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Posts in this category will be uncategorized.`}
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
      />
    </div>
  );
}
