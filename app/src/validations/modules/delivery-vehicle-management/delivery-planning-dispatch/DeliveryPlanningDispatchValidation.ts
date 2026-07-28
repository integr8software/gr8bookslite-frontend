import { DeliveryPlanningDispatchConfig } from "@/app/src/constants/modules/delivery-vehicle-management/delivery-planning-dispatch/DeliveryPlanningDispatchConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateDeliveryTrip(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(DeliveryPlanningDispatchConfig.fields, values);
}

