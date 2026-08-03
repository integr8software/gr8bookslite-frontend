"use client";

import { DeliveryVehiclesConfig, DeliveryVehiclesTablePaginationStorageKey } from "@/app/src/constants/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesConstants";
import { createDeliveryVehicleRecord, DeliveryVehiclesMockData } from "@/app/src/data/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesData";
import { validateDeliveryVehicle } from "@/app/src/validations/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesValidation";
import { DeliveryVehicleModuleListPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleListPage";

export function DeliveryVehiclesListPage() {
  return <DeliveryVehicleModuleListPage pageConfig={DeliveryVehiclesConfig} paginationKey={DeliveryVehiclesTablePaginationStorageKey} createRecord={createDeliveryVehicleRecord} initialRecords={DeliveryVehiclesMockData} validateRecord={validateDeliveryVehicle} />;
}
