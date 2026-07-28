"use client";

import {
	VehicleTypesConfig,
	VehicleTypesHref,
} from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-types/VehicleTypesConstants";
import { VehicleTypesMockData } from "@/app/src/data/modules/delivery-vehicle-management/vehicle-types/VehicleTypesData";
import { validateVehicleType } from "@/app/src/validations/modules/delivery-vehicle-management/vehicle-types/VehicleTypesValidation";
import { DeliveryVehicleModuleFormPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleFormPage";

export function VehicleTypesFormPage() {
	return (
		<DeliveryVehicleModuleFormPage
			config={VehicleTypesConfig}
			href={VehicleTypesHref}
			initialRecords={VehicleTypesMockData}
			validateRecord={validateVehicleType}
		/>
	);
}
