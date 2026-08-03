"use client";

import { VehicleTypesConfig, VehicleTypesTablePaginationStorageKey } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-types/VehicleTypesConstants";
import { createVehicleTypeRecord, VehicleTypesMockData } from "@/app/src/data/modules/delivery-vehicle-management/vehicle-types/VehicleTypesData";
import { validateVehicleType } from "@/app/src/validations/modules/delivery-vehicle-management/vehicle-types/VehicleTypesValidation";
import { DeliveryVehicleModuleListPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleListPage";

export function VehicleTypesListPage() {
  return <DeliveryVehicleModuleListPage pageConfig={VehicleTypesConfig} paginationKey={VehicleTypesTablePaginationStorageKey} createRecord={createVehicleTypeRecord} initialRecords={VehicleTypesMockData} validateRecord={validateVehicleType} />;
}
