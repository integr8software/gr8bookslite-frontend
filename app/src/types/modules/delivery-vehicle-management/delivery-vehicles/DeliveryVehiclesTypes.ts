import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type DeliveryVehicleRecord = DeliveryVehicleModuleRecord;
export type DeliveryVehicleFormValues = {
  plateNumber: string;
  vehicleType: string;
  makeModel: string;
  baseWarehouse: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  odometer: string;
  ownership: string;
};

