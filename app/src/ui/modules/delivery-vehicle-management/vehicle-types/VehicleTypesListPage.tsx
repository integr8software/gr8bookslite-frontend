"use client";

import {
	VehicleTypesHref,
	VehicleTypesTablePaginationStorageKey,
} from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-types/VehicleTypesConstants";
import { useVehicleTypesListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/vehicle-types/useVehicleTypesListPage";
import { DeliveryVehicleModuleListPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleListPage";

export function VehicleTypesListPage() {
	const page = useVehicleTypesListPage();

	return (
		<DeliveryVehicleModuleListPage
			href={VehicleTypesHref}
			page={page}
			paginationStorageKey={VehicleTypesTablePaginationStorageKey}
		/>
	);
}
