"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  EmptyTaxMaintenancePermissions,
  EmptyTaxMaintenanceStatistics,
  ReservedRoleTaxMaintenancePermissions,
  mapChartAccountToModuleChartAccount,
} from "@/app/src/data/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import { FetchChartAccountsTree } from "@/app/src/services/modules/maintenance/charts-of-accounts/ChartsOfAccountsApi";
import {
  createTaxMaintenance,
  fetchTaxMaintenance,
  updateTaxMaintenance,
} from "@/app/src/services/modules/maintenance/tax-maintenance/TaxMaintenanceApi";
import { TaxMaintenanceQueryKeys } from "@/app/src/services/modules/maintenance/tax-maintenance/TaxMaintenanceQueryKeys";
import type {
  TaxMaintenance,
  TaxMaintenanceFormValues,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";

export function useTaxMaintenance() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const taxQuery = useQuery({
    queryKey: TaxMaintenanceQueryKeys.list(),
    queryFn: fetchTaxMaintenance,
  });
  const accountsQuery = useQuery({
    queryKey: ["taxMaintenance", "chartAccounts"],
    queryFn: FetchChartAccountsTree,
  });
  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: TaxMaintenanceQueryKeys.all(),
    });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: createTaxMaintenance,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TaxMaintenanceQueryKeys.all(),
      });
      toast.success("Tax type created successfully.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create tax type. Please try again.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTaxMaintenance,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TaxMaintenanceQueryKeys.all(),
      });
      toast.success("Tax type updated successfully.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update tax type. Please try again.",
      );
    },
  });

  return useMemo(() => {
    const effectiveRole = ResolveAuthProfileEffectiveRole(
      authProfileQuery.data,
    );
    const hasReservedRoleAccess =
      effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";

    return {
      accountOptions: (accountsQuery.data ?? []).map(
        mapChartAccountToModuleChartAccount,
      ),
      addTax: (values: TaxMaintenanceFormValues) =>
        createMutation.mutateAsync(values),
      isLoading: taxQuery.isLoading || accountsQuery.isLoading,
      isMutating: createMutation.isPending || updateMutation.isPending,
      isRefreshing:
        (taxQuery.isFetching && !taxQuery.isLoading) ||
        (accountsQuery.isFetching && !accountsQuery.isLoading),
      lastSyncedAt: taxQuery.dataUpdatedAt,
      permissions: hasReservedRoleAccess
        ? ReservedRoleTaxMaintenancePermissions
        : (taxQuery.data?.permissions ?? EmptyTaxMaintenancePermissions),
      refresh,
      statistics: taxQuery.data?.statistics ?? EmptyTaxMaintenanceStatistics,
      taxes: taxQuery.data?.taxMaintenance ?? [],
      updateTax: (tax: TaxMaintenance) => updateMutation.mutateAsync(tax),
    };
  }, [
    accountsQuery.data,
    accountsQuery.isFetching,
    accountsQuery.isLoading,
    authProfileQuery.data,
    createMutation,
    refresh,
    taxQuery.data,
    taxQuery.dataUpdatedAt,
    taxQuery.isFetching,
    taxQuery.isLoading,
    updateMutation,
  ]);
}
