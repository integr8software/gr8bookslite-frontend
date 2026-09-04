"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { deletePurchaseOrder, fetchPurchaseOrders } from "@/app/src/services/modules/purchasing/purchase-order/PurchaseOrderApi";
import { PurchaseOrderQueryKeys } from "@/app/src/services/modules/purchasing/purchase-order/PurchaseOrderQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PurchaseOrderRecord } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";

type PurchaseOrderStoreState = {
	orders: PurchaseOrderRecord[];
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
		queryFn: fetchPurchaseOrders,
	});
	const queryClient = useQueryClient();
	const deleteMutation = useMutation({ mutationFn: deletePurchaseOrder, onSuccess: () => queryClient.invalidateQueries({ queryKey: PurchaseOrderQueryKeys.orders() }) });
	const state = useMemo<PurchaseOrderStoreState>(
		() => ({
			orders: ordersQuery.data ?? [],
			deleteOrder: (orderId) => deleteMutation.mutate(orderId),
			isLoading: ordersQuery.isLoading,
			isMutating: deleteMutation.isPending,
			lastSyncedAt: ordersQuery.dataUpdatedAt,
		}),
		[
			ordersQuery.data,
			ordersQuery.dataUpdatedAt,
			ordersQuery.isLoading,
			deleteMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
