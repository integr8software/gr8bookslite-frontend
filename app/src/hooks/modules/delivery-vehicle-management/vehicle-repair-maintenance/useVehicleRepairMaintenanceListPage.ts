"use client";

import { VehicleRepairMaintenanceConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceConstants";
import { createVehicleRepairMaintenanceRecord, VehicleRepairMaintenanceMockData } from "@/app/src/data/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateVehicleRepairMaintenance } from "@/app/src/validations/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceValidation";

export function useVehicleRepairMaintenanceListPage() {
  return useDeliveryVehicleModuleListPage({
    config: VehicleRepairMaintenanceConfig,
    createRecord: createVehicleRepairMaintenanceRecord,
    initialRecords: VehicleRepairMaintenanceMockData,
    validateRecord: validateVehicleRepairMaintenance,
  });
}
