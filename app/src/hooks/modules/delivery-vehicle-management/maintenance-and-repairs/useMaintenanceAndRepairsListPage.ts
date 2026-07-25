"use client";

import { MaintenanceAndRepairsConfig } from "@/app/src/constants/modules/delivery-vehicle-management/maintenance-and-repairs/MaintenanceAndRepairsConstants";
import { createMaintenanceWorkOrderRecord, MaintenanceAndRepairsMockData } from "@/app/src/data/modules/delivery-vehicle-management/maintenance-and-repairs/MaintenanceAndRepairsData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateMaintenanceWorkOrder } from "@/app/src/validations/modules/delivery-vehicle-management/maintenance-and-repairs/MaintenanceAndRepairsValidation";

export function useMaintenanceAndRepairsListPage() {
  return useDeliveryVehicleModuleListPage({
    config: MaintenanceAndRepairsConfig,
    createRecord: createMaintenanceWorkOrderRecord,
    initialRecords: MaintenanceAndRepairsMockData,
    validateRecord: validateMaintenanceWorkOrder,
  });
}
