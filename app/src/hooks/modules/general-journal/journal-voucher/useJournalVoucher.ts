"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockJournalVouchers } from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
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
  deleteRecord: (recordId: string) => void;
  isLoading: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
};

export function useJournalVoucherStore<TSelected = JournalVoucherStoreState>(
  selector?: (state: JournalVoucherStoreState) => TSelected,
) {
  const queryClient = useQueryClient();
  const recordsQuery = useQuery({
    queryKey: JournalVoucherQueryKeys.records(),
    queryFn: async () => MockJournalVouchers,
    initialData: MockJournalVouchers,
  });

  function updateCachedRecords(
    updater: (records: JournalVoucherRecord[]) => JournalVoucherRecord[],
  ) {
    queryClient.setQueryData<JournalVoucherRecord[]>(
      JournalVoucherQueryKeys.records(),
      (currentRecords = MockJournalVouchers) => updater(currentRecords),
    );
  }

  const addRecordMutation = useMutation({
    mutationFn: async (record: JournalVoucherRecord) => record,
    onSuccess: (record) => {
      updateCachedRecords((records) => [...records, record]);
      toast.success("Journal voucher saved.");
    },
    onError: () => {
      toast.error("Could not save journal voucher. Please try again.");
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: async (record: JournalVoucherRecord) => record,
    onSuccess: (record) => {
      updateCachedRecords((records) =>
        records.map((currentRecord) =>
          currentRecord.id === record.id ? record : currentRecord,
        ),
      );
      toast.success("Journal voucher updated.");
    },
    onError: () => {
      toast.error("Could not update journal voucher. Please try again.");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      recordId,
      status,
    }: {
      recordId: string;
      status: JournalVoucherStatus;
    }) => ({ recordId, status }),
    onSuccess: ({ recordId, status }) => {
      updateCachedRecords((records) =>
        records.map((record) =>
          record.id === recordId
            ? {
                ...record,
                status,
                updatedAt: new Date().toISOString(),
              }
            : record,
        ),
      );
      toast.success("Journal voucher status updated.");
    },
    onError: () => {
      toast.error("Could not update journal voucher status. Please try again.");
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => recordId,
    onSuccess: (recordId) => {
      updateCachedRecords((records) =>
        records.filter((record) => record.id !== recordId),
      );
      toast.success("Journal voucher deleted.");
    },
    onError: () => {
      toast.error("Could not delete journal voucher. Please try again.");
    },
  });

  const state = useMemo<JournalVoucherStoreState>(
    () => ({
      records: recordsQuery.data,
      addRecord: (record) => addRecordMutation.mutate(record),
      updateRecord: (record) => updateRecordMutation.mutate(record),
      updateStatus: (recordId, status) =>
        updateStatusMutation.mutate({ recordId, status }),
      deleteRecord: (recordId) => deleteRecordMutation.mutate(recordId),
      isLoading: recordsQuery.isLoading,
      lastSyncedAt: recordsQuery.dataUpdatedAt,
      isMutating:
        addRecordMutation.isPending ||
        updateStatusMutation.isPending ||
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
      updateStatusMutation,
    ],
  );

  return selector ? selector(state) : (state as TSelected);
}
