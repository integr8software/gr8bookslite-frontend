"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPurchaseRequests } from "@/app/src/services/modules/purchasing/purchase-request/PurchaseRequestApi";
import { PurchaseRequestQueryKeys } from "@/app/src/services/modules/purchasing/purchase-request/PurchaseRequestQueryKeys";
import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

type PurchaseRequestStoreState = {
  requests: PurchaseRequestRecord[];
  isLoading: boolean;
  lastSyncedAt: number;
};

export function usePurchaseRequestStore<TSelected = PurchaseRequestStoreState>(selector?: (state: PurchaseRequestStoreState) => TSelected) {
  const requestsQuery = useQuery({
    queryKey: PurchaseRequestQueryKeys.requests(),
    queryFn: fetchPurchaseRequests,
  });

  const state = useMemo<PurchaseRequestStoreState>(
    () => ({
      requests: requestsQuery.data ?? [],
      isLoading: requestsQuery.isLoading,
      lastSyncedAt: requestsQuery.dataUpdatedAt,
    }),
    [requestsQuery.data, requestsQuery.dataUpdatedAt, requestsQuery.isLoading],
  );

  return selector ? selector(state) : (state as TSelected);
}
