import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type MaintenanceWorkOrderRecord = DeliveryVehicleModuleRecord;
export type MaintenanceWorkOrderFormValues = {
  vehicle: string;
  maintenanceType: string;
  priority: string;
  schedule: string;
  serviceProvider: string;
  description: string;
  estimatedCost: string;
};

