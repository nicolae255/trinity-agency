"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Hash, MoreHorizontal, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type ColumnDef } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "@/hooks/use-tags";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate, slugify } from "@/lib/utils";
import type { Tag, CreateTagInput } from "@/types/tag";

interface TagDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTagInput) => void;
  initialData?: Tag;
  isLoading?: boolean;
}

function TagDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: TagDialogProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, slug: slug || slugify(name) });
  };

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogHeader>
        <DialogTitle>{initialData ? "Edit Tag" : "New Tag"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[rgb(var(--foreground))]">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!initialData) setSlug(slugify(e.target.value));
              }}
              placeholder="Tag name"
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[rgb(var(--foreground))]">
              Slug
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="tag-slug"
              className="font-mono text-sm"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {initialData ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

export default function TagsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Tag | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useTags({
    page,
    perPage: 20,
    search: debouncedSearch || undefined,
  });

  const { mutateAsync: createTag, isPending: isCreating } = useCreateTag();
  const { mutateAsync: updateTag, isPending: isUpdating } = useUpdateTag();
  const { mutate: deleteTag, isPending: isDeleting } = useDeleteTag();

  const tags = data?.data ?? [];
  const pagination = data?.meta;

  const handleCreate = async (input: CreateTagInput) => {
    await createTag(input);
    setFormOpen(false);
  };

  const handleUpdate = async (input: CreateTagInput) => {
    if (!editTarget) return;
    await updateTag({ id: editTarget.id, ...input });
    setEditTarget(null);
  };

  const columns: ColumnDef<Tag>[] = [
    {
      id: "name",
      header: "Name",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-[rgb(var(--muted-foreground))] shrink-0" />
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
        title="Tags"
        description="Manage content tags to help users discover related posts."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            New Tag
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search tags..."
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
        data={tags as any}
        keyField="id"
        loading={isLoading}
        emptyMessage="No tags found. Create your first tag."
        emptyIcon={<Hash className="h-8 w-8" />}
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

      {/* Create Dialog */}
      <TagDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />

      {/* Edit Dialog */}
      {editTarget && (
        <TagDialog
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
            deleteTag(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Tag"
        description={`Are you sure you want to delete the tag "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
      />
    </div>
  );
}
