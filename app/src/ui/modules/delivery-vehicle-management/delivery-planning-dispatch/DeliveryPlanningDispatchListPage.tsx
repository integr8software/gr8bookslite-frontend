"use client";

import {
	DeliveryPlanningDispatchHref,
	DeliveryPlanningDispatchTablePaginationStorageKey,
} from "@/app/src/constants/modules/delivery-vehicle-management/delivery-planning-dispatch/DeliveryPlanningDispatchConstants";
import { useDeliveryPlanningDispatchListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/delivery-planning-dispatch/useDeliveryPlanningDispatchListPage";
import { DeliveryVehicleModuleListPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleListPage";

export function DeliveryPlanningDispatchListPage() {
	const page = useDeliveryPlanningDispatchListPage();

	return (
		<DeliveryVehicleModuleListPage
			href={DeliveryPlanningDispatchHref}
			page={page}
			paginationStorageKey={DeliveryPlanningDispatchTablePaginationStorageKey}
		/>
	);
}
