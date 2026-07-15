"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatTaxMaintenancePercentage } from "@/app/src/data/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceData";
import { fetchTaxMaintenance } from "@/app/src/services/modules/maintenance/tax-maintenance/TaxMaintenanceApi";
import { TaxMaintenanceQueryKeys } from "@/app/src/services/modules/maintenance/tax-maintenance/TaxMaintenanceQueryKeys";

export function useTaxMaintenanceOptions() {
  const query = useQuery({
    queryKey: TaxMaintenanceQueryKeys.list(),
    queryFn: fetchTaxMaintenance,
  });

  return useMemo(
    () => ({
      isLoading: query.isLoading,
      options: (query.data?.taxMaintenance ?? [])
        .filter((tax) => tax.status === "Active")
        .map((tax) => ({
          description: formatTaxMaintenancePercentage(tax.percentage),
          name: tax.name,
          value: tax.id,
        })),
      taxes: query.data?.taxMaintenance ?? [],
    }),
    [query.data?.taxMaintenance, query.isLoading],
  );
}
