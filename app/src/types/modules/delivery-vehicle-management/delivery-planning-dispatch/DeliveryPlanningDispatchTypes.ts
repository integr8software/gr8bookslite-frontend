import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type DeliveryTripRecord = DeliveryVehicleModuleRecord;
export type DeliveryTripFormValues = {
  originWarehouse: string;
  loadPlan: string;
  vehicle: string;
  driver: string;
  route: string;
  plannedDeparture: string;
  stops: string;
  odometer: string;
};

