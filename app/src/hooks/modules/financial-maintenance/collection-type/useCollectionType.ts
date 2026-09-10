"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  createCollectionType,
  fetchCollectionTypes,
  updateCollectionType,
  updateCollectionTypeStatus,
} from "@/app/src/services/modules/financial-maintenance/collection-type/CollectionTypeApi";
import { CollectionTypeQueryKeys } from "@/app/src/services/modules/financial-maintenance/collection-type/CollectionTypeQueryKeys";
import { CollectionTypeStatuses } from "@/app/src/constants/modules/financial-maintenance/collection-type/CollectionTypeConstants";
import type {
  CollectionType,
  CollectionTypeFormValues,
  CollectionTypePermissions,
  CollectionTypeStatistics,
  CollectionTypeStoreOptions,
} from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";

type CollectionTypeStoreState = {
  collectionTypes: CollectionType[];
  addCollectionType: (account: CollectionTypeFormValues) => Promise<CollectionType>;
  addCollectionTypes: (accounts: CollectionTypeFormValues[]) => Promise<CollectionType[]>;
  updateCollectionType: (account: CollectionType) => Promise<CollectionType>;
  updateCollectionTypeStatus: (account: CollectionType) => Promise<CollectionType>;
  permissions: CollectionTypePermissions;
  statistics: CollectionTypeStatistics;
  refreshCollectionTypes: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
};

const EmptyPermissions: CollectionTypePermissions = {
  canView: false,
  canCreate: false,
  canUpdate: false,
  canCancel: false,
  canExport: false,
  canImport: false,
};

const EmptyStatistics: CollectionTypeStatistics = {
  totalCollectionTypes: 0,
  activeCollectionTypes: 0,
  inactiveCollectionTypes: 0,
  expenseCollectionTypes: 0,
  collectionCollectionTypes: 0,
};

export function useCollectionTypeStore<TSelected = CollectionTypeStoreState>(
  selector?: (state: CollectionTypeStoreState) => TSelected,
  options: CollectionTypeStoreOptions = {},
) {
  const queryClient = useQueryClient();
  const kind = options.kind ?? "collection";
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const companyId = authProfileQuery.data?.activeCompanyId ?? null;
  const CollectionTypesQuery = useQuery({
    queryKey: CollectionTypeQueryKeys.list(companyId, kind),
    queryFn: () => fetchCollectionTypes(kind),
    enabled: Boolean(companyId),
    refetchOnMount: options.refetchOnMount,
    retry: false,
  });
  const refreshCollectionTypes = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: CollectionTypeQueryKeys.all(companyId, kind),
    });
  }, [companyId, kind, queryClient]);
  const addCollectionTypeMutation = useMutation({
    mutationFn: (account: CollectionTypeFormValues) => createCollectionType(account, kind),
    onSuccess: (savedAccount) => {
      refreshCollectionTypes();
      const firstGenerated = savedAccount.generatedAccounts?.[0];
      toast.success(
        firstGenerated
          ? `Collection type created successfully. Saved with Account Code - Account Title: ${firstGenerated.accountCode} - ${firstGenerated.accountTitle}.`
          : "Collection type created successfully.",
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not create collection type. Please try again.");
    },
  });
  const updateCollectionTypeMutation = useMutation({
    mutationFn: (account: CollectionType) => updateCollectionType(account, kind),
    onSuccess: () => {
      refreshCollectionTypes();
      toast.success("Collection type updated successfully.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update collection type. Please try again.");
    },
  });
  const updateCollectionTypeStatusMutation = useMutation({
    mutationFn: (account: CollectionType) => updateCollectionTypeStatus(account, kind),
    onSuccess: (_, account) => {
      refreshCollectionTypes();
      toast.success(`Collection type ${account.status === CollectionTypeStatuses.Active ? "activated" : "inactivated"} successfully.`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update collection type status. Please try again.");
    },
  });
  const state = useMemo<CollectionTypeStoreState>(() => {
    return {
      collectionTypes: CollectionTypesQuery.data?.collectionTypes ?? [],
      permissions: CollectionTypesQuery.data?.permissions ?? EmptyPermissions,
      statistics: CollectionTypesQuery.data?.statistics ?? EmptyStatistics,
      addCollectionType: (account) => addCollectionTypeMutation.mutateAsync(account),
      addCollectionTypes: (accounts) => Promise.all(accounts.map((account) => addCollectionTypeMutation.mutateAsync(account))),
      updateCollectionType: (account) => updateCollectionTypeMutation.mutateAsync(account),
      updateCollectionTypeStatus: (account) => updateCollectionTypeStatusMutation.mutateAsync(account),
      refreshCollectionTypes,
      isLoading: CollectionTypesQuery.isLoading,
      isRefreshing: CollectionTypesQuery.isFetching && !CollectionTypesQuery.isLoading,
      lastSyncedAt: CollectionTypesQuery.dataUpdatedAt,
      isMutating:
        addCollectionTypeMutation.isPending || updateCollectionTypeMutation.isPending || updateCollectionTypeStatusMutation.isPending,
    };
  }, [
    addCollectionTypeMutation,
    CollectionTypesQuery.data,
    CollectionTypesQuery.dataUpdatedAt,
    CollectionTypesQuery.isFetching,
    CollectionTypesQuery.isLoading,
    refreshCollectionTypes,
    updateCollectionTypeMutation,
    updateCollectionTypeStatusMutation,
  ]);

  return selector ? selector(state) : (state as TSelected);
}
