"use client";

import { useCallback, useMemo, useState } from "react";
import {
	loadPurchaseRequests,
	savePurchaseRequests,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

type PurchaseRequestStoreState = {
	requests: PurchaseRequestRecord[];
	addRequest: (request: PurchaseRequestRecord) => void;
	updateRequest: (request: PurchaseRequestRecord) => void;
	deleteRequest: (requestId: string) => void;
	isLoading: boolean;
	isMutating: boolean;
};

export function usePurchaseRequestStore<
	TSelected = PurchaseRequestStoreState,
>(selector?: (state: PurchaseRequestStoreState) => TSelected) {
	const [requests, setRequests] =
		useState<PurchaseRequestRecord[]>(loadPurchaseRequests);
	const [isMutating, setIsMutating] = useState(false);

	const commitRequests = useCallback(
		(
			updater: (
				currentRequests: PurchaseRequestRecord[],
			) => PurchaseRequestRecord[],
		) => {
			setIsMutating(true);
			setRequests((currentRequests) => {
				const nextRequests = updater(currentRequests);

				savePurchaseRequests(nextRequests);

				return nextRequests;
			});
			setIsMutating(false);
		},
		[],
	);

	const state = useMemo<PurchaseRequestStoreState>(
		() => ({
			requests,
			addRequest: (request) =>
				commitRequests((currentRequests) => [request, ...currentRequests]),
			updateRequest: (request) =>
				commitRequests((currentRequests) =>
					currentRequests.map((currentRequest) =>
						currentRequest.id === request.id ? request : currentRequest,
					),
				),
			deleteRequest: (requestId) =>
				commitRequests((currentRequests) =>
					currentRequests.filter((request) => request.id !== requestId),
				),
			isLoading: false,
			isMutating,
		}),
		[commitRequests, requests, isMutating],
	);

	return selector ? selector(state) : (state as TSelected);
}
