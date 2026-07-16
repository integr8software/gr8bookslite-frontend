"use client";

import { useMemo, useState } from "react";
import { getTaxMaintenanceSearchText } from "@/app/src/data/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceData";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useTaxMaintenance } from "@/app/src/hooks/modules/maintenance/tax-maintenance/useTaxMaintenance";
import type {
  TaxMaintenance,
  TaxMaintenanceStatusFilter,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";

export function useTaxMaintenanceListPage() {
  const taxMaintenance = useTaxMaintenance();
  const [statusFilter, setStatusFilter] =
    useState<TaxMaintenanceStatusFilter>("Active");
  const [query, setQuery] = useState("");
  const [pendingStatusTax, setPendingStatusTax] =
    useState<TaxMaintenance | null>(null);

  const filteredTaxes = useMemo(() => {
    const normalizedQuery = normalizeLowercaseText(query);

    return taxMaintenance.taxes.filter((tax) => {
      if (statusFilter && tax.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return getTaxMaintenanceSearchText(tax).includes(normalizedQuery);
    });
  }, [query, statusFilter, taxMaintenance.taxes]);

  function confirmTaxStatusChange() {
    if (!pendingStatusTax) {
      return;
    }

    return taxMaintenance
      .updateTax({
        ...pendingStatusTax,
        status: pendingStatusTax.status === "Active" ? "Inactive" : "Active",
      })
      .then(() => setPendingStatusTax(null))
      .catch(() => undefined);
  }

  return {
    ...taxMaintenance,
    confirmTaxStatusChange,
    filteredTaxes,
    pendingStatusTax,
    query,
    setPendingStatusTax,
    setQuery,
    setStatusFilter,
    statusFilter,
  };
}
