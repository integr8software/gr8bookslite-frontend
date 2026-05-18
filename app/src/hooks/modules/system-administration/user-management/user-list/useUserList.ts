"use client";

import { useMemo, useState } from "react";
import {
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserListMockData } from "@/app/src/data/modules/system-administration/user-management/user-list/UserListData";
import { UserListQueryKeys } from "@/app/src/services/modules/system-administration/user-management/user-list/UserListQueryKeys";
import type {
  UserListRecord,
  UserListStatus,
} from "@/app/src/types/modules/user-management/UserListTypes";

type UseUserListTableInput = {
  columns: ColumnDef<UserListRecord>[];
};

export function useUserListTable({ columns }: UseUserListTableInput) {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const usersQuery = useQuery({
    queryKey: UserListQueryKeys.users(),
    queryFn: async () => UserListMockData,
    initialData: UserListMockData,
  });

  const updateUsersStatusMutation = useMutation({
    mutationFn: async ({
      status,
      userIds,
    }: {
      status: UserListStatus;
      userIds: string[];
    }) => ({ status, userIds }),
    onSuccess: ({ status, userIds }) => {
      queryClient.setQueryData<UserListRecord[]>(
        UserListQueryKeys.users(),
        (currentUsers = UserListMockData) =>
          currentUsers.map((user) =>
            userIds.includes(user.id) ? { ...user, status } : user,
          ),
      );
      setRowSelection({});
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    data: usersQuery.data,
    columns,
    state: {
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
      sorting,
    },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: (updater) => {
      const nextValue = functionalUpdate(updater, globalFilter);

      setGlobalFilter(nextValue ?? "");
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 8,
      },
    },
  });

  const selectedUsers = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);
  const activeStatusFilter = getStatusFilterValue(columnFilters);
  const activeGroupFilter = getStringFilterValue(columnFilters, "userGroup");
  const activeTypeFilter = getStringFilterValue(columnFilters, "userType");
  const groupOptions = useMemo(
    () =>
      Array.from(new Set(usersQuery.data.map((user) => user.userGroup))).sort(),
    [usersQuery.data],
  );
  const typeOptions = useMemo(
    () =>
      Array.from(new Set(usersQuery.data.map((user) => user.userType))).sort(),
    [usersQuery.data],
  );

  function setStatusFilter(status: UserListStatus | "All") {
    table
      .getColumn("status")
      ?.setFilterValue(status === "All" ? undefined : status);
  }

  function setGroupFilter(group: string) {
    table
      .getColumn("userGroup")
      ?.setFilterValue(group === "All" ? undefined : group);
  }

  function setTypeFilter(type: string) {
    table
      .getColumn("userType")
      ?.setFilterValue(type === "All" ? undefined : type);
  }

  function resetFilters() {
    setColumnFilters([]);
    setSorting([]);
    setRowSelection({});
    setGlobalFilter("");
  }

  function updateSelectedUsersStatus(status: UserListStatus) {
    updateUsersStatusMutation.mutate({
      status,
      userIds: selectedUsers.map((user) => user.id),
    });
  }

  return {
    activeGroupFilter,
    activeStatusFilter,
    activeTypeFilter,
    globalFilter,
    groupOptions,
    isLoading: usersQuery.isLoading,
    isUpdatingStatus: updateUsersStatusMutation.isPending,
    resetFilters,
    selectedUsers,
    setGlobalFilter,
    setGroupFilter,
    setStatusFilter,
    setTypeFilter,
    table,
    totalUsers: usersQuery.data.length,
    typeOptions,
    updateSelectedUsersStatus,
  };
}

function getStatusFilterValue(columnFilters: ColumnFiltersState) {
  return columnFilters.find((filter) => filter.id === "status")?.value as
    | UserListStatus
    | undefined;
}

function getStringFilterValue(
  columnFilters: ColumnFiltersState,
  columnId: string,
) {
  return columnFilters.find((filter) => filter.id === columnId)?.value as
    | string
    | undefined;
}
