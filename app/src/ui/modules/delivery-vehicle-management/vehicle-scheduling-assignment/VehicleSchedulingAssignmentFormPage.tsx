"use client";

import {
	VehicleSchedulingAssignmentConfig,
	VehicleSchedulingAssignmentHref,
} from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-scheduling-assignment/VehicleSchedulingAssignmentConstants";
import { VehicleSchedulingAssignmentMockData } from "@/app/src/data/modules/delivery-vehicle-management/vehicle-scheduling-assignment/VehicleSchedulingAssignmentData";
import { validateVehicleSchedulingAssignment } from "@/app/src/validations/modules/delivery-vehicle-management/vehicle-scheduling-assignment/VehicleSchedulingAssignmentValidation";
import { DeliveryVehicleModuleFormPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleFormPage";

export function VehicleSchedulingAssignmentFormPage() {
	return (
		<DeliveryVehicleModuleFormPage
			config={VehicleSchedulingAssignmentConfig}
			href={VehicleSchedulingAssignmentHref}
			initialRecords={VehicleSchedulingAssignmentMockData}
			validateRecord={validateVehicleSchedulingAssignment}
		/>
	);
}
