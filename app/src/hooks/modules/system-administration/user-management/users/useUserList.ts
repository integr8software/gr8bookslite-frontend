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
} from "@/app/src/constants/modules/user-management/UserListConstants";
import type { UserRoleRecord } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import type { UserManagementRecord } from "@/app/src/types/modules/user-management/UserManagementTypes";
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
  const roleOptions = useMemo(
    () => userRoles.map((role) => role.name).sort(),
    [userRoles],
  );
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
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          searchable.includes(query.toLowerCase()) &&
          (roleFilter === "All" || user.userRole === roleFilter)
        );
      }),
    [query, roleFilter, tableData],
  );
  const columns = useMemo<ColumnDef<UserListTableRecord>[]>(
    () =>
      UserListTableColumns.map((column) =>
        createUserColumn(column.key, column.label, column.className),
      ),
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

  return {
    query,
    resetFilters,
    roleFilter,
    roleOptions,
    setQuery,
    setRoleFilter,
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
