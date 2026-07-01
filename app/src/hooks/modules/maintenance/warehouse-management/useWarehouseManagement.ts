"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockWarehouses } from "@/app/src/data/modules/maintenance/warehouse-management/WarehouseManagementData";
import { WarehouseManagementQueryKeys } from "@/app/src/services/modules/maintenance/warehouse-management/WarehouseManagementQueryKeys";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";

type WarehouseManagementStoreState = {
	warehouses: WarehouseRecord[];
	addWarehouse: (warehouse: WarehouseRecord) => void;
	updateWarehouse: (warehouse: WarehouseRecord) => void;
	deleteWarehouse: (warehouseId: string) => void;
	isLoading: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
};

export function useWarehouseManagementStore<
	TSelected = WarehouseManagementStoreState,
>(selector?: (state: WarehouseManagementStoreState) => TSelected) {
	const queryClient = useQueryClient();
	const warehousesQuery = useQuery({
		queryKey: WarehouseManagementQueryKeys.warehouses(),
		queryFn: async () => MockWarehouses,
		initialData: MockWarehouses,
	});

	function updateCachedWarehouses(
		updater: (warehouses: WarehouseRecord[]) => WarehouseRecord[],
	) {
		queryClient.setQueryData<WarehouseRecord[]>(
			WarehouseManagementQueryKeys.warehouses(),
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

	const state: WarehouseManagementStoreState = {
		warehouses: warehousesQuery.data,
		addWarehouse: (warehouse) => addWarehouseMutation.mutate(warehouse),
		updateWarehouse: (warehouse) => updateWarehouseMutation.mutate(warehouse),
		deleteWarehouse: (warehouseId) =>
			deleteWarehouseMutation.mutate(warehouseId),
		isLoading: warehousesQuery.isLoading,
		lastSyncedAt: warehousesQuery.dataUpdatedAt,
		isMutating:
			addWarehouseMutation.isPending ||
			updateWarehouseMutation.isPending ||
			deleteWarehouseMutation.isPending,
	};

	return selector ? selector(state) : (state as TSelected);
}
