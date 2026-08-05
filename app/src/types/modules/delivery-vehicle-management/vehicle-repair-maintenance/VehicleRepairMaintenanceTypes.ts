import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type VehicleRepairMaintenanceRecord = DeliveryVehicleModuleRecord;
export type VehicleRepairMaintenanceFormValues = {
  workOrderNo: string;
  workOrderDate: string;
  vehicle: string;
  maintenanceType: string;
  priority: string;
  serviceProvider: string;
  description: string;
  estimatedCost: string;
  schedule: string;
};
