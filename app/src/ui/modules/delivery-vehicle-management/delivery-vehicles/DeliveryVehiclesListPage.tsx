"use client";

import {
	DeliveryVehiclesHref,
	DeliveryVehiclesTablePaginationStorageKey,
} from "@/app/src/constants/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesConstants";
import { useDeliveryVehiclesListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/delivery-vehicles/useDeliveryVehiclesListPage";
import { DeliveryVehicleModuleListPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleListPage";

export function DeliveryVehiclesListPage() {
	const page = useDeliveryVehiclesListPage();

	return (
		<DeliveryVehicleModuleListPage
			href={DeliveryVehiclesHref}
			page={page}
			paginationStorageKey={DeliveryVehiclesTablePaginationStorageKey}
		/>
	);
}
