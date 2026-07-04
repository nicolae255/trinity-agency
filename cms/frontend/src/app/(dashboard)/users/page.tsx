"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Users, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type ColumnDef } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUsers, useDeleteUser } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import { formatRelativeDate, formatRole, hasMinimumRole } from "@/lib/utils";
import { Role, type User } from "@/types/auth";

const roleVariants: Record<
  Role,
  "default" | "secondary" | "outline" | "success" | "warning"
> = {
  [Role.SUPER_ADMIN]: "default",
  [Role.ADMIN]: "warning",
  [Role.EDITOR]: "secondary",
  [Role.AUTHOR]: "outline",
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { user: currentUser } = useAuth();
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useUsers({
    page,
    perPage: 20,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
  });

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const users = data?.data ?? [];
  const pagination = data?.meta;

  // Only admins and super admins can access this page
  if (currentUser && !hasMinimumRole(currentUser.role, "ADMIN")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-10 w-10 mx-auto text-[rgb(var(--muted-foreground))] mb-3" />
          <p className="text-[rgb(var(--muted-foreground))]">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  const columns: ColumnDef<User>[] = [
    {
      id: "name",
      header: "Name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.avatar ?? undefined}
            firstName={row.firstName}
            lastName={row.lastName}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
              {row.firstName} {row.lastName}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: (row) => (
        <span className="text-sm text-[rgb(var(--muted-foreground))]">
          {row.email}
        </span>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (row) => (
        <Badge variant={roleVariants[row.role] ?? "secondary"}>
          {formatRole(row.role)}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      header: "Joined",
      cell: (row) => (
        <span className="text-sm text-[rgb(var(--muted-foreground))]">
          {formatRelativeDate(row.createdAt)}
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
              aria-label={`Actions for ${row.firstName} ${row.lastName}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/users/${row.id}/edit`}
                className="flex items-center gap-2"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            {row.id !== currentUser?.id && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteTarget(row)}
                  className="text-red-600 focus:text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage team members and their access levels."
        actions={
          <Button asChild>
            <Link href="/users/new">
              <Plus className="h-4 w-4" />
              New User
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />
        <Select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as Role | "");
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="">All Roles</option>
          <option value={Role.SUPER_ADMIN}>Super Admin</option>
          <option value={Role.ADMIN}>Admin</option>
          <option value={Role.EDITOR}>Editor</option>
          <option value={Role.AUTHOR}>Author</option>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users as any}
        keyField="id"
        loading={isLoading}
        emptyMessage="No users found."
        emptyIcon={<Users className="h-8 w-8" />}
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
            deleteUser(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
      />
    </div>
  );
}
