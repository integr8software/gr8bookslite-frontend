"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockAccountsPayableVouchers } from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import { AccountsPayableVoucherQueryKeys } from "@/app/src/services/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherQueryKeys";
import type { AccountsPayableVoucherRecord } from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";

type AccountsPayableVoucherStoreState = {
  records: AccountsPayableVoucherRecord[];
  addRecord: (record: AccountsPayableVoucherRecord) => void;
  updateRecord: (record: AccountsPayableVoucherRecord) => void;
  deleteRecord: (recordId: string) => void;
  isLoading: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
};

export function useAccountsPayableVoucherStore<
  TSelected = AccountsPayableVoucherStoreState,
>(selector?: (state: AccountsPayableVoucherStoreState) => TSelected) {
  const queryClient = useQueryClient();
  const recordsQuery = useQuery({
    queryKey: AccountsPayableVoucherQueryKeys.records(),
    queryFn: async () => MockAccountsPayableVouchers,
    initialData: MockAccountsPayableVouchers,
  });

  function updateCachedRecords(
    updater: (
      records: AccountsPayableVoucherRecord[],
    ) => AccountsPayableVoucherRecord[],
  ) {
    queryClient.setQueryData<AccountsPayableVoucherRecord[]>(
      AccountsPayableVoucherQueryKeys.records(),
      (currentRecords = MockAccountsPayableVouchers) => updater(currentRecords),
    );
  }

  const addRecordMutation = useMutation({
    mutationFn: async (record: AccountsPayableVoucherRecord) => record,
    onSuccess: (record) => {
      updateCachedRecords((records) => [...records, record]);
      toast.success("Accounts payable voucher saved.");
    },
    onError: () => {
      toast.error("Could not save accounts payable voucher. Please try again.");
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: async (record: AccountsPayableVoucherRecord) => record,
    onSuccess: (record) => {
      updateCachedRecords((records) =>
        records.map((currentRecord) =>
          currentRecord.id === record.id ? record : currentRecord,
        ),
      );
      toast.success("Accounts payable voucher updated.");
    },
    onError: () => {
      toast.error("Could not update accounts payable voucher. Please try again.");
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => recordId,
    onSuccess: (recordId) => {
      updateCachedRecords((records) =>
        records.filter((record) => record.id !== recordId),
      );
      toast.success("Accounts payable voucher deleted.");
    },
    onError: () => {
      toast.error("Could not delete accounts payable voucher. Please try again.");
    },
  });

  const state = useMemo<AccountsPayableVoucherStoreState>(
    () => ({
      records: recordsQuery.data,
      addRecord: (record) => addRecordMutation.mutate(record),
      updateRecord: (record) => updateRecordMutation.mutate(record),
      deleteRecord: (recordId) => deleteRecordMutation.mutate(recordId),
      isLoading: recordsQuery.isLoading,
      lastSyncedAt: recordsQuery.dataUpdatedAt,
      isMutating:
        addRecordMutation.isPending ||
        updateRecordMutation.isPending ||
        deleteRecordMutation.isPending,
    }),
    [
      addRecordMutation,
      deleteRecordMutation,
      recordsQuery.data,
      recordsQuery.dataUpdatedAt,
      recordsQuery.isLoading,
      updateRecordMutation,
    ],
  );

  return selector ? selector(state) : (state as TSelected);
}
