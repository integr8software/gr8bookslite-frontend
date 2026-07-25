"use client";

import { TripTrackingConfig } from "@/app/src/constants/modules/delivery-vehicle-management/trip-tracking/TripTrackingConstants";
import { createTripTrackingEventRecord, TripTrackingMockData } from "@/app/src/data/modules/delivery-vehicle-management/trip-tracking/TripTrackingData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateTripTrackingEvent } from "@/app/src/validations/modules/delivery-vehicle-management/trip-tracking/TripTrackingValidation";

export function useTripTrackingListPage() {
  return useDeliveryVehicleModuleListPage({
    config: TripTrackingConfig,
    createRecord: createTripTrackingEventRecord,
    initialRecords: TripTrackingMockData,
    validateRecord: validateTripTrackingEvent,
  });
}
