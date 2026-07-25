"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockBeginningBalanceUploaderRecords } from "@/app/src/data/modules/others/beginning-balance-uploader/BeginningBalanceUploaderData";
import { BeginningBalanceUploaderQueryKeys } from "@/app/src/services/modules/beginning-balance-uploader/BeginningBalanceUploaderQueryKeys";
import type { BeginningBalanceUploaderRecord } from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";

type BeginningBalanceUploaderStoreState = {
  addRecord: (record: BeginningBalanceUploaderRecord) => void;
  deleteRecord: (recordId: string) => void;
  isLoading: boolean;
  isMutating: boolean;
  lastSyncedAt: number;
  records: BeginningBalanceUploaderRecord[];
  updateRecord: (record: BeginningBalanceUploaderRecord) => void;
};

export function useBeginningBalanceUploaderStore<TSelected = BeginningBalanceUploaderStoreState>(
  selector?: (state: BeginningBalanceUploaderStoreState) => TSelected,
) {
  const queryClient = useQueryClient();
  const recordsQuery = useQuery({
    queryKey: BeginningBalanceUploaderQueryKeys.records(),
    queryFn: async () => MockBeginningBalanceUploaderRecords,
    initialData: MockBeginningBalanceUploaderRecords,
  });

  function updateCachedRecords(
    updater: (records: BeginningBalanceUploaderRecord[]) => BeginningBalanceUploaderRecord[],
  ) {
    queryClient.setQueryData<BeginningBalanceUploaderRecord[]>(
      BeginningBalanceUploaderQueryKeys.records(),
      (currentRecords = MockBeginningBalanceUploaderRecords) => updater(currentRecords),
    );
  }

  const addMutation = useMutation({
    mutationFn: async (record: BeginningBalanceUploaderRecord) => record,
    onSuccess: (record) => {
      updateCachedRecords((records) => [...records, record]);
      toast.success("Beginning balance saved.");
    },
    onError: () => toast.error("Could not save the beginning balance."),
  });

  const updateMutation = useMutation({
    mutationFn: async (record: BeginningBalanceUploaderRecord) => record,
    onSuccess: (record) => {
      updateCachedRecords((records) =>
        records.map((current) => (current.id === record.id ? record : current)),
      );
      toast.success("Beginning balance updated.");
    },
    onError: () => toast.error("Could not update the beginning balance."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (recordId: string) => recordId,
    onSuccess: (recordId) => {
      updateCachedRecords((records) => records.filter((record) => record.id !== recordId));
      toast.success("Beginning balance deleted.");
    },
    onError: () => toast.error("Could not delete the beginning balance."),
  });

  const state = useMemo<BeginningBalanceUploaderStoreState>(
    () => ({
      addRecord: (record) => addMutation.mutate(record),
      deleteRecord: (recordId) => deleteMutation.mutate(recordId),
      isLoading: recordsQuery.isLoading,
      isMutating: addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
      lastSyncedAt: recordsQuery.dataUpdatedAt,
      records: recordsQuery.data,
      updateRecord: (record) => updateMutation.mutate(record),
    }),
    [addMutation, deleteMutation, recordsQuery.data, recordsQuery.dataUpdatedAt, recordsQuery.isLoading, updateMutation],
  );

  return selector ? selector(state) : (state as TSelected);
}
