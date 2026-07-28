"use client";

import {
	TripMonitoringHref,
	TripMonitoringTablePaginationStorageKey,
} from "@/app/src/constants/modules/delivery-vehicle-management/trip-monitoring/TripMonitoringConstants";
import { useTripMonitoringListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/trip-monitoring/useTripMonitoringListPage";
import { DeliveryVehicleModuleListPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleListPage";

export function TripMonitoringListPage() {
	const page = useTripMonitoringListPage();

	return (
		<DeliveryVehicleModuleListPage
			href={TripMonitoringHref}
			page={page}
			paginationStorageKey={TripMonitoringTablePaginationStorageKey}
		/>
	);
}
