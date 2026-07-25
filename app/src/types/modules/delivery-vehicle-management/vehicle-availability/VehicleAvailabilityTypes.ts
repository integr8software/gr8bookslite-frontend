import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type VehicleAvailabilityRecord = DeliveryVehicleModuleRecord;
export type VehicleAvailabilityFormValues = {
  vehicle: string;
  vehicleType: string;
  baseWarehouse: string;
  availableFrom: string;
  reason: string;
};

