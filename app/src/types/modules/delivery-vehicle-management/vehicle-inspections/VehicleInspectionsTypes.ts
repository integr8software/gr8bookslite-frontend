import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type VehicleInspectionRecord = DeliveryVehicleModuleRecord;
export type VehicleInspectionFormValues = {
  vehicle: string;
  inspectionType: string;
  inspector: string;
  inspectionDate: string;
  checklist: string;
  findings: string;
};

