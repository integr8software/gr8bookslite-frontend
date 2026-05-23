"use client";

import { useParams } from "next/navigation";
import { WarehouseManagementHref } from "@/app/src/constants/modules/maintenance/warehouse-management/WarehouseManagementConstants";
import { useWarehouseManagementStore } from "./useWarehouseManagement";

export function useWarehouseItemsPage() {
	const params = useParams<{ recordId?: string }>();
	const { warehouses } = useWarehouseManagementStore();
	const warehouse = warehouses.find(
		(currentWarehouse) => currentWarehouse.id === params.recordId,
	);

	return {
		warehouse,
		warehouseHref: warehouse
			? `${WarehouseManagementHref}/view/${warehouse.id}`
			: WarehouseManagementHref,
	};
}
