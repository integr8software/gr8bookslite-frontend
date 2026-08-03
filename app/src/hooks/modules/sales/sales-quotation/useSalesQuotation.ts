"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	loadSalesQuotations,
	saveSalesQuotations,
} from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import { SalesQuotationQueryKeys } from "@/app/src/services/modules/sales/sales-quotation/SalesQuotationQueryKeys";
import { useOptimisticModuleListMutation } from "@/app/src/hooks/shared/module/useOptimisticModuleListMutation";
import type { SalesQuotationRecord } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";

type SalesQuotationStoreState = {
	requests: SalesQuotationRecord[];
	addRequest: (request: SalesQuotationRecord) => void;
	updateRequest: (request: SalesQuotationRecord) => void;
	deleteRequest: (requestId: string) => void;
	isLoading: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
};

export function useSalesQuotationStore<
	TSelected = SalesQuotationStoreState,
>(selector?: (state: SalesQuotationStoreState) => TSelected) {
	const requestsQuery = useQuery({
		queryKey: SalesQuotationQueryKeys.requests(),
		queryFn: async () => loadSalesQuotations(),
		initialData: loadSalesQuotations,
	});

	const saveRequestsMutation =
		useOptimisticModuleListMutation<SalesQuotationRecord>({
			errorMessage: "Could not save the sales quotation changes.",
			getFallbackItems: loadSalesQuotations,
			persistItems: saveSalesQuotations,
			queryKey: SalesQuotationQueryKeys.requests(),
		});

	const state = useMemo<SalesQuotationStoreState>(
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

