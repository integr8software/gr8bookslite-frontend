"use client";

import { VehicleSchedulingAssignmentConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-scheduling-assignment/VehicleSchedulingAssignmentConstants";
import { createVehicleSchedulingAssignmentRecord, VehicleSchedulingAssignmentMockData } from "@/app/src/data/modules/delivery-vehicle-management/vehicle-scheduling-assignment/VehicleSchedulingAssignmentData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateVehicleSchedulingAssignment } from "@/app/src/validations/modules/delivery-vehicle-management/vehicle-scheduling-assignment/VehicleSchedulingAssignmentValidation";

export function useVehicleSchedulingAssignmentListPage() {
  return useDeliveryVehicleModuleListPage({
    config: VehicleSchedulingAssignmentConfig,
    createRecord: createVehicleSchedulingAssignmentRecord,
    initialRecords: VehicleSchedulingAssignmentMockData,
    validateRecord: validateVehicleSchedulingAssignment,
  });
}
