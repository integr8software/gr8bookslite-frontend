"use client";

import { DeliveryPlanningDispatchConfig } from "@/app/src/constants/modules/delivery-vehicle-management/delivery-planning-dispatch/DeliveryPlanningDispatchConstants";
import { createDeliveryTripRecord, DeliveryPlanningDispatchMockData } from "@/app/src/data/modules/delivery-vehicle-management/delivery-planning-dispatch/DeliveryPlanningDispatchData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateDeliveryTrip } from "@/app/src/validations/modules/delivery-vehicle-management/delivery-planning-dispatch/DeliveryPlanningDispatchValidation";

export function useDeliveryPlanningDispatchListPage() {
  return useDeliveryVehicleModuleListPage({
    config: DeliveryPlanningDispatchConfig,
    createRecord: createDeliveryTripRecord,
    initialRecords: DeliveryPlanningDispatchMockData,
    validateRecord: validateDeliveryTrip,
  });
}
