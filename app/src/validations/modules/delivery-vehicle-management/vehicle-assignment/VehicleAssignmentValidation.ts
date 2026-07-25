import { VehicleAssignmentConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-assignment/VehicleAssignmentConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateVehicleAssignment(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(VehicleAssignmentConfig.fields, values);
}

