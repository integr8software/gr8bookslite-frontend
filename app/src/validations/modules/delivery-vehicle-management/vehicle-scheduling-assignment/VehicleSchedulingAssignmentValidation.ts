import { VehicleSchedulingAssignmentConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-scheduling-assignment/VehicleSchedulingAssignmentConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateVehicleSchedulingAssignment(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(VehicleSchedulingAssignmentConfig.fields, values);
}

