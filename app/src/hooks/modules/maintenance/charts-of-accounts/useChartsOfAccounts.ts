"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AccountLevelLabels,
  ChartsOfAccountsTableColumns,
  ChartsOfAccountsNavs,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import {
  flattenAccounts,
  isSpecificAccount,
  moveOrReorderAccount,
} from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsData";
import {
  FetchChartAccountsTree,
  SaveChartAccount,
  UpdateChartAccountStatus,
} from "@/app/src/services/modules/maintenance/charts-of-accounts/ChartsOfAccountsApi";
import { ChartsOfAccountsQueryKeys } from "@/app/src/services/modules/maintenance/charts-of-accounts/ChartsOfAccountsQueryKeys";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import type {
  AccountStatus,
  AccountType,
  ChartAccountStructureFilter,
  ChartAccount,
  ChartAccountFormValues,
  ChartsOfAccountsDropPlacement,
  ChartsOfAccountsNav,
  ChartsOfAccountsTableColumnKey,
  FilterValue,
  FlattenedChartAccount,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import toast from "react-hot-toast";

const PageSize = 50;
const DefaultColumnVisibility: VisibilityState = {
  accountLevel: false,
  reportAlias: false,
};

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
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(DefaultColumnVisibility);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PageSize,
  });
  const [drawerAccount, setDrawerAccount] = useState<ChartAccount | null>(null);
  const [drawerParentAccount, setDrawerParentAccount] =
    useState<ChartAccount | null>(null);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit" | "view">("add");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [savedAccountId, setSavedAccountId] = useState<string | null>(null);
  const [saveResetToken, setSaveResetToken] = useState(0);

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
    setExpandedIds(getExpandableAccountIds(accountsQuery.data));
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
          new Set([
            ...current,
            ...getAccountAncestorIds(accounts, account.parentId),
            ...(account.parentId ? [account.parentId] : []),
          ]),
      );
      setSavedAccountId(account.id);
      if (!drawerAccount) {
        setSaveResetToken((current) => current + 1);
      }
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

  const updateStatusMutation = useMutation({
    mutationFn: ({
      accountId,
      status,
    }: {
      accountId: string;
      status: AccountStatus;
    }) => UpdateChartAccountStatus(accountId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ChartsOfAccountsQueryKeys.tree(companyId),
      });
      toast.success("Chart account status updated.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update chart account status.",
      );
    },
  });

  const flatAccounts = useMemo(() => flattenAccounts(accounts), [accounts]);

  const visibleAccounts = useMemo(() => {
    const expanded = flatAccounts.filter(({ account }) => {
      if (structureFilter === "Without Submodules") {
        return true;
      }

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
      ChartsOfAccountsTableColumns.filter(
        (column) => column.key !== "parentPath",
      ).map((column) => {
        if (!column.key) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            meta: { className: column.className, label: column.label },
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
      columnVisibility,
      pagination,
      sorting,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    if (!savedAccountId) {
      return;
    }

    const rowIndex = table
      .getPrePaginationRowModel()
      .rows.findIndex((row) => row.original.account.id === savedAccountId);

    if (rowIndex < 0) {
      return;
    }

    const pageSize = table.getState().pagination.pageSize;
    table.setPageIndex(Math.floor(rowIndex / pageSize));

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const row = document.querySelector(
          `[data-chart-account-id="${savedAccountId}"]`,
        );

        row?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setSavedAccountId(null);
      });
    });
  }, [savedAccountId, table, visibleAccounts]);

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

  function openAddDrawer(parentAccount: ChartAccount | null = null) {
    setDrawerAccount(null);
    setDrawerParentAccount(parentAccount);
    setDrawerMode("add");
    setIsDrawerOpen(true);
  }

  function openEditDrawer(account: ChartAccount) {
    setDrawerAccount(account);
    setDrawerParentAccount(null);
    setDrawerMode("edit");
    setIsDrawerOpen(true);
  }

  function openViewDrawer(account: ChartAccount) {
    setDrawerAccount(account);
    setDrawerParentAccount(null);
    setDrawerMode("view");
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  function saveAccount(values: ChartAccountFormValues) {
    saveAccountMutation.mutate(values);
  }

  function updateAccountStatus(account: ChartAccount) {
    updateStatusMutation.mutate({
      accountId: account.id,
      status: account.status === "Active" ? "Inactive" : "Active",
    });
  }

  function reorderAccount(
    accountId: string,
    overAccountId: string,
    placement: ChartsOfAccountsDropPlacement,
  ) {
    const activeAccount = flatAccounts.find(
      ({ account }) => account.id === accountId,
    )?.account;
    const overAccount = flatAccounts.find(
      ({ account }) => account.id === overAccountId,
    )?.account;

    setAccounts((current) =>
      moveOrReorderAccount(current, accountId, overAccountId, placement),
    );
    setSorting([]);

    if (
      activeAccount &&
      overAccount &&
      !isSpecificAccount(overAccount) &&
      placement === "inside"
    ) {
      setExpandedIds((current) => new Set([...current, overAccount.id]));
    }
  }

  const effectiveRole = ResolveAuthProfileEffectiveRole(authProfileQuery.data);
  const canManage = effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
  const permissions = {
    canCreate: canManage,
    canExport: canManage,
    canUpdate: canManage,
    canView: true,
  };

  return {
    accountTypeFilter,
    accounts,
    activeTab,
    drawerAccount,
    drawerMode,
    drawerParentAccount,
    expandedIds,
    flatAccounts,
    isDrawerOpen,
    isLoading: accountsQuery.isLoading,
    isRefreshing: accountsQuery.isFetching && !accountsQuery.isLoading,
    lastSyncedAt: accountsQuery.dataUpdatedAt,
    isMutating:
    saveAccountMutation.isPending || updateStatusMutation.isPending,
    permissions,
    searchQuery,
    saveResetToken,
    statusFilter,
    structureFilter,
    table,
    visibleAccounts,
    closeDrawer,
    openAddDrawer,
    openEditDrawer,
    openViewDrawer,
    refreshAccounts: () => {
      void accountsQuery.refetch();
    },
    reorderAccount,
    saveAccount,
    resetFilters,
    setAccountTypeFilter: changeAccountTypeFilter,
    setActiveTab: changeActiveTab,
    setSearchQuery: changeSearchQuery,
    setStatusFilter: changeStatusFilter,
    setStructureFilter: changeStructureFilter,
    toggleExpanded,
    updateAccountStatus,
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
    accessorFn: (row) =>
      id === "parentPath"
        ? row.parentPath
        : id === "accountLevel"
          ? AccountLevelLabels[row.account.accountLevel]
          : row.account[id],
    enableSorting,
    sortingFn: "alphanumeric",
    meta: { className, label: header },
  };
}

function getExpandableAccountIds(accounts: ChartAccount[]) {
  return new Set(
    flattenAccounts(accounts)
      .filter(({ account }) => Boolean(account.children?.length))
      .map(({ account }) => account.id),
  );
}

function getAccountAncestorIds(
  accounts: ChartAccount[],
  parentAccountId: string | null,
) {
  if (!parentAccountId) {
    return [];
  }

  const parentByAccountId = new Map<string, string | null>();

  flattenAccounts(accounts).forEach(({ account }) => {
    parentByAccountId.set(account.id, account.parentId);
  });

  const ancestorIds: string[] = [];
  let currentAccountId: string | null = parentAccountId;

  while (currentAccountId) {
    ancestorIds.push(currentAccountId);
    currentAccountId = parentByAccountId.get(currentAccountId) ?? null;
  }

  return ancestorIds;
}
