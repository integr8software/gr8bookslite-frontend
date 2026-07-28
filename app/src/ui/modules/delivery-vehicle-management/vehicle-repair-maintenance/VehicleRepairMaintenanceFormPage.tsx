"use client";

import {
	VehicleRepairMaintenanceConfig,
	VehicleRepairMaintenanceHref,
} from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceConstants";
import { VehicleRepairMaintenanceMockData } from "@/app/src/data/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceData";
import { validateVehicleRepairMaintenance } from "@/app/src/validations/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceValidation";
import { DeliveryVehicleModuleFormPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleFormPage";

export function VehicleRepairMaintenanceFormPage() {
	return (
		<DeliveryVehicleModuleFormPage
			config={VehicleRepairMaintenanceConfig}
			href={VehicleRepairMaintenanceHref}
			initialRecords={VehicleRepairMaintenanceMockData}
			validateRecord={validateVehicleRepairMaintenance}
		/>
	);
}
