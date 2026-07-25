"use client";

import { VehicleAssignmentConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-assignment/VehicleAssignmentConstants";
import { createVehicleAssignmentRecord, VehicleAssignmentMockData } from "@/app/src/data/modules/delivery-vehicle-management/vehicle-assignment/VehicleAssignmentData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateVehicleAssignment } from "@/app/src/validations/modules/delivery-vehicle-management/vehicle-assignment/VehicleAssignmentValidation";

export function useVehicleAssignmentListPage() {
  return useDeliveryVehicleModuleListPage({
    config: VehicleAssignmentConfig,
    createRecord: createVehicleAssignmentRecord,
    initialRecords: VehicleAssignmentMockData,
    validateRecord: validateVehicleAssignment,
  });
}
