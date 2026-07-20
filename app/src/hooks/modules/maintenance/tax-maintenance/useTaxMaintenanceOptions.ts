"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatTaxMaintenancePercentage } from "@/app/src/data/modules/maintenance/tax-maintenance/TaxMaintenanceData";
import { fetchTaxMaintenance } from "@/app/src/services/modules/maintenance/tax-maintenance/TaxMaintenanceApi";
import { TaxMaintenanceQueryKeys } from "@/app/src/services/modules/maintenance/tax-maintenance/TaxMaintenanceQueryKeys";
import type { TaxMaintenancePermissions } from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";

const EmptyTaxMaintenancePermissions: TaxMaintenancePermissions = {
  canCreate: false,
  canExport: false,
  canImport: false,
  canUpdate: false,
  canView: false,
};

export function useTaxMaintenanceOptions() {
  const query = useQuery({
    queryKey: TaxMaintenanceQueryKeys.list(),
    queryFn: fetchTaxMaintenance,
    retry: false,
  });

  return useMemo(
    () => ({
      isLoading: query.isLoading,
      accountOptions: query.data?.accountOptions ?? [],
      defaultAccountIds: query.data?.defaultAccountIds,
      options: (query.data?.taxMaintenance ?? [])
        .filter((tax) => tax.status === "Active")
        .map((tax) => ({
          description: formatTaxMaintenancePercentage(tax.percentage),
          name: tax.name,
          value: tax.id,
        })),
      permissions: query.data?.permissions ?? EmptyTaxMaintenancePermissions,
      refetch: query.refetch,
      taxes: query.data?.taxMaintenance ?? [],
    }),
    [
      query.data?.accountOptions,
      query.data?.defaultAccountIds,
      query.data?.permissions,
      query.data?.taxMaintenance,
      query.isLoading,
      query.refetch,
    ],
  );
}

