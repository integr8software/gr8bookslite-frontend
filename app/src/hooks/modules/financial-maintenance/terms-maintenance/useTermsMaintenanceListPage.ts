"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useTermsMaintenanceStore } from "@/app/src/hooks/modules/financial-maintenance/terms-maintenance/useTermsMaintenance";
import type {
  TermsMaintenance,
  TermsMaintenanceDatemodeFilter,
  TermsMaintenanceStatusFilter,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";

export function useTermsMaintenanceListPage() {
  const { addTerms, isLoading, isMutating, isRefreshing, lastSyncedAt, permissions, refreshTerms, statistics, terms, updateTerm } =
    useTermsMaintenanceStore();
  const [datemodeFilter, setDatemodeFilter] = useState<TermsMaintenanceDatemodeFilter>("All");
  const [statusFilter, setStatusFilter] = useState<TermsMaintenanceStatusFilter>("Active");
  const [query, setQuery] = useState("");
  const [pendingStatusTerm, setPendingStatusTerm] = useState<TermsMaintenance | null>(null);

  const filteredTerms = useMemo(() => {
    const normalizedQuery = normalizeLowercaseText(query);

    return terms.filter((term) => {
      if (datemodeFilter !== "All" && term.datemode !== datemodeFilter) {
        return false;
      }

      if (statusFilter && term.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [term.name, term.description, term.datemode, term.period, term.status].join(" ").toLowerCase().includes(normalizedQuery);
    });
  }, [datemodeFilter, query, statusFilter, terms]);

  function resetFilters() {
    setDatemodeFilter("All");
    setStatusFilter("Active");
    setQuery("");
  }

  function confirmTermStatusChange() {
    if (!pendingStatusTerm) {
      return;
    }

    return updateTerm({
      ...pendingStatusTerm,
      status: pendingStatusTerm.status === "Active" ? "Inactive" : "Active",
    })
      .then(() => {
        setPendingStatusTerm(null);
      })
      .catch(() => undefined);
  }

  return {
    confirmTermStatusChange,
    addTerms,
    datemodeFilter,
    filteredTerms,
    isLoading,
    isRefreshing,
    lastSyncedAt,
    isMutating,
    pendingStatusTerm,
    permissions,
    query,
    refreshTerms,
    resetFilters,
    setDatemodeFilter,
    setPendingStatusTerm,
    setQuery,
    setStatusFilter,
    statusFilter,
    statistics,
    terms,
  };
}
