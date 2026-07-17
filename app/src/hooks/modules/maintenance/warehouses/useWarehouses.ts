"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockWarehouses } from "@/app/src/data/modules/maintenance/warehouses/WarehouseData";
import { WarehouseQueryKeys } from "@/app/src/services/modules/maintenance/warehouses/WarehouseQueryKeys";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";

type WarehouseStoreState = {
	warehouses: WarehouseRecord[];
	addWarehouse: (warehouse: WarehouseRecord) => void;
	updateWarehouse: (warehouse: WarehouseRecord) => void;
	deleteWarehouse: (warehouseId: string) => void;
	refreshWarehouses: () => void;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
};

export function useWarehousesStore<
	TSelected = WarehouseStoreState,
>(selector?: (state: WarehouseStoreState) => TSelected) {
	const queryClient = useQueryClient();
	const warehousesQuery = useQuery({
		queryKey: WarehouseQueryKeys.warehouses(),
		queryFn: async () => MockWarehouses,
		initialData: MockWarehouses,
	});
	function refreshWarehouses() {
		void queryClient.invalidateQueries({
			queryKey: WarehouseQueryKeys.warehouses(),
		});
	}

	function updateCachedWarehouses(
		updater: (warehouses: WarehouseRecord[]) => WarehouseRecord[],
	) {
		queryClient.setQueryData<WarehouseRecord[]>(
			WarehouseQueryKeys.warehouses(),
			(currentWarehouses = MockWarehouses) => updater(currentWarehouses),
		);
	}

	const addWarehouseMutation = useMutation({
		mutationFn: async (warehouse: WarehouseRecord) => warehouse,
		onSuccess: (warehouse) => {
			updateCachedWarehouses((warehouses) => [...warehouses, warehouse]);
			toast.success("Warehouse created.");
		},
		onError: () => {
			toast.error("Could not create warehouse. Please try again.");
		},
	});

	const updateWarehouseMutation = useMutation({
		mutationFn: async (warehouse: WarehouseRecord) => warehouse,
		onSuccess: (warehouse) => {
			updateCachedWarehouses((warehouses) =>
				warehouses.map((currentWarehouse) =>
					currentWarehouse.id === warehouse.id ? warehouse : currentWarehouse,
				),
			);
			toast.success("Warehouse updated.");
		},
		onError: () => {
			toast.error("Could not update warehouse. Please try again.");
		},
	});

	const deleteWarehouseMutation = useMutation({
		mutationFn: async (warehouseId: string) => warehouseId,
		onSuccess: (warehouseId) => {
			updateCachedWarehouses((warehouses) =>
				warehouses.map((warehouse) =>
					warehouse.id === warehouseId
						? { ...warehouse, status: "Inactive" }
						: warehouse,
				),
			);
			toast.success("Warehouse set inactive.");
		},
		onError: () => {
			toast.error("Could not update warehouse status. Please try again.");
		},
	});

	const state: WarehouseStoreState = {
		warehouses: warehousesQuery.data,
		addWarehouse: (warehouse) => addWarehouseMutation.mutate(warehouse),
		updateWarehouse: (warehouse) => updateWarehouseMutation.mutate(warehouse),
		deleteWarehouse: (warehouseId) =>
			deleteWarehouseMutation.mutate(warehouseId),
		refreshWarehouses,
		isLoading: warehousesQuery.isLoading,
		isRefreshing: warehousesQuery.isFetching && !warehousesQuery.isLoading,
		lastSyncedAt: warehousesQuery.dataUpdatedAt,
		isMutating:
			addWarehouseMutation.isPending ||
			updateWarehouseMutation.isPending ||
			deleteWarehouseMutation.isPending,
	};

	return selector ? selector(state) : (state as TSelected);
}
