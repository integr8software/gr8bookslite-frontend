"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	loadPurchaseOrders,
	savePurchaseOrders,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import { PurchaseOrderQueryKeys } from "@/app/src/services/modules/purchasing/purchase-order/PurchaseOrderQueryKeys";
import { useOptimisticModuleListMutation } from "@/app/src/hooks/shared/module/useOptimisticModuleListMutation";
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
	const ordersQuery = useQuery({
		queryKey: PurchaseOrderQueryKeys.orders(),
		queryFn: async () => loadPurchaseOrders(),
		initialData: loadPurchaseOrders,
	});
	const saveOrdersMutation = useOptimisticModuleListMutation<PurchaseOrderRecord>({
		errorMessage: "Could not save the purchase order changes.",
		getFallbackItems: loadPurchaseOrders,
		persistItems: savePurchaseOrders,
		queryKey: PurchaseOrderQueryKeys.orders(),
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
