import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type VehicleRepairMaintenanceRecord = DeliveryVehicleModuleRecord;
export type VehicleRepairMaintenanceFormValues = {
  vehicle: string;
  maintenanceType: string;
  priority: string;
  schedule: string;
  serviceProvider: string;
  description: string;
  estimatedCost: string;
};
