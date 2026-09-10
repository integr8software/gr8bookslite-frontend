"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useCollectionTypeStore } from "@/app/src/hooks/modules/financial-maintenance/collection-type/useCollectionType";
import type {
  CollectionType,
  CollectionTypeMaintenanceKind,
  CollectionTypeStatusFilter,
  CollectionTypeTypeFilter,
} from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";

export function useCollectionTypeListPage(kind: CollectionTypeMaintenanceKind = "disbursement") {
  const {
    addCollectionTypes,
    collectionTypes,
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    permissions,
    refreshCollectionTypes,
    statistics,
    updateCollectionTypeStatus,
  } = useCollectionTypeStore(undefined, { kind });
  const [statusFilter, setStatusFilter] = useState<CollectionTypeStatusFilter>("Active");
  const [typeFilter, setTypeFilter] = useState<CollectionTypeTypeFilter>("");
  const [query, setQuery] = useState("");
  const [pendingStatusAccount, setPendingStatusAccount] = useState<CollectionType | null>(null);
  const filteredCollectionTypes = useMemo(() => {
    const normalizedQuery = normalizeLowercaseText(query);

    return collectionTypes.filter((account) => {
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
        account.collectionTypeName,
        account.description,
        account.type,
        account.status,
        ...account.generatedAccounts.flatMap((generated) => [generated.accountCode, generated.accountTitle]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [collectionTypes, query, statusFilter, typeFilter]);

  function resetFilters() {
    setStatusFilter("Active");
    setTypeFilter("");
    setQuery("");
  }

  function confirmStatusChange() {
    if (!pendingStatusAccount) {
      return;
    }

    return updateCollectionTypeStatus({
      ...pendingStatusAccount,
      status: pendingStatusAccount.status === "Active" ? "Inactive" : "Active",
    })
      .then(() => setPendingStatusAccount(null))
      .catch(() => undefined);
  }

  return {
    addCollectionTypes,
    confirmStatusChange,
    collectionTypes,
    filteredCollectionTypes,
    isLoading,
    isMutating,
    isRefreshing,
    lastSyncedAt,
    pendingStatusAccount,
    permissions,
    query,
    refreshCollectionTypes,
    resetFilters,
    setPendingStatusAccount,
    setQuery,
    setStatusFilter: setStatusFilter as (value: CollectionTypeStatusFilter) => void,
    setTypeFilter: setTypeFilter as (value: CollectionTypeTypeFilter) => void,
    statistics,
    statusFilter,
    typeFilter,
  };
}
