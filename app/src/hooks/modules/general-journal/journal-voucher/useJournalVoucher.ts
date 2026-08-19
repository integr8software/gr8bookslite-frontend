"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  createJournalVoucher,
  fetchJournalVoucher,
  fetchJournalVoucherLookups,
  fetchJournalVoucherNumberSuggestion,
  fetchJournalVouchers,
  type JournalVoucherPermissions,
  updateJournalVoucher,
  updateJournalVoucherStatus,
} from "@/app/src/services/modules/general-journal/journal-voucher/JournalVoucherService";
import { JournalVoucherQueryKeys } from "@/app/src/services/modules/general-journal/journal-voucher/JournalVoucherQueryKeys";
import type {
  JournalVoucherRecord,
  JournalVoucherStatus,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";

type JournalVoucherStoreState = {
  records: JournalVoucherRecord[];
  addRecord: (record: JournalVoucherRecord) => void;
  updateRecord: (record: JournalVoucherRecord) => void;
  updateStatus: (recordId: string, status: JournalVoucherStatus) => void;
  permissions: JournalVoucherPermissions;
  isLoading: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
};

const EmptyJournalVoucherPermissions: JournalVoucherPermissions = {
  canApprove: false,
  canCancel: false,
  canCreate: false,
  canDisapprove: false,
  canExport: false,
  canPost: false,
  canSubmitForApproval: false,
  canUncancel: false,
  canUpdate: false,
  canView: false,
};

export function useJournalVoucherStore<TSelected = JournalVoucherStoreState>(selector?: (state: JournalVoucherStoreState) => TSelected) {
  const queryClient = useQueryClient();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const queryKey = JournalVoucherQueryKeys.records(activeCompanyId, activeBranchId);

  const recordsQuery = useQuery({
    queryKey,
    queryFn: () =>
      fetchJournalVouchers({
        branchUnitId: activeBranchId,
      }),
    enabled: activeCompanyId !== null,
  });

  function invalidateJournalVoucherQueries() {
    return queryClient.invalidateQueries({
      queryKey: JournalVoucherQueryKeys.all(activeCompanyId, activeBranchId),
    });
  }

  const addRecordMutation = useMutation({
    mutationFn: (record: JournalVoucherRecord) => createJournalVoucher(record, activeBranchId),
    onSuccess: async () => {
      await invalidateJournalVoucherQueries();
      toast.success("Journal voucher saved.");
    },
    onError: () => {
      toast.error("Could not save journal voucher. Please try again.");
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: (record: JournalVoucherRecord) => updateJournalVoucher(record, activeBranchId),
    onSuccess: async () => {
      await invalidateJournalVoucherQueries();
      toast.success("Journal voucher updated.");
    },
    onError: () => {
      toast.error("Could not update journal voucher. Please try again.");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (input: { recordId: string; status: JournalVoucherStatus }) => updateJournalVoucherStatus(input),
    onSuccess: async () => {
      await invalidateJournalVoucherQueries();
      toast.success("Journal voucher status updated.");
    },
    onError: () => {
      toast.error("Could not update journal voucher status. Please try again.");
    },
  });

  const state = useMemo<JournalVoucherStoreState>(
    () => ({
      records: recordsQuery.data?.records ?? [],
      addRecord: (record) => addRecordMutation.mutate(record),
      updateRecord: (record) => updateRecordMutation.mutate(record),
      updateStatus: (recordId, status) => updateStatusMutation.mutate({ recordId, status }),
      permissions: recordsQuery.data?.permissions ?? EmptyJournalVoucherPermissions,
      isLoading: recordsQuery.isLoading,
      lastSyncedAt: recordsQuery.dataUpdatedAt,
      isMutating: addRecordMutation.isPending || updateRecordMutation.isPending || updateStatusMutation.isPending,
    }),
    [addRecordMutation, recordsQuery.data, recordsQuery.dataUpdatedAt, recordsQuery.isLoading, updateRecordMutation, updateStatusMutation],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useJournalVoucherDetail(recordId?: string) {
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const activeBranchId = useAppStore((state) => state.activeBranchId);

  return useQuery({
    queryKey: recordId
      ? JournalVoucherQueryKeys.detail(activeCompanyId, activeBranchId, recordId)
      : JournalVoucherQueryKeys.all(activeCompanyId, activeBranchId),
    queryFn: () => fetchJournalVoucher(recordId as string, activeBranchId),
    enabled: activeCompanyId !== null && Boolean(recordId),
  });
}

export function useJournalVoucherNumberSuggestion(enabled = true) {
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const activeBranchId = useAppStore((state) => state.activeBranchId);

  return useQuery({
    queryKey: JournalVoucherQueryKeys.numberSuggestion(activeCompanyId, activeBranchId),
    queryFn: () => fetchJournalVoucherNumberSuggestion(activeBranchId),
    enabled: enabled && activeCompanyId !== null,
  });
}

export function useJournalVoucherLookups() {
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const activeBranchId = useAppStore((state) => state.activeBranchId);

  return useQuery({
    queryKey: JournalVoucherQueryKeys.lookups(activeCompanyId, activeBranchId),
    queryFn: fetchJournalVoucherLookups,
    enabled: activeCompanyId !== null,
  });
}
