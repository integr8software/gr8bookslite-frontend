import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type LoadPlanRecord = DeliveryVehicleModuleRecord;
export type LoadPlanFormValues = {
  originWarehouse: string;
  routeZone: string;
  schedule: string;
  requiredType: string;
  demand: string;
  weight: string;
  volume: string;
  readiness: string;
  remarks: string;
};

