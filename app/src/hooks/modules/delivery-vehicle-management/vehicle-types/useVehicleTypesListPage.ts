"use client";

import { VehicleTypesConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-types/VehicleTypesConstants";
import { createVehicleTypeRecord, VehicleTypesMockData } from "@/app/src/data/modules/delivery-vehicle-management/vehicle-types/VehicleTypesData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateVehicleType } from "@/app/src/validations/modules/delivery-vehicle-management/vehicle-types/VehicleTypesValidation";

export function useVehicleTypesListPage() {
  return useDeliveryVehicleModuleListPage({
    config: VehicleTypesConfig,
    createRecord: createVehicleTypeRecord,
    initialRecords: VehicleTypesMockData,
    validateRecord: validateVehicleType,
  });
}
