"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type PaginationState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AccountLevelLabels,
  ChartsOfAccountsDefaultColumnOrder,
  ChartsOfAccountsDefaultColumnVisibility,
  ChartsOfAccountsDefaultSorting,
  ChartsOfAccountsAllFilterValue,
  ChartsOfAccountsPageSize,
  ChartsOfAccountsTableColumns,
  ChartsOfAccountsTablePreferencesModuleKey,
  ChartsOfAccountsTablePreferencesStorageKey,
  ChartsOfAccountsNavs,
} from "@/app/src/constants/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsConstants";
import {
  flattenAccounts,
  isSpecificAccount,
  moveOrReorderAccount,
} from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsData";
import {
  FetchChartAccountsTree,
  SaveChartAccount,
  UpdateChartAccountStatus,
} from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import { ChartsOfAccountsQueryKeys } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsQueryKeys";
import { DefaultAccountQueryKeys } from "@/app/src/services/modules/financial-maintenance/default-account/DefaultAccountQueryKeys";
import { ServicesMaintenanceQueryKeys } from "@/app/src/services/modules/financial-maintenance/services-maintenance/ServicesMaintenanceQueryKeys";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/party-management/PartyManagementQueryKeys";
import { TaxDefinitionQueryKeys } from "@/app/src/services/shared/tax/TaxDefinitionApi";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
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
} from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import toast from "react-hot-toast";

