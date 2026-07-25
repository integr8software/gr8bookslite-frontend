import { MaintenanceAndRepairsConfig } from "@/app/src/constants/modules/delivery-vehicle-management/maintenance-and-repairs/MaintenanceAndRepairsConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateMaintenanceWorkOrder(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(MaintenanceAndRepairsConfig.fields, values);
}

