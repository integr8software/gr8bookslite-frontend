"use client";

import {
	VehicleRepairMaintenanceHref,
	VehicleRepairMaintenanceTablePaginationStorageKey,
} from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceConstants";
import { useVehicleRepairMaintenanceListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/vehicle-repair-maintenance/useVehicleRepairMaintenanceListPage";
import { DeliveryVehicleModuleListPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleListPage";

export function VehicleRepairMaintenanceListPage() {
	const page = useVehicleRepairMaintenanceListPage();

	return (
		<DeliveryVehicleModuleListPage
			href={VehicleRepairMaintenanceHref}
			page={page}
			paginationStorageKey={VehicleRepairMaintenanceTablePaginationStorageKey}
		/>
	);
}
