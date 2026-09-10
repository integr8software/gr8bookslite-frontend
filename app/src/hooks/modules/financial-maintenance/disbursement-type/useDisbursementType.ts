"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  createDisbursementType,
  fetchDisbursementTypes,
  updateDisbursementType,
  updateDisbursementTypeStatus,
} from "@/app/src/services/modules/financial-maintenance/disbursement-type/DisbursementTypeApi";
import { DisbursementTypeQueryKeys } from "@/app/src/services/modules/financial-maintenance/disbursement-type/DisbursementTypeQueryKeys";
import { DisbursementTypeStatuses } from "@/app/src/constants/modules/financial-maintenance/disbursement-type/DisbursementTypeConstants";
import type {
  DisbursementType,
  DisbursementTypeFormValues,
  DisbursementTypePermissions,
  DisbursementTypeStatistics,
  DisbursementTypeStoreOptions,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";

type DisbursementTypeStoreState = {
  disbursementTypes: DisbursementType[];
  addDisbursementType: (account: DisbursementTypeFormValues) => Promise<DisbursementType>;
  addDisbursementTypes: (accounts: DisbursementTypeFormValues[]) => Promise<DisbursementType[]>;
  updateDisbursementType: (account: DisbursementType) => Promise<DisbursementType>;
  updateDisbursementTypeStatus: (account: DisbursementType) => Promise<DisbursementType>;
  permissions: DisbursementTypePermissions;
  statistics: DisbursementTypeStatistics;
  refreshDisbursementTypes: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
};

const EmptyPermissions: DisbursementTypePermissions = {
  canView: false,
  canCreate: false,
  canUpdate: false,
  canCancel: false,
  canExport: false,
  canImport: false,
};

const EmptyStatistics: DisbursementTypeStatistics = {
  totalDisbursementTypes: 0,
  activeDisbursementTypes: 0,
  inactiveDisbursementTypes: 0,
  expenseDisbursementTypes: 0,
  collectionDisbursementTypes: 0,
};

export function useDisbursementTypeStore<TSelected = DisbursementTypeStoreState>(
  selector?: (state: DisbursementTypeStoreState) => TSelected,
  options: DisbursementTypeStoreOptions = {},
) {
  const queryClient = useQueryClient();
  const kind = options.kind ?? "disbursement";
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const companyId = authProfileQuery.data?.activeCompanyId ?? null;
  const DisbursementTypesQuery = useQuery({
    queryKey: DisbursementTypeQueryKeys.list(companyId, kind),
    queryFn: () => fetchDisbursementTypes(kind),
    enabled: Boolean(companyId),
    refetchOnMount: options.refetchOnMount,
    retry: false,
  });
  const refreshDisbursementTypes = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: DisbursementTypeQueryKeys.all(companyId, kind),
    });
  }, [companyId, kind, queryClient]);
  const addDisbursementTypeMutation = useMutation({
    mutationFn: (account: DisbursementTypeFormValues) => createDisbursementType(account, kind),
    onSuccess: (savedAccount) => {
      refreshDisbursementTypes();
      const firstGenerated = savedAccount.generatedAccounts?.[0];
      toast.success(
        firstGenerated
          ? `Disbursement type created successfully. Saved with Account Code - Account Title: ${firstGenerated.accountCode} - ${firstGenerated.accountTitle}.`
          : "Disbursement type created successfully.",
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not create disbursement type. Please try again.");
    },
  });
  const updateDisbursementTypeMutation = useMutation({
    mutationFn: (account: DisbursementType) => updateDisbursementType(account, kind),
    onSuccess: () => {
      refreshDisbursementTypes();
      toast.success("Disbursement type updated successfully.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update disbursement type. Please try again.");
    },
  });
  const updateDisbursementTypeStatusMutation = useMutation({
    mutationFn: (account: DisbursementType) => updateDisbursementTypeStatus(account, kind),
    onSuccess: (_, account) => {
      refreshDisbursementTypes();
      toast.success(`Disbursement type ${account.status === DisbursementTypeStatuses.Active ? "activated" : "inactivated"} successfully.`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update disbursement type status. Please try again.");
    },
  });
  const state = useMemo<DisbursementTypeStoreState>(() => {
    return {
      disbursementTypes: DisbursementTypesQuery.data?.disbursementTypes ?? [],
      permissions: DisbursementTypesQuery.data?.permissions ?? EmptyPermissions,
      statistics: DisbursementTypesQuery.data?.statistics ?? EmptyStatistics,
      addDisbursementType: (account) => addDisbursementTypeMutation.mutateAsync(account),
      addDisbursementTypes: (accounts) => Promise.all(accounts.map((account) => addDisbursementTypeMutation.mutateAsync(account))),
      updateDisbursementType: (account) => updateDisbursementTypeMutation.mutateAsync(account),
      updateDisbursementTypeStatus: (account) => updateDisbursementTypeStatusMutation.mutateAsync(account),
      refreshDisbursementTypes,
      isLoading: DisbursementTypesQuery.isLoading,
      isRefreshing: DisbursementTypesQuery.isFetching && !DisbursementTypesQuery.isLoading,
      lastSyncedAt: DisbursementTypesQuery.dataUpdatedAt,
      isMutating:
        addDisbursementTypeMutation.isPending || updateDisbursementTypeMutation.isPending || updateDisbursementTypeStatusMutation.isPending,
    };
  }, [
    addDisbursementTypeMutation,
    DisbursementTypesQuery.data,
    DisbursementTypesQuery.dataUpdatedAt,
    DisbursementTypesQuery.isFetching,
    DisbursementTypesQuery.isLoading,
    refreshDisbursementTypes,
    updateDisbursementTypeMutation,
    updateDisbursementTypeStatusMutation,
  ]);

  return selector ? selector(state) : (state as TSelected);
}
