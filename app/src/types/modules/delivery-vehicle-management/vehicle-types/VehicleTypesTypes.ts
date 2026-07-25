import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type VehicleTypeRecord = DeliveryVehicleModuleRecord;
export type VehicleTypeFormValues = {
  typeName: string;
  bodyType: string;
  maxPayload: string;
  cargoVolume: string;
  palletCapacity: string;
  handling: string;
  description: string;
};

