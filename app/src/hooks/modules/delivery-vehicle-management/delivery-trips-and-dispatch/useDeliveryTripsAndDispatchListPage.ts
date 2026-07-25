"use client";

import { DeliveryTripsAndDispatchConfig } from "@/app/src/constants/modules/delivery-vehicle-management/delivery-trips-and-dispatch/DeliveryTripsAndDispatchConstants";
import { createDeliveryTripRecord, DeliveryTripsAndDispatchMockData } from "@/app/src/data/modules/delivery-vehicle-management/delivery-trips-and-dispatch/DeliveryTripsAndDispatchData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateDeliveryTrip } from "@/app/src/validations/modules/delivery-vehicle-management/delivery-trips-and-dispatch/DeliveryTripsAndDispatchValidation";

export function useDeliveryTripsAndDispatchListPage() {
  return useDeliveryVehicleModuleListPage({
    config: DeliveryTripsAndDispatchConfig,
    createRecord: createDeliveryTripRecord,
    initialRecords: DeliveryTripsAndDispatchMockData,
    validateRecord: validateDeliveryTrip,
  });
}
