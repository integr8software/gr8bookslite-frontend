"use client";

import {
  useMemo,
  useState,
  type ChangeEventHandler,
  type ReactNode,
} from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  flexRender,
  type ColumnDef,
  type Table as ReactTable,
} from "@tanstack/react-table";
import {
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Edit3,
  Eye,
  Plus,
  Search,
  UserCircle,
} from "lucide-react";
import {
  UserListHref,
  UserListStatusOptions,
} from "@/app/src/constants/modules/user-management/UserListConstants";
import { useUserListTable } from "@/app/src/hooks/modules/system-administration/user-management/user-list/useUserList";
import { AppConfirmDialog } from "@/app/src/ui/shared/AppConfirmDialog";
import { AppSkeleton } from "@/app/src/ui/shared/AppSkeleton";
import type {
  UserListRecord,
  UserListStatus,
} from "@/app/src/types/modules/user-management/UserListTypes";

export function UserListTable() {
  const [statusChangeTarget, setStatusChangeTarget] =
    useState<UserListStatus | null>(null);
  const columns = useMemo<ColumnDef<UserListRecord>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            label="Select all users on this page"
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            label={`Select ${row.original.name}`}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 48,
      },
      {
        accessorKey: "name",
        header: "Full Name",
        cell: ({ row }) => <UserIdentity user={row.original} />,
        enableHiding: false,
      },
      {
        accessorKey: "username",
        header: "Username",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "contactNo",
        header: "Contact No",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "userType",
        header: "User Type",
        cell: ({ getValue }) => <TypeBadge value={getValue<string>()} />,
      },
      {
        accessorKey: "userGroup",
        header: "User Group",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<UserListStatus>()} />,
      },
      {
        accessorKey: "lastLogin",
        header: "Last Login",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            <span className="block font-medium text-darknavy">
              {row.original.lastLoginMeta.split("  ")[0] ?? row.original.lastLogin}
            </span>
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <RowActions user={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );
  const {
    activeGroupFilter,
    activeStatusFilter,
    activeTypeFilter,
    globalFilter,
    groupOptions,
    isLoading,
    isUpdatingStatus,
    resetFilters,
    selectedUsers,
    setGlobalFilter,
    setGroupFilter,
    setStatusFilter,
    setTypeFilter,
    table,
    totalUsers,
    typeOptions,
    updateSelectedUsersStatus,
  } = useUserListTable({ columns });
  const selectedCount = selectedUsers.length;

  function handleChangeSelectedStatus(status: UserListStatus) {
    if (!selectedCount) {
      return;
    }

    setStatusChangeTarget(status);
  }

  function handleConfirmStatusChange() {
    if (!statusChangeTarget) {
      return;
    }

    updateSelectedUsersStatus(statusChangeTarget);
    toast.success(`${selectedCount} user(s) set to ${statusChangeTarget}.`);
    setStatusChangeTarget(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-darknavy/10 px-4 py-3">
          <div className="relative w-full sm:w-64 lg:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40"
              aria-hidden="true"
            />
            <input
              type="search"
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder="Search users..."
              className="h-9 w-full rounded border border-darknavy/10 bg-white pl-9 pr-3 text-xs text-darknavy outline-none transition placeholder:text-darknavy/38 hover:border-skyblue/45 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
            />
          </div>

          <div className="grid min-w-full flex-1 gap-3 sm:min-w-0 sm:grid-cols-2 xl:grid-cols-3">
            <ToolbarSelect
              label="Status"
              value={activeStatusFilter ?? "All"}
              options={["All", ...UserListStatusOptions]}
              onChange={(value) => setStatusFilter(value as UserListStatus | "All")}
            />
            <ToolbarSelect
              label="User Type"
              value={activeTypeFilter ?? "All"}
              options={["All", ...typeOptions]}
              onChange={setTypeFilter}
            />
            <ToolbarSelect
              label="User Group"
              value={activeGroupFilter ?? "All"}
              options={["All", ...groupOptions]}
              onChange={setGroupFilter}
            />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded border border-darknavy/10 bg-white px-4 text-xs font-semibold text-darknavy/45 transition hover:border-skyblue/45 hover:bg-skyblue/8 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25"
          >
            Reset
          </button>
          <Link
            href={`${UserListHref}/add`}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/15 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add User
          </Link>
        </div>

        {selectedCount ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 bg-blue-50/70 px-4 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-darknavy">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              {selectedCount} selected
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleChangeSelectedStatus("Active")}
                disabled={isUpdatingStatus}
                className="inline-flex h-9 items-center justify-center rounded border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                Set Active
              </button>
              <button
                type="button"
                onClick={() => handleChangeSelectedStatus("Inactive")}
                disabled={isUpdatingStatus}
                className="inline-flex h-9 items-center justify-center rounded border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
              >
                Set Inactive
              </button>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-7xl border-separate border-spacing-0">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-darknavy/2">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={getHeaderClassName(header.column.id)}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1.5"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <ChevronDown
                            className={getSortIconClassName(
                              header.column.getIsSorted(),
                            )}
                            aria-hidden="true"
                          />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <UserTableSkeletonRows
                  columnCount={table.getVisibleLeafColumns().length}
                />
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group transition hover:bg-skyblue/[0.04]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={getCellClassName(cell.column.id)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={table.getVisibleLeafColumns().length}
                    className="px-5 py-14 text-center text-sm text-darknavy/55"
                  >
                    No users match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination table={table} totalUsers={totalUsers} />
      </div>

      <AppConfirmDialog
        isOpen={Boolean(statusChangeTarget)}
        isPending={isUpdatingStatus}
        title="Change user status?"
        description={`Set ${selectedCount} selected user${selectedCount === 1 ? "" : "s"} to ${statusChangeTarget ?? "this status"}.`}
        confirmLabel="Confirm"
        onCancel={() => setStatusChangeTarget(null)}
        onConfirm={handleConfirmStatusChange}
      />
    </>
  );
}

function UserIdentity({ user }: { user: UserListRecord }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {user.profileImageUrl ? (
        <span
          aria-hidden="true"
          className="block h-8 w-8 shrink-0 rounded-full bg-cover bg-center ring-1 ring-darknavy/10"
          style={{ backgroundImage: `url("${user.profileImageUrl}")` }}
        />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-skyblue/18 text-darknavy ring-1 ring-darknavy/10">
          <UserCircle className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 truncate font-semibold text-darknavy">
        {user.name}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: UserListStatus }) {
  const classes = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Pending: "bg-amber-50 text-amber-700 ring-amber-100",
    Inactive: "bg-orange-50 text-orange-700 ring-orange-100",
  } satisfies Record<UserListStatus, string>;

  return (
    <span
      className={`inline-flex min-h-6 items-center rounded px-2.5 text-xs font-semibold ring-1 ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function TypeBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex min-h-6 items-center rounded bg-blue-50 px-2.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
      {value}
    </span>
  );
}

function RowActions({ user }: { user: UserListRecord }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <ActionLink href={`${UserListHref}/edit/${user.id}`} label="Edit">
        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
      </ActionLink>
      <ActionLink href={`${UserListHref}/view/${user.id}`} label="View">
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
      </ActionLink>
    </div>
  );
}

function ActionLink({
  children,
  href,
  label,
}: {
  children: ReactNode;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded border border-darknavy/10 text-darknavy/60 transition hover:border-skyblue/45 hover:bg-skyblue/8 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25"
    >
      {children}
    </Link>
  );
}

function Checkbox({
  checked,
  indeterminate,
  label,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label className="inline-flex h-4 w-4 items-center justify-center">
      <span className="sr-only">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        aria-checked={indeterminate ? "mixed" : checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-darknavy/20 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-skyblue/35"
      />
    </label>
  );
}

function ToolbarSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <label className="flex min-w-0 items-center gap-2 text-xs font-semibold text-darknavy/48">
      <span className="whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-0 flex-1 rounded border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy outline-none transition hover:border-skyblue/45 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TablePagination({
  table,
  totalUsers,
}: {
  table: ReactTable<UserListRecord>;
  totalUsers: number;
}) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const firstItem = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const lastItem = Math.min(filteredCount, (pageIndex + 1) * pageSize);
  const pageCount = Math.max(table.getPageCount(), 1);
  const pageOptions = Array.from({ length: pageCount }, (_, index) => index);

  return (
    <div className="grid gap-3 px-4 py-4 text-sm text-darknavy/60 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      <p>
        Showing {firstItem} to {lastItem} of {filteredCount} users
        {filteredCount !== totalUsers ? ` filtered from ${totalUsers}` : ""}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <PaginationButton
          disabled={!table.getCanPreviousPage()}
          label="First"
          onClick={() => table.firstPage()}
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          First
        </PaginationButton>
        <PaginationButton
          disabled={!table.getCanPreviousPage()}
          label="Previous"
          onClick={() => table.previousPage()}
        >
          Prev
        </PaginationButton>
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-darknavy/55">Page</span>
          <select
            value={pageIndex}
            onChange={(event) => table.setPageIndex(Number(event.target.value))}
            className="h-9 rounded border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy outline-none focus:ring-2 focus:ring-skyblue/25"
          >
            {pageOptions.map((page) => (
              <option key={page} value={page}>
                {page + 1}
              </option>
            ))}
          </select>
          <span className="text-sm font-medium text-darknavy/55">
            of {pageCount}
          </span>
        </label>
        <PaginationButton
          disabled={!table.getCanNextPage()}
          label="Next"
          onClick={() => table.nextPage()}
        >
          Next
        </PaginationButton>
        <PaginationButton
          disabled={!table.getCanNextPage()}
          label="Last"
          onClick={() => table.lastPage()}
        >
          Last
          <ChevronsRight className="h-4 w-4" aria-hidden="true" />
        </PaginationButton>
      </div>
      <span aria-hidden="true" />
    </div>
  );
}

function UserTableSkeletonRows({ columnCount }: { columnCount: number }) {
  return Array.from({ length: 5 }, (_, rowIndex) => (
    <tr key={rowIndex}>
      {Array.from({ length: columnCount }, (_, columnIndex) => (
        <td
          key={`${rowIndex}-${columnIndex}`}
          className="border-b border-darknavy/8 px-4 py-3 first:pl-5 last:pr-5"
        >
          <AppSkeleton
            className={
              columnIndex === 1
                ? "h-8 w-40 rounded"
                : "mx-auto h-4 w-20 rounded"
            }
          />
        </td>
      ))}
    </tr>
  ));
}

function PaginationButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-9 items-center justify-center gap-1 rounded border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy transition hover:border-skyblue/45 hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
    >
      {children}
    </button>
  );
}

function getSortIconClassName(sortState: false | "asc" | "desc") {
  return [
    "h-3.5 w-3.5 transition",
    sortState === "asc" ? "rotate-180 text-blue-600" : "",
    sortState === "desc" ? "text-blue-600" : "",
    !sortState ? "text-darknavy/35" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function getCellClassName(columnId: string) {
  const textAlignment =
    columnId === "name" ||
      columnId === "username" ||
      columnId === "email" ||
      columnId === "userGroup"
      ? "text-left"
      : columnId === "actions"
        ? "text-center"
        : "text-center";

  return [
    "border-b border-darknavy/8 px-4 py-3 align-middle text-xs text-darknavy first:pl-5 last:pr-5",
    textAlignment,
  ].join(" ");
}

function getHeaderClassName(columnId: string) {
  const textAlignment =
    columnId === "name" ||
      columnId === "username" ||
      columnId === "email" ||
      columnId === "userGroup"
      ? "text-left"
      : columnId === "actions"
        ? "text-center"
        : "text-center";

  return [
    "border-b border-darknavy/10 px-4 py-3 text-xs font-semibold text-darknavy/70 first:pl-5 last:pr-5",
    textAlignment,
  ].join(" ");
}