export function useChartsOfAccounts() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const companyId = authProfileQuery.data?.activeCompanyId ?? null;
  const accountsQuery = useQuery({
    queryKey: ChartsOfAccountsQueryKeys.tree(companyId),
    queryFn: FetchChartAccountsTree,
    enabled: Boolean(companyId),
    retry: false,
  });
  const { columnOrder, columnVisibility, sorting, setColumnOrder, setColumnVisibility, setSorting } = useTablePreferences({
    defaultColumnOrder: ChartsOfAccountsDefaultColumnOrder,
    defaultColumnVisibility: ChartsOfAccountsDefaultColumnVisibility,
    defaultSorting: ChartsOfAccountsDefaultSorting,
    moduleKey: ChartsOfAccountsTablePreferencesModuleKey,
    storageKey: ChartsOfAccountsTablePreferencesStorageKey,
  });
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [activeTab, setActiveTab] = useState<ChartsOfAccountsNav>(ChartsOfAccountsNavs[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [accountTypeFilter, setAccountTypeFilter] = useState<FilterValue<AccountType>>(ChartsOfAccountsAllFilterValue);
  const [statusFilter, setStatusFilter] = useState<FilterValue<AccountStatus>>("Active");
  const [structureFilter, setStructureFilter] = useState<ChartAccountStructureFilter>(ChartsOfAccountsAllFilterValue);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: ChartsOfAccountsPageSize,
  });
  const [drawerAccount, setDrawerAccount] = useState<ChartAccount | null>(null);
  const [drawerParentAccount, setDrawerParentAccount] = useState<ChartAccount | null>(null);
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
    mutationFn: (values: ChartAccountFormValues) => SaveChartAccount(values, drawerAccount),
    onSuccess: async (account) => {
      await queryClient.invalidateQueries({
        queryKey: ChartsOfAccountsQueryKeys.tree(companyId),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DefaultAccountQueryKeys.expenseParentOptions(companyId) }),
        queryClient.invalidateQueries({ queryKey: ServicesMaintenanceQueryKeys.accountOptions(companyId) }),
        queryClient.invalidateQueries({ queryKey: PartyManagementQueryKeys.accountingOptions() }),
        queryClient.invalidateQueries({ queryKey: TaxDefinitionQueryKeys.lookup(companyId) }),
      ]);
      setExpandedIds(
        (current) =>
          new Set([...current, ...getAccountAncestorIds(accounts, account.parentId), ...(account.parentId ? [account.parentId] : [])]),
      );
      setSavedAccountId(account.id);
      if (!drawerAccount) {
        setSaveResetToken((current) => current + 1);
      }
      closeDrawer();
      toast.success(drawerAccount ? "Chart account updated." : "Chart account created.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not save chart account.");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ accountId, status }: { accountId: string; status: AccountStatus }) => UpdateChartAccountStatus(accountId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ChartsOfAccountsQueryKeys.tree(companyId),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DefaultAccountQueryKeys.expenseParentOptions(companyId) }),
        queryClient.invalidateQueries({ queryKey: ServicesMaintenanceQueryKeys.accountOptions(companyId) }),
        queryClient.invalidateQueries({ queryKey: PartyManagementQueryKeys.accountingOptions() }),
        queryClient.invalidateQueries({ queryKey: TaxDefinitionQueryKeys.lookup(companyId) }),
      ]);
      toast.success("Chart account status updated.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update chart account status.");
    },
  });

  const flatAccounts = useMemo(() => flattenAccounts(accounts), [accounts]);
  const parentIdByAccountId = useMemo(() => new Map(flatAccounts.map(({ account }) => [account.id, account.parentId])), [flatAccounts]);
  const searchableTextByAccountId = useMemo(
    () => new Map(flatAccounts.map(({ account }) => [account.id, `${account.accountName} ${account.accountNumber}`.toLowerCase()])),
    [flatAccounts],
  );
  const normalizedSearchQuery = useMemo(() => deferredSearchQuery.trim().toLowerCase(), [deferredSearchQuery]);

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

        parentId = parentIdByAccountId.get(parentId) ?? null;
      }

      return true;
    });

    return expanded.filter(({ account }) => {
      const matchesQuery = !normalizedSearchQuery || (searchableTextByAccountId.get(account.id)?.includes(normalizedSearchQuery) ?? false);
      const matchesType = accountTypeFilter === ChartsOfAccountsAllFilterValue || account.accountType === accountTypeFilter;
      const matchesStatus = statusFilter === ChartsOfAccountsAllFilterValue || account.status === statusFilter;
      const hasSubmodules = Boolean(account.children?.length);
      const matchesStructure =
        structureFilter === ChartsOfAccountsAllFilterValue ||
        (structureFilter === "With Submodules" && hasSubmodules) ||
        (structureFilter === "Without Submodules" && !hasSubmodules);
      const matchesTab = activeTab === "All Accounts" || account.statementGroup === activeTab;

      return matchesQuery && matchesType && matchesStatus && matchesStructure && matchesTab;
    });
  }, [
    activeTab,
    accountTypeFilter,
    expandedIds,
    flatAccounts,
    normalizedSearchQuery,
    parentIdByAccountId,
    searchableTextByAccountId,
    statusFilter,
    structureFilter,
  ]);

  const columns = useMemo<ColumnDef<FlattenedChartAccount>[]>(
    () =>
      ChartsOfAccountsTableColumns.filter((column) => column.key !== "parentPath").map((column) => {
        const meta = {
          className: column.className ?? "",
        };

        if (!column.key) {
          return {
            id: "actions",
            header: column.label,
            enableSorting: false,
            size: column.size,
            meta: { ...meta, label: column.label },
          };
        }

        return createAccountColumn(column.key, column.label, meta, column.size, column.sortable ?? true);
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table exposes table helper functions that React Compiler cannot memoize safely.
  const table = useReactTable({
    data: visibleAccounts,
    columns,
    autoResetPageIndex: false,
    initialState: {
      columnOrder: ChartsOfAccountsDefaultColumnOrder,
      columnVisibility: ChartsOfAccountsDefaultColumnVisibility,
      sorting: ChartsOfAccountsDefaultSorting,
    },
    state: {
      columnOrder,
      columnVisibility,
      pagination,
      sorting,
    },
    onColumnOrderChange: setColumnOrder,
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

    const rowIndex = table.getPrePaginationRowModel().rows.findIndex((row) => row.original.account.id === savedAccountId);

    if (rowIndex < 0) {
      return;
    }

    const pageSize = table.getState().pagination.pageSize;
    table.setPageIndex(Math.floor(rowIndex / pageSize));

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const row = document.querySelector(`[data-chart-account-id="${savedAccountId}"]`);

        row?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setSavedAccountId(null);
      });
    });
  }, [savedAccountId, table, visibleAccounts]);

  const toggleExpanded = useCallback((accountId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  }, []);

  const changeActiveTab = useCallback(
    (nextTab: ChartsOfAccountsNav) => {
      setActiveTab(nextTab);
      table.setPageIndex(0);
    },
    [table],
  );

  const changeSearchQuery = useCallback(
    (nextQuery: string) => {
      setSearchQuery(nextQuery);
      table.setPageIndex(0);
    },
    [table],
  );

  const changeAccountTypeFilter = useCallback(
    (nextFilter: FilterValue<AccountType>) => {
      setAccountTypeFilter(nextFilter);
      table.setPageIndex(0);
    },
    [table],
  );

  const changeStatusFilter = useCallback(
    (nextFilter: FilterValue<AccountStatus>) => {
      setStatusFilter(nextFilter);
      table.setPageIndex(0);
    },
    [table],
  );

  const changeStructureFilter = useCallback(
    (nextFilter: ChartAccountStructureFilter) => {
      setStructureFilter(nextFilter);
      table.setPageIndex(0);
    },
    [table],
  );

  const resetFilters = useCallback(() => {
    setActiveTab(ChartsOfAccountsNavs[0]);
    setSearchQuery("");
    setAccountTypeFilter(ChartsOfAccountsAllFilterValue);
    setStatusFilter("Active");
    setStructureFilter(ChartsOfAccountsAllFilterValue);
    table.setPageIndex(0);
  }, [table]);

  const openAddDrawer = useCallback((parentAccount: ChartAccount | null = null) => {
    setDrawerAccount(null);
    setDrawerParentAccount(parentAccount);
    setDrawerMode("add");
    setIsDrawerOpen(true);
  }, []);

  const openEditDrawer = useCallback((account: ChartAccount) => {
    setDrawerAccount(account);
    setDrawerParentAccount(null);
    setDrawerMode("edit");
    setIsDrawerOpen(true);
  }, []);

  const openViewDrawer = useCallback((account: ChartAccount) => {
    setDrawerAccount(account);
    setDrawerParentAccount(null);
    setDrawerMode("view");
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const saveAccount = useCallback(
    (values: ChartAccountFormValues) => {
      const releaseLock = acquireModuleActionLock(
        `financial-maintenance:charts-of-accounts:submit:${drawerMode}:${drawerAccount?.id ?? values.accountNumber ?? "new"}`,
      );
      if (!releaseLock) return;

      saveAccountMutation.mutate(values, {
        onError: () => {
          releaseLock();
        },
      });
    },
    [drawerAccount?.id, drawerMode, saveAccountMutation],
  );

  const updateAccountStatus = useCallback(
    (account: ChartAccount) => {
      const releaseLock = acquireModuleActionLock(`financial-maintenance:charts-of-accounts:status:${account.id}`);
      if (!releaseLock) return;

      updateStatusMutation.mutate(
        {
          accountId: account.id,
          status: account.status === "Active" ? "Inactive" : "Active",
        },
        {
          onError: () => {
            releaseLock();
          },
        },
      );
    },
    [updateStatusMutation],
  );

  const reorderAccount = useCallback(
    (accountId: string, overAccountId: string, placement: ChartsOfAccountsDropPlacement) => {
      const activeAccount = flatAccounts.find(({ account }) => account.id === accountId)?.account;
      const overAccount = flatAccounts.find(({ account }) => account.id === overAccountId)?.account;

      setAccounts((current) => moveOrReorderAccount(current, accountId, overAccountId, placement));
      setSorting([]);

      if (activeAccount && overAccount && !isSpecificAccount(overAccount) && placement === "inside") {
        setExpandedIds((current) => new Set([...current, overAccount.id]));
      }
    },
    [flatAccounts, setSorting],
  );

  const effectiveRole = ResolveAuthProfileEffectiveRole(authProfileQuery.data);
  const canManage = effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
  const permissions = useMemo(
    () => ({
      canCreate: canManage,
      canExport: canManage,
      canUpdate: canManage,
      canView: true,
    }),
    [canManage],
  );

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
    isMutating: saveAccountMutation.isPending || updateStatusMutation.isPending,
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
  meta: {
    className: string;
  },
  size: number,
  enableSorting = true,
): ColumnDef<FlattenedChartAccount> {
  return {
    id,
    header,
    accessorFn: (row) =>
      id === "parentPath" ? row.parentPath : id === "accountLevel" ? AccountLevelLabels[row.account.accountLevel] : row.account[id],
    enableSorting,
    size,
    sortingFn: "alphanumeric",
    meta: { ...meta, label: header },
  };
}

function getExpandableAccountIds(accounts: ChartAccount[]) {
  return new Set(
    flattenAccounts(accounts)
      .filter(({ account }) => Boolean(account.children?.length))
      .map(({ account }) => account.id),
  );
}

function getAccountAncestorIds(accounts: ChartAccount[], parentAccountId: string | null) {
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
