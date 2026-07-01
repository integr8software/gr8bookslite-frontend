"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  GetTransactionNumberSetupBootstrap,
  UpdateTransactionNumberSetup,
} from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberSetupApi";
import { TransactionNumberSetupQueryKeys } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberSetupQueryKeys";
import type { TransactionNumberSetupBranchOption } from "@/app/src/data/modules/system-administration/transaction-number-setup/TransactionNumberSetupData";
import type { TransactionNumberSetupRecord } from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

type TransactionNumberSetupState = {
  branchOptions: TransactionNumberSetupBranchOption[];
  isLoading: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
  setups: TransactionNumberSetupRecord[];
  updateSetup: (setup: TransactionNumberSetupRecord) => void;
};

const EmptyBootstrap: {
  branches: TransactionNumberSetupBranchOption[];
  setups: TransactionNumberSetupRecord[];
} = {
  branches: [],
  setups: [],
};

export function useTransactionNumberSetupStore<
  TSelected = TransactionNumberSetupState,
>(selector?: (state: TransactionNumberSetupState) => TSelected) {
  const queryClient = useQueryClient();
  const setupsQuery = useQuery({
    queryKey: TransactionNumberSetupQueryKeys.setups(),
    queryFn: GetTransactionNumberSetupBootstrap,
    placeholderData: EmptyBootstrap,
  });
  const bootstrap = setupsQuery.data ?? EmptyBootstrap;
  const branchOptions = bootstrap.branches;
  const setups = bootstrap.setups;

  function setSetups(
    updater: (
      setups: TransactionNumberSetupRecord[],
    ) => TransactionNumberSetupRecord[],
  ) {
    queryClient.setQueryData<typeof EmptyBootstrap>(
      TransactionNumberSetupQueryKeys.setups(),
      (current = EmptyBootstrap) => ({
        ...current,
        setups: updater(current.setups),
      }),
    );
  }

  const updateSetupMutation = useMutation({
    mutationFn: UpdateTransactionNumberSetup,
    onSuccess: (setup) => {
      setSetups((setups) =>
        setups.some((current) => current.id === setup.id)
          ? setups.map((current) => (current.id === setup.id ? setup : current))
          : [...setups, setup],
      );
      toast.success("Module Transaction Number Setup updated.");
    },
    onError: () => {
      toast.error("Could not update the module transaction number setup.");
    },
  });
  const state = useMemo<TransactionNumberSetupState>(
    () => ({
      branchOptions,
      isLoading: setupsQuery.isLoading,
      lastSyncedAt: setupsQuery.dataUpdatedAt,
      isMutating: updateSetupMutation.isPending,
      setups,
      updateSetup: (setup) => updateSetupMutation.mutate(setup),
    }),
    [
      branchOptions,
      setups,
      setupsQuery.dataUpdatedAt,
      setupsQuery.isLoading,
      updateSetupMutation,
    ],
  );

  return selector ? selector(state) : (state as TSelected);
}
