import { TripTrackingConfig } from "@/app/src/constants/modules/delivery-vehicle-management/trip-tracking/TripTrackingConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateTripTrackingEvent(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(TripTrackingConfig.fields, values);
}

