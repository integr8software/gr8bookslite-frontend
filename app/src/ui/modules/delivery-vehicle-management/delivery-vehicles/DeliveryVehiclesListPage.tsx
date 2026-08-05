"use client";

import { DeliveryVehiclesTablePaginationStorageKey } from "@/app/src/constants/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesConstants";
import { useDeliveryVehiclesListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/delivery-vehicles/useDeliveryVehiclesListPage";
import { DeliveryVehicleModuleListView } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleListPage";

export function DeliveryVehiclesListPage() {
  const page = useDeliveryVehiclesListPage();

  return <DeliveryVehicleModuleListView page={page} paginationKey={DeliveryVehiclesTablePaginationStorageKey} />;
}
