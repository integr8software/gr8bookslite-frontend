"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	loadPurchaseRequests,
	savePurchaseRequests,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import { PurchaseRequestQueryKeys } from "@/app/src/services/modules/purchasing/purchase-request/PurchaseRequestQueryKeys";
import { useOptimisticModuleListMutation } from "@/app/src/hooks/shared/module/useOptimisticModuleListMutation";
import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

type PurchaseRequestStoreState = {
	requests: PurchaseRequestRecord[];
	addRequest: (request: PurchaseRequestRecord) => void;
	updateRequest: (request: PurchaseRequestRecord) => void;
	deleteRequest: (requestId: string) => void;
	isLoading: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
};

export function usePurchaseRequestStore<
	TSelected = PurchaseRequestStoreState,
>(selector?: (state: PurchaseRequestStoreState) => TSelected) {
	const requestsQuery = useQuery({
		queryKey: PurchaseRequestQueryKeys.requests(),
		queryFn: async () => loadPurchaseRequests(),
		initialData: loadPurchaseRequests,
	});

	const saveRequestsMutation =
		useOptimisticModuleListMutation<PurchaseRequestRecord>({
			errorMessage: "Could not save the purchase request changes.",
			getFallbackItems: loadPurchaseRequests,
			persistItems: savePurchaseRequests,
			queryKey: PurchaseRequestQueryKeys.requests(),
		});

	const state = useMemo<PurchaseRequestStoreState>(
		() => ({
			requests: requestsQuery.data,
			addRequest: (request) =>
				saveRequestsMutation.mutate((currentRequests) => [
					request,
					...currentRequests,
				]),
			updateRequest: (request) =>
				saveRequestsMutation.mutate((currentRequests) =>
					currentRequests.map((currentRequest) =>
						currentRequest.id === request.id ? request : currentRequest,
					),
				),
			deleteRequest: (requestId) =>
				saveRequestsMutation.mutate((currentRequests) =>
					currentRequests.filter((request) => request.id !== requestId),
				),
			isLoading: requestsQuery.isLoading,
			lastSyncedAt: requestsQuery.dataUpdatedAt,
			isMutating: saveRequestsMutation.isPending,
		}),
		[
			requestsQuery.data,
			requestsQuery.dataUpdatedAt,
			requestsQuery.isLoading,
			saveRequestsMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
