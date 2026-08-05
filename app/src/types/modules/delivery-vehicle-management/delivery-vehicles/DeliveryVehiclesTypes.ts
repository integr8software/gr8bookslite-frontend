import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type DeliveryVehicleRecord = DeliveryVehicleModuleRecord;
export type DeliveryVehicleFormValues = {
  plateNumber: string;
  vehicleType: string;
  baseWarehouse: string;
  deliveryStatus: string;
  ownership: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  description: string;
};
