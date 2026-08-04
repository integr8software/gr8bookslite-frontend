"use client";

import {
  VehicleRepairMaintenanceConfig,
  VehicleRepairMaintenanceTablePaginationStorageKey,
} from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceConstants";
import {
  createVehicleRepairMaintenanceRecord,
  VehicleRepairMaintenanceMockData,
} from "@/app/src/data/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceData";
import { validateVehicleRepairMaintenance } from "@/app/src/validations/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceValidation";
import { DeliveryVehicleModuleListPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleListPage";

export function VehicleRepairMaintenanceListPage() {
  return (
    <DeliveryVehicleModuleListPage
      pageConfig={VehicleRepairMaintenanceConfig}
      paginationKey={VehicleRepairMaintenanceTablePaginationStorageKey}
      createRecord={createVehicleRepairMaintenanceRecord}
      initialRecords={VehicleRepairMaintenanceMockData}
      validateRecord={validateVehicleRepairMaintenance}
    />
  );
}
