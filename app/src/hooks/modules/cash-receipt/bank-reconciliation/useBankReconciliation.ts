"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createBankReconciliationRecord,
  fetchBankReconciliationById,
  fetchBankReconciliationRecords,
  updateBankReconciliationRecord,
  updateBankReconciliationStatus,
} from "@/app/src/services/modules/cash-receipt/bank-reconciliation/BankReconciliationApi";
import { BankReconciliationQueryKeys } from "@/app/src/services/modules/cash-receipt/bank-reconciliation/BankReconciliationQueryKeys";
import type {
  BankReconciliationFormValues,
  BankReconciliationStatus,
} from "@/app/src/types/modules/cash-receipt/bank-reconciliation/BankReconciliationTypes";

export function useBankReconciliationListQuery() {
  return useQuery({
    queryKey: BankReconciliationQueryKeys.lists(),
    queryFn: fetchBankReconciliationRecords,
    staleTime: 30 * 1000,
  });
}

export function useBankReconciliationDetailQuery(id?: string) {
  return useQuery({
    queryKey: BankReconciliationQueryKeys.detail(id),
    queryFn: () => (id ? fetchBankReconciliationById(id) : null),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useSaveBankReconciliationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: BankReconciliationFormValues;
    }) => {
      if (id) {
        return updateBankReconciliationRecord(id, values);
      }
      return createBankReconciliationRecord(values);
    },
    onSuccess: (savedRecord) => {
      void queryClient.invalidateQueries({
        queryKey: BankReconciliationQueryKeys.all,
      });
      toast.success(
        `Bank Reconciliation ${savedRecord.brNo} saved successfully.`,
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save bank reconciliation.",
      );
    },
  });
}

export function useUpdateBankReconciliationStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: BankReconciliationStatus;
    }) => {
      return updateBankReconciliationStatus(id, status);
    },
    onSuccess: (updatedRecord) => {
      void queryClient.invalidateQueries({
        queryKey: BankReconciliationQueryKeys.all,
      });
      toast.success(
        `Bank Reconciliation ${updatedRecord.brNo} status updated to ${updatedRecord.status}.`,
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update bank reconciliation status.",
      );
    },
  });
}
