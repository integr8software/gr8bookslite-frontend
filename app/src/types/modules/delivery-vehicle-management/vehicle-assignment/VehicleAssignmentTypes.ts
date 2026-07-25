import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type VehicleAssignmentRecord = DeliveryVehicleModuleRecord;
export type VehicleAssignmentFormValues = {
  loadPlan: string;
  originWarehouse: string;
  schedule: string;
  vehicle: string;
  driver: string;
  crew: string;
  notes: string;
};

