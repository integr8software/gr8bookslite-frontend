import { VehicleAvailabilityConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-availability/VehicleAvailabilityConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateVehicleAvailability(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(VehicleAvailabilityConfig.fields, values);
}

