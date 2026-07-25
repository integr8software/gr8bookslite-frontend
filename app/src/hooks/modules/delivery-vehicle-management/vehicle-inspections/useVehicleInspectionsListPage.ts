"use client";

import { VehicleInspectionsConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-inspections/VehicleInspectionsConstants";
import { createVehicleInspectionRecord, VehicleInspectionsMockData } from "@/app/src/data/modules/delivery-vehicle-management/vehicle-inspections/VehicleInspectionsData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateVehicleInspection } from "@/app/src/validations/modules/delivery-vehicle-management/vehicle-inspections/VehicleInspectionsValidation";

export function useVehicleInspectionsListPage() {
  return useDeliveryVehicleModuleListPage({
    config: VehicleInspectionsConfig,
    createRecord: createVehicleInspectionRecord,
    initialRecords: VehicleInspectionsMockData,
    validateRecord: validateVehicleInspection,
  });
}
