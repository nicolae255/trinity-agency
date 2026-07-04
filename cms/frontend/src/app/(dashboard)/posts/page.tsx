"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Globe, EyeOff, FileText, MoreHorizontal } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { usePosts, useDeletePost, usePublishPost, useUnpublishPost } from "@/hooks/use-posts";
import { useAllCategories } from "@/hooks/use-categories";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/utils";
import type { Post, PostStatus } from "@/types/post";

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = usePosts({
    page,
    perPage: 20,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    categoryId: categoryFilter || undefined,
  });

  const { data: categories = [] } = useAllCategories();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: publishPost } = usePublishPost();
  const { mutate: unpublishPost } = useUnpublishPost();

  const posts = data?.data ?? [];
  const pagination = data?.meta;

  const columns: ColumnDef<Post>[] = [
    {
      id: "title",
      header: "Title",
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-[rgb(var(--muted-foreground))] shrink-0" />
          <Link
            href={`/posts/${row.id}/edit`}
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
          {row.author
            ? `${row.author.firstName} ${row.author.lastName}`
            : "—"}
        </span>
      ),
    },
    {
      id: "categories",
      header: "Categories",
      cell: (row) => {
        const cats = row.categories ?? [];
        if (cats.length === 0) return <span className="text-[rgb(var(--muted-foreground))]">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {cats.slice(0, 2).map((cat) => (
              <Badge key={cat.id} variant="secondary" className="text-xs">
                {cat.name}
              </Badge>
            ))}
            {cats.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{cats.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "publishedAt",
      header: "Published",
      cell: (row) => (
        <span className="text-sm text-[rgb(var(--muted-foreground))]">
          {row.publishedAt ? formatDate(row.publishedAt) : "—"}
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
              <Link
                href={`/posts/${row.id}/edit`}
                className="flex items-center gap-2"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.status !== "PUBLISHED" ? (
              <DropdownMenuItem
                onClick={() => publishPost(row.id)}
                className="flex items-center gap-2"
              >
                <Globe className="h-3.5 w-3.5" /> Publish
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => unpublishPost(row.id)}
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
        title="Posts"
        description="Manage your blog posts and articles."
        actions={
          <Button asChild>
            <Link href="/posts/new">
              <Plus className="h-4 w-4" />
              New Post
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
        <Input
          placeholder="Search posts..."
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
            setStatusFilter(e.target.value as PostStatus | "");
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
        <Select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={posts as any}
        keyField="id"
        loading={isLoading}
        emptyMessage="No posts found. Create your first post."
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
            deletePost(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Post"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
      />
    </div>
  );
}
