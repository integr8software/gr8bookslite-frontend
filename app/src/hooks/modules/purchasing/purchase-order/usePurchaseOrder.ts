"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	loadPurchaseOrders,
	savePurchaseOrders,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import { PurchaseOrderQueryKeys } from "@/app/src/services/modules/purchasing/purchase-order/PurchaseOrderQueryKeys";
import type { PurchaseOrderRecord } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";

type PurchaseOrderStoreState = {
	orders: PurchaseOrderRecord[];
	addOrder: (order: PurchaseOrderRecord) => void;
	updateOrder: (order: PurchaseOrderRecord) => void;
	deleteOrder: (orderId: string) => void;
	isLoading: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
};

export function usePurchaseOrderStore<TSelected = PurchaseOrderStoreState>(
	selector?: (state: PurchaseOrderStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const ordersQuery = useQuery({
		queryKey: PurchaseOrderQueryKeys.orders(),
		queryFn: async () => loadPurchaseOrders(),
		initialData: loadPurchaseOrders,
	});
	const saveOrdersMutation = useMutation({
		mutationFn: async (
			updater: (currentOrders: PurchaseOrderRecord[]) => PurchaseOrderRecord[],
		) => {
			const currentOrders =
				queryClient.getQueryData<PurchaseOrderRecord[]>(
					PurchaseOrderQueryKeys.orders(),
				) ?? loadPurchaseOrders();
			const nextOrders = updater(currentOrders);

			savePurchaseOrders(nextOrders);

			return nextOrders;
		},
		onSuccess: (nextOrders) => {
			queryClient.setQueryData(PurchaseOrderQueryKeys.orders(), nextOrders);
		},
	});
	const state = useMemo<PurchaseOrderStoreState>(
		() => ({
			orders: ordersQuery.data,
			addOrder: (order) =>
				saveOrdersMutation.mutate((currentOrders) => [
					order,
					...currentOrders,
				]),
			updateOrder: (order) =>
				saveOrdersMutation.mutate((currentOrders) =>
					currentOrders.map((currentOrder) =>
						currentOrder.id === order.id ? order : currentOrder,
					),
				),
			deleteOrder: (orderId) =>
				saveOrdersMutation.mutate((currentOrders) =>
					currentOrders.filter((order) => order.id !== orderId),
				),
			isLoading: ordersQuery.isLoading,
			isMutating: saveOrdersMutation.isPending,
			lastSyncedAt: ordersQuery.dataUpdatedAt,
		}),
		[
			ordersQuery.data,
			ordersQuery.dataUpdatedAt,
			ordersQuery.isLoading,
			saveOrdersMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
