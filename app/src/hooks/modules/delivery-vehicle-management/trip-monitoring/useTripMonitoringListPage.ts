"use client";

import { TripMonitoringConfig } from "@/app/src/constants/modules/delivery-vehicle-management/trip-monitoring/TripMonitoringConstants";
import { createTripMonitoringEventRecord, TripMonitoringMockData } from "@/app/src/data/modules/delivery-vehicle-management/trip-monitoring/TripMonitoringData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateTripMonitoringEvent } from "@/app/src/validations/modules/delivery-vehicle-management/trip-monitoring/TripMonitoringValidation";

export function useTripMonitoringListPage() {
  return useDeliveryVehicleModuleListPage({
    config: TripMonitoringConfig,
    createRecord: createTripMonitoringEventRecord,
    initialRecords: TripMonitoringMockData,
    validateRecord: validateTripMonitoringEvent,
  });
}
