import { VehicleInspectionsConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-inspections/VehicleInspectionsConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateVehicleInspection(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(VehicleInspectionsConfig.fields, values);
}

