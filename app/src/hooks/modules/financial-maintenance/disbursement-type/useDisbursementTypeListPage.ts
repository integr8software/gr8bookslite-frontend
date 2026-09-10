"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useDisbursementTypeStore } from "@/app/src/hooks/modules/financial-maintenance/disbursement-type/useDisbursementType";
import type {
  DisbursementType,
  DisbursementTypeMaintenanceKind,
  DisbursementTypeStatusFilter,
  DisbursementTypeTypeFilter,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";

export function useDisbursementTypeListPage(kind: DisbursementTypeMaintenanceKind = "disbursement") {
  const {
    addDisbursementTypes,
    disbursementTypes,
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    permissions,
    refreshDisbursementTypes,
    statistics,
    updateDisbursementTypeStatus,
  } = useDisbursementTypeStore(undefined, { kind });
  const [statusFilter, setStatusFilter] = useState<DisbursementTypeStatusFilter>("Active");
  const [typeFilter, setTypeFilter] = useState<DisbursementTypeTypeFilter>("");
  const [query, setQuery] = useState("");
  const [pendingStatusAccount, setPendingStatusAccount] = useState<DisbursementType | null>(null);
  const filteredDisbursementTypes = useMemo(() => {
    const normalizedQuery = normalizeLowercaseText(query);

    return disbursementTypes.filter((account) => {
      if (statusFilter && account.status !== statusFilter) {
        return false;
      }

      if (typeFilter && account.type !== typeFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        account.disbursementTypeName,
        account.description,
        account.type,
        account.status,
        ...account.generatedAccounts.flatMap((generated) => [generated.accountCode, generated.accountTitle]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [disbursementTypes, query, statusFilter, typeFilter]);

  function resetFilters() {
    setStatusFilter("Active");
    setTypeFilter("");
    setQuery("");
  }

  function confirmStatusChange() {
    if (!pendingStatusAccount) {
      return;
    }

    return updateDisbursementTypeStatus({
      ...pendingStatusAccount,
      status: pendingStatusAccount.status === "Active" ? "Inactive" : "Active",
    })
      .then(() => setPendingStatusAccount(null))
      .catch(() => undefined);
  }

  return {
    addDisbursementTypes,
    confirmStatusChange,
    disbursementTypes,
    filteredDisbursementTypes,
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    pendingStatusAccount,
    permissions,
    query,
    refreshDisbursementTypes,
    resetFilters,
    setPendingStatusAccount,
    setQuery,
    setStatusFilter: setStatusFilter as (value: DisbursementTypeStatusFilter) => void,
    setTypeFilter: setTypeFilter as (value: DisbursementTypeTypeFilter) => void,
    statistics,
    statusFilter,
    typeFilter,
  };
}
