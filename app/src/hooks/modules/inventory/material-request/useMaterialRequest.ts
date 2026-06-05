"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	loadMaterialRequests,
	saveMaterialRequests,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import { MaterialRequestQueryKeys } from "@/app/src/services/modules/inventory/material-request/MaterialRequestQueryKeys";
import type { MaterialRequestRecord } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";

type MaterialRequestStoreState = {
	requests: MaterialRequestRecord[];
	addRequest: (request: MaterialRequestRecord) => void;
	updateRequest: (request: MaterialRequestRecord) => void;
	deleteRequest: (requestId: string) => void;
	isLoading: boolean;
	isMutating: boolean;
};

export function useMaterialRequestStore<TSelected = MaterialRequestStoreState>(
	selector?: (state: MaterialRequestStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const requestsQuery = useQuery({
		queryKey: MaterialRequestQueryKeys.requests(),
		queryFn: async () => loadMaterialRequests(),
		initialData: loadMaterialRequests,
	});

	const saveRequestsMutation = useMutation({
		mutationFn: async (
			updater: (
				currentRequests: MaterialRequestRecord[],
			) => MaterialRequestRecord[],
		) => {
			const currentRequests =
				queryClient.getQueryData<MaterialRequestRecord[]>(
					MaterialRequestQueryKeys.requests(),
				) ?? loadMaterialRequests();
			const nextRequests = updater(currentRequests);

			saveMaterialRequests(nextRequests);

			return nextRequests;
		},
		onSuccess: (nextRequests) => {
			queryClient.setQueryData(
				MaterialRequestQueryKeys.requests(),
				nextRequests,
			);
		},
	});

	const state = useMemo<MaterialRequestStoreState>(
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
			isMutating: saveRequestsMutation.isPending,
		}),
		[requestsQuery.data, requestsQuery.isLoading, saveRequestsMutation],
	);

	return selector ? selector(state) : (state as TSelected);
}
