import { DeliveryVehiclesConfig } from "@/app/src/constants/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateDeliveryVehicle(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(DeliveryVehiclesConfig.fields, values);
}

