import { LoadPlanningConfig } from "@/app/src/constants/modules/delivery-vehicle-management/load-planning/LoadPlanningConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateLoadPlan(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(LoadPlanningConfig.fields, values);
}

