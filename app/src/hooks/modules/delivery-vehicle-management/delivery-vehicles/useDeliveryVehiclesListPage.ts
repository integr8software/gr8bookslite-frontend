"use client";

import { DeliveryVehiclesConfig } from "@/app/src/constants/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesConstants";
import {
  createDeliveryVehicleRecord,
  DeliveryVehiclesMockData,
} from "@/app/src/data/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateDeliveryVehicle } from "@/app/src/validations/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesValidation";

export function useDeliveryVehiclesListPage() {
  return useDeliveryVehicleModuleListPage({
    config: DeliveryVehiclesConfig,
    createRecord: createDeliveryVehicleRecord,
    initialRecords: DeliveryVehiclesMockData,
    validateRecord: validateDeliveryVehicle,
  });
}
