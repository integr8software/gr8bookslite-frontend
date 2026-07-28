import { VehicleRepairMaintenanceConfig } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateVehicleRepairMaintenance(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(VehicleRepairMaintenanceConfig.fields, values);
}

