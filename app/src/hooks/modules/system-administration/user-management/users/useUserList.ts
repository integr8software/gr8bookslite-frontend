"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import {
  UserListTableColumns,
  UserListStatusOptions,
} from "@/app/src/constants/modules/user-management/UserListConstants";
import type {
  UserManagementRecord,
  UserRoleRecord,
  UserStatus,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import type {
  UserListTableColumnKey,
  UserListTableRecord,
} from "@/app/src/types/modules/user-management/UserListTypes";

type UseUserListTableInput = {
  users: UserManagementRecord[];
  userRoles: UserRoleRecord[];
};

export function useUserListTable({
  users,
  userRoles,
}: UseUserListTableInput) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [query, setQueryState] = useState("");
  const [roleFilter, setRoleFilterState] = useState("All");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [statusFilter, setStatusFilterState] = useState<UserStatus | "All">(
    "All",
  );
  const roleOptions = useMemo(
    () => userRoles.map((role) => role.name).sort(),
    [userRoles],
  );
  const statusOptions = useMemo(() => [...UserListStatusOptions], []);
  const tableData = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        userRole:
          userRoles.find((role) => role.id === user.userRoleId)?.name ?? "-",
      })),
    [userRoles, users],
  );
  const filteredUsers = useMemo(
    () =>
      tableData.filter((user) => {
        const searchable = [
          user.name,
          user.email,
          user.contactNumber,
          user.userRole,
          user.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          searchable.includes(query.toLowerCase()) &&
          (statusFilter === "All" || user.status === statusFilter) &&
          (roleFilter === "All" || user.userRole === roleFilter)
        );
      }),
    [query, roleFilter, statusFilter, tableData],
  );
  const columns = useMemo<ColumnDef<UserListTableRecord>[]>(
    () =>
      UserListTableColumns.map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            meta: { className: column.className },
          };
        }

        return createUserColumn(column.key, column.label, column.className);
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function resetFilters() {
    setQueryState("");
    setRoleFilterState("All");
    setStatusFilterState("All");
    table.setPageIndex(0);
  }

  function setQuery(value: string) {
    setQueryState(value);
    table.setPageIndex(0);
  }

  function setRoleFilter(value: string) {
    setRoleFilterState(value);
    table.setPageIndex(0);
  }

  function setStatusFilter(value: UserStatus | "All") {
    setStatusFilterState(value);
    table.setPageIndex(0);
  }

  return {
    query,
    resetFilters,
    roleFilter,
    roleOptions,
    setQuery,
    setRoleFilter,
    setStatusFilter,
    statusFilter,
    statusOptions,
    table,
  };
}

function createUserColumn(
  key: UserListTableColumnKey,
  header: string,
  className: string,
): ColumnDef<UserListTableRecord> {
  return {
    accessorKey: key,
    header,
    sortingFn: "alphanumeric",
    meta: { className },
  };
}
