"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  createAccountsPayableVoucher,
  fetchAccountsPayableVoucher,
  fetchAccountsPayableVoucherNumberSuggestion,
  fetchAccountsPayableVoucherPartyOptions,
  fetchAccountsPayableVoucherPayableAccountOptions,
  fetchAccountsPayableVoucherResponsibilityCenterOptions,
  fetchAccountsPayableVoucherTermOptions,
  fetchAccountsPayableVouchers,
  updateAccountsPayableVoucher,
  updateAccountsPayableVoucherStatus,
} from "@/app/src/services/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherApi";
import { AccountsPayableVoucherQueryKeys } from "@/app/src/services/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherQueryKeys";
import type {
  AccountsPayableVoucherFormValues,
  AccountsPayableVoucherListResponse,
  AccountsPayableVoucherPagination,
  AccountsPayableVoucherPermissions,
  AccountsPayableVoucherRecord,
  AccountsPayableVoucherStatistics,
  AccountsPayableVoucherStatus,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";

type AccountsPayableVoucherStoreState = {
  records: AccountsPayableVoucherRecord[];
  addRecord: (
    values: AccountsPayableVoucherFormValues,
  ) => Promise<AccountsPayableVoucherRecord>;
  updateRecord: (
    record: AccountsPayableVoucherRecord,
  ) => Promise<AccountsPayableVoucherRecord>;
  updateStatus: (
    recordId: string,
    status: AccountsPayableVoucherStatus,
  ) => Promise<AccountsPayableVoucherRecord>;
  deleteRecord: (recordId: string) => Promise<AccountsPayableVoucherRecord>;
  refreshRecords: () => void;
  permissions: AccountsPayableVoucherPermissions;
  statistics: AccountsPayableVoucherStatistics;
  pagination: AccountsPayableVoucherPagination;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
};

const EmptyAccountsPayableVoucherPermissions: AccountsPayableVoucherPermissions =
  {
    canApprove: false,
    canCancel: false,
    canClose: false,
    canCreate: false,
    canDisapprove: false,
    canExport: false,
    canUpdate: false,
    canView: false,
  };

const EmptyAccountsPayableVoucherStatistics: AccountsPayableVoucherStatistics =
  {
    cancelledVouchers: 0,
    disapprovedVouchers: 0,
    draftVouchers: 0,
    forApprovalVouchers: 0,
    postedVouchers: 0,
    totalVouchers: 0,
  };

const EmptyAccountsPayableVoucherPagination: AccountsPayableVoucherPagination =
  {
    limit: 500,
    page: 1,
    total: 0,
    totalPages: 1,
  };

export function useAccountsPayableVoucherStore<
  TSelected = AccountsPayableVoucherStoreState,
>(selector?: (state: AccountsPayableVoucherStoreState) => TSelected) {
  const queryClient = useQueryClient();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const recordsQuery = useQuery({
    enabled: activeCompanyId !== null && activeBranchId !== null,
    queryFn: () =>
      fetchAccountsPayableVouchers({
        branchUnitId: activeBranchId,
        limit: 500,
        sortBy: "documentDate",
        sortDirection: "desc",
      }),
    queryKey: AccountsPayableVoucherQueryKeys.records(
      activeCompanyId,
      activeBranchId,
    ),
    retry: false,
  });

  function refreshRecords() {
    void queryClient.invalidateQueries({
      queryKey: AccountsPayableVoucherQueryKeys.all(
        activeCompanyId,
        activeBranchId,
      ),
    });
  }

  const addRecordMutation = useMutation({
    mutationFn: (values: AccountsPayableVoucherFormValues) =>
      createAccountsPayableVoucher(values, requireActiveBranchId(activeBranchId)),
    onSuccess: () => {
      refreshRecords();
      toast.success("Accounts payable voucher saved.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save accounts payable voucher. Please try again.",
      );
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: (record: AccountsPayableVoucherRecord) =>
      updateAccountsPayableVoucher(record, requireActiveBranchId(activeBranchId)),
    onSuccess: (record) => {
      refreshRecords();
      void queryClient.invalidateQueries({
        queryKey: AccountsPayableVoucherQueryKeys.detail(
          activeCompanyId,
          activeBranchId,
          record.id,
        ),
      });
      toast.success("Accounts payable voucher updated.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update accounts payable voucher. Please try again.",
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      recordId,
      status,
    }: {
      recordId: string;
      status: AccountsPayableVoucherStatus;
    }) => updateAccountsPayableVoucherStatus({ recordId, status }),
    onSuccess: (record) => {
      refreshRecords();
      void queryClient.invalidateQueries({
        queryKey: AccountsPayableVoucherQueryKeys.detail(
          activeCompanyId,
          activeBranchId,
          record.id,
        ),
      });
      toast.success(`Accounts payable voucher set ${record.status.toLowerCase()}.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update accounts payable voucher status. Please try again.",
      );
    },
  });

  const state: AccountsPayableVoucherStoreState = {
    addRecord: (values) => addRecordMutation.mutateAsync(values),
    deleteRecord: (recordId) =>
      statusMutation.mutateAsync({ recordId, status: "Cancelled" }),
    isLoading: recordsQuery.isLoading,
    isMutating:
      addRecordMutation.isPending ||
      updateRecordMutation.isPending ||
      statusMutation.isPending,
    isRefreshing: recordsQuery.isFetching && !recordsQuery.isLoading,
    lastSyncedAt: recordsQuery.dataUpdatedAt,
    pagination:
      recordsQuery.data?.pagination ?? EmptyAccountsPayableVoucherPagination,
    permissions:
      recordsQuery.data?.permissions ?? EmptyAccountsPayableVoucherPermissions,
    records: recordsQuery.data?.records ?? [],
    refreshRecords,
    statistics:
      recordsQuery.data?.statistics ?? EmptyAccountsPayableVoucherStatistics,
    updateRecord: (record) => updateRecordMutation.mutateAsync(record),
    updateStatus: (recordId, status) =>
      statusMutation.mutateAsync({ recordId, status }),
  };

  return selector ? selector(state) : (state as TSelected);
}

export function useAccountsPayableVoucherRecord(recordId?: string) {
  const queryClient = useQueryClient();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);

  return useQuery({
    enabled:
      Boolean(recordId) && activeCompanyId !== null && activeBranchId !== null,
    initialData: () =>
      queryClient
        .getQueryData<AccountsPayableVoucherListResponse>(
          AccountsPayableVoucherQueryKeys.records(activeCompanyId, activeBranchId),
        )
        ?.records.find((record) => record.id === recordId),
    queryFn: () =>
      fetchAccountsPayableVoucher(recordId ?? "", {
        branchUnitId: activeBranchId,
      }),
    queryKey: AccountsPayableVoucherQueryKeys.detail(
      activeCompanyId,
      activeBranchId,
      recordId ?? "missing",
    ),
    retry: false,
  });
}

export function useAccountsPayableVoucherNumberSuggestion(enabled = true) {
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);

  return useQuery({
    enabled: enabled && activeCompanyId !== null && activeBranchId !== null,
    queryFn: () => fetchAccountsPayableVoucherNumberSuggestion(activeBranchId),
    queryKey: AccountsPayableVoucherQueryKeys.numberSuggestion(
      activeCompanyId,
      activeBranchId,
    ),
    retry: false,
  });
}

export function useAccountsPayableVoucherPartyOptions() {
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);

  return useQuery({
    enabled: activeCompanyId !== null,
    queryFn: fetchAccountsPayableVoucherPartyOptions,
    queryKey: AccountsPayableVoucherQueryKeys.lookup(
      "parties",
      activeCompanyId,
      activeBranchId,
    ),
    refetchOnMount: "always",
    retry: false,
    staleTime: 0,
  });
}

export function useAccountsPayableVoucherTermOptions() {
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);

  return useQuery({
    enabled: activeCompanyId !== null,
    queryFn: fetchAccountsPayableVoucherTermOptions,
    queryKey: AccountsPayableVoucherQueryKeys.lookup(
      "terms",
      activeCompanyId,
      activeBranchId,
    ),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAccountsPayableVoucherResponsibilityCenterOptions() {
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);

  return useQuery({
    enabled: activeCompanyId !== null,
    queryFn: fetchAccountsPayableVoucherResponsibilityCenterOptions,
    queryKey: AccountsPayableVoucherQueryKeys.lookup(
      "responsibility-centers",
      activeCompanyId,
      activeBranchId,
    ),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAccountsPayableVoucherPayableAccountOptions() {
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);

  return useQuery({
    enabled: activeCompanyId !== null,
    queryFn: fetchAccountsPayableVoucherPayableAccountOptions,
    queryKey: AccountsPayableVoucherQueryKeys.lookup(
      "payable-accounts",
      activeCompanyId,
      activeBranchId,
    ),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

function requireActiveBranchId(branchUnitId: number | null) {
  if (branchUnitId === null) {
    throw new Error("Select a branch before saving accounts payable vouchers.");
  }

  return branchUnitId;
}
