"use client";

import {
	VehicleSchedulingAssignmentHref,
	VehicleSchedulingAssignmentTablePaginationStorageKey,
} from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-scheduling-assignment/VehicleSchedulingAssignmentConstants";
import { useVehicleSchedulingAssignmentListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/vehicle-scheduling-assignment/useVehicleSchedulingAssignmentListPage";
import { DeliveryVehicleModuleListPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleListPage";

export function VehicleSchedulingAssignmentListPage() {
	const page = useVehicleSchedulingAssignmentListPage();

	return (
		<DeliveryVehicleModuleListPage
			href={VehicleSchedulingAssignmentHref}
			page={page}
			paginationStorageKey={VehicleSchedulingAssignmentTablePaginationStorageKey}
		/>
	);
}
