"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChartsOfAccountsTableColumns,
  ChartsOfAccountsNavs,
  type ChartsOfAccountsNav,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import {
  flattenAccounts,
  isSpecificAccount,
  moveOrReorderAccount,
} from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsData";
import {
  DeactivateChartAccount,
  FetchChartAccountsTree,
  SaveChartAccount,
} from "@/app/src/services/modules/maintenance/charts-of-accounts/ChartsOfAccountsApi";
import { ChartsOfAccountsQueryKeys } from "@/app/src/services/modules/maintenance/charts-of-accounts/ChartsOfAccountsQueryKeys";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import type {
  AccountStatus,
  AccountType,
  ChartAccountStructureFilter,
  ChartAccount,
  ChartAccountFormValues,
  ChartsOfAccountsTableColumnKey,
  FilterValue,
  FlattenedChartAccount,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import toast from "react-hot-toast";

const PageSize = 20;

export function useChartsOfAccounts() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const companyId = authProfileQuery.data?.activeCompanyId ?? null;
  const accountsQuery = useQuery({
    queryKey: ChartsOfAccountsQueryKeys.tree(companyId),
    queryFn: FetchChartAccountsTree,
    enabled: Boolean(companyId),
  });
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [activeTab, setActiveTab] = useState<ChartsOfAccountsNav>(
    ChartsOfAccountsNavs[0],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] =
    useState<FilterValue<AccountType>>("All");
  const [statusFilter, setStatusFilter] =
    useState<FilterValue<AccountStatus>>("All");
  const [structureFilter, setStructureFilter] =
    useState<ChartAccountStructureFilter>("All");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PageSize,
  });
  const [drawerAccount, setDrawerAccount] = useState<ChartAccount | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setAccounts([]);
      setExpandedIds(new Set());
      return;
    }

    if (!accountsQuery.data) {
      setAccounts([]);
      setExpandedIds(new Set());
      return;
    }

    setAccounts(accountsQuery.data);
    setExpandedIds(
      new Set(
        flattenAccounts(accountsQuery.data)
          .filter(({ account }) => Boolean(account.children?.length))
          .slice(0, 8)
          .map(({ account }) => account.id),
      ),
    );
  }, [accountsQuery.data, companyId]);

  const saveAccountMutation = useMutation({
    mutationFn: (values: ChartAccountFormValues) =>
      SaveChartAccount(values, drawerAccount),
    onSuccess: async (account) => {
      await queryClient.invalidateQueries({
        queryKey: ChartsOfAccountsQueryKeys.tree(companyId),
      });
      setExpandedIds(
        (current) =>
          new Set(account.parentId ? [...current, account.parentId] : current),
      );
      closeDrawer();
      toast.success(
        drawerAccount ? "Chart account updated." : "Chart account created.",
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save chart account.",
      );
    },
  });

  const deactivateAccountMutation = useMutation({
    mutationFn: DeactivateChartAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ChartsOfAccountsQueryKeys.tree(companyId),
      });
      toast.success("Chart account deactivated.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not deactivate chart account.",
      );
    },
  });

  const flatAccounts = useMemo(() => flattenAccounts(accounts), [accounts]);

  const visibleAccounts = useMemo(() => {
    const expanded = flatAccounts.filter(({ account }) => {
      let parentId = account.parentId;

      while (parentId) {
        if (!expandedIds.has(parentId)) {
          return false;
        }

        parentId =
          flatAccounts.find((item) => item.account.id === parentId)?.account
            .parentId ?? null;
      }

      return true;
    });

    return expanded.filter(({ account }) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        account.accountName.toLowerCase().includes(query) ||
        account.accountNumber.toLowerCase().includes(query);
      const matchesType =
        accountTypeFilter === "All" ||
        account.accountType === accountTypeFilter;
      const matchesStatus =
        statusFilter === "All" || account.status === statusFilter;
      const hasSubmodules = Boolean(account.children?.length);
      const matchesStructure =
        structureFilter === "All" ||
        (structureFilter === "With Submodules" && hasSubmodules) ||
        (structureFilter === "Without Submodules" && !hasSubmodules);
      const matchesTab =
        activeTab === "All Accounts" ||
        (activeTab === "Inactive Accounts" && account.status === "Inactive") ||
        account.statementGroup === activeTab;

      return (
        matchesQuery &&
        matchesType &&
        matchesStatus &&
        matchesStructure &&
        matchesTab
      );
    });
  }, [
    activeTab,
    accountTypeFilter,
    expandedIds,
    flatAccounts,
    searchQuery,
    statusFilter,
    structureFilter,
  ]);

  const columns = useMemo<ColumnDef<FlattenedChartAccount>[]>(
    () =>
      ChartsOfAccountsTableColumns.map((column) => {
        if (!column.key) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            meta: { className: column.className },
          };
        }

        return createAccountColumn(
          column.key,
          column.label,
          column.className ?? "",
          column.sortable ?? true,
        );
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table exposes table helper functions that React Compiler cannot memoize safely.
  const table = useReactTable({
    data: visibleAccounts,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  function toggleExpanded(accountId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  }

  function changeActiveTab(nextTab: ChartsOfAccountsNav) {
    setActiveTab(nextTab);
    table.setPageIndex(0);
  }

  function changeSearchQuery(nextQuery: string) {
    setSearchQuery(nextQuery);
    table.setPageIndex(0);
  }

  function changeAccountTypeFilter(nextFilter: FilterValue<AccountType>) {
    setAccountTypeFilter(nextFilter);
    table.setPageIndex(0);
  }

  function changeStatusFilter(nextFilter: FilterValue<AccountStatus>) {
    setStatusFilter(nextFilter);
    table.setPageIndex(0);
  }

  function changeStructureFilter(nextFilter: ChartAccountStructureFilter) {
    setStructureFilter(nextFilter);
    table.setPageIndex(0);
  }

  function resetFilters() {
    setActiveTab(ChartsOfAccountsNavs[0]);
    setSearchQuery("");
    setAccountTypeFilter("All");
    setStatusFilter("All");
    setStructureFilter("All");
    table.setPageIndex(0);
  }

  function openAddDrawer() {
    setDrawerAccount(null);
    setIsDrawerOpen(true);
  }

  function openEditDrawer(account: ChartAccount) {
    setDrawerAccount(account);
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  function saveAccount(values: ChartAccountFormValues) {
    saveAccountMutation.mutate(values);
  }

  function deleteAccount(accountId: string) {
    deactivateAccountMutation.mutate(accountId);
  }

  function reorderAccount(accountId: string, overAccountId: string) {
    const overAccount = flatAccounts.find(
      ({ account }) => account.id === overAccountId,
    )?.account;

    setAccounts((current) =>
      moveOrReorderAccount(current, accountId, overAccountId),
    );
    setSorting([]);

    if (overAccount && !isSpecificAccount(overAccount)) {
      setExpandedIds((current) => new Set([...current, overAccount.id]));
    }
  }

  return {
    accountTypeFilter,
    accounts,
    activeTab,
    drawerAccount,
    expandedIds,
    flatAccounts,
    isDrawerOpen,
    isLoading: accountsQuery.isLoading,
    lastSyncedAt: accountsQuery.dataUpdatedAt,
    isMutating:
      saveAccountMutation.isPending || deactivateAccountMutation.isPending,
    searchQuery,
    statusFilter,
    structureFilter,
    table,
    visibleAccounts,
    closeDrawer,
    deleteAccount,
    openAddDrawer,
    openEditDrawer,
    reorderAccount,
    saveAccount,
    resetFilters,
    setAccountTypeFilter: changeAccountTypeFilter,
    setActiveTab: changeActiveTab,
    setSearchQuery: changeSearchQuery,
    setStatusFilter: changeStatusFilter,
    setStructureFilter: changeStructureFilter,
    toggleExpanded,
  };
}

function createAccountColumn(
  id: ChartsOfAccountsTableColumnKey,
  header: string,
  className: string,
  enableSorting = true,
): ColumnDef<FlattenedChartAccount> {
  return {
    id,
    header,
    accessorFn: (row) => row.account[id],
    enableSorting,
    sortingFn: "alphanumeric",
    meta: { className },
  };
}
