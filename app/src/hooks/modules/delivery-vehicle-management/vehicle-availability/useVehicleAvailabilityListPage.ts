"use client";

import { VehicleAvailabilityConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-availability/VehicleAvailabilityConstants";
import { createVehicleAvailabilityRecord, VehicleAvailabilityMockData } from "@/app/src/data/modules/delivery-vehicle-management/vehicle-availability/VehicleAvailabilityData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateVehicleAvailability } from "@/app/src/validations/modules/delivery-vehicle-management/vehicle-availability/VehicleAvailabilityValidation";

export function useVehicleAvailabilityListPage() {
  return useDeliveryVehicleModuleListPage({
    config: VehicleAvailabilityConfig,
    createRecord: createVehicleAvailabilityRecord,
    initialRecords: VehicleAvailabilityMockData,
    validateRecord: validateVehicleAvailability,
  });
}
