import { TripMonitoringConfig } from "@/app/src/constants/modules/delivery-vehicle-management/trip-monitoring/TripMonitoringConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateTripMonitoringEvent(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(TripMonitoringConfig.fields, values);
}

