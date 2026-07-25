import { DeliveryTripsAndDispatchConfig } from "@/app/src/constants/modules/delivery-vehicle-management/delivery-trips-and-dispatch/DeliveryTripsAndDispatchConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateDeliveryTrip(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(DeliveryTripsAndDispatchConfig.fields, values);
}

