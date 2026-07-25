import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type FuelAndIncidentRecord = DeliveryVehicleModuleRecord;
export type FuelAndIncidentWorkspace = "Fuel" | "Incidents";
export type FuelAndIncidentFormValues = {
  vehicle: string;
  trip: string;
  dateTime: string;
  location: string;
  odometer: string;
  details: string;
  reference: string;
};

