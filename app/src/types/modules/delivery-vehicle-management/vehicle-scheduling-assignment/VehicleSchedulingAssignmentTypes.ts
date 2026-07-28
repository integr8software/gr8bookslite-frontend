import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type VehicleSchedulingAssignmentRecord = DeliveryVehicleModuleRecord;
export type VehicleSchedulingAssignmentFormValues = {
  loadPlan: string;
  originWarehouse: string;
  schedule: string;
  vehicle: string;
  driver: string;
  crew: string;
  notes: string;
};

