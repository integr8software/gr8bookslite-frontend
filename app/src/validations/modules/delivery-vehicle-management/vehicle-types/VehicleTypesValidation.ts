import { VehicleTypesConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-types/VehicleTypesConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateVehicleType(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(VehicleTypesConfig.fields, values);
}

