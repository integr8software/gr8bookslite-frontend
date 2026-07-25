import type { DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export type TripTrackingEventRecord = DeliveryVehicleModuleRecord;
export type TripTrackingEventFormValues = {
  trip: string;
  stop: string;
  eventTime: string;
  location: string;
  source: string;
  odometer: string;
  notes: string;
};

