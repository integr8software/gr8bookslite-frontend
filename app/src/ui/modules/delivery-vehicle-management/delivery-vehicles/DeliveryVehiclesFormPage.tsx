"use client";

import {
	DeliveryVehiclesConfig,
	DeliveryVehiclesHref,
} from "@/app/src/constants/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesConstants";
import { DeliveryVehiclesMockData } from "@/app/src/data/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesData";
import { validateDeliveryVehicle } from "@/app/src/validations/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesValidation";
import { DeliveryVehicleModuleFormPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleFormPage";

export function DeliveryVehiclesFormPage() {
	return (
		<DeliveryVehicleModuleFormPage
			config={DeliveryVehiclesConfig}
			href={DeliveryVehiclesHref}
			initialRecords={DeliveryVehiclesMockData}
			validateRecord={validateDeliveryVehicle}
		/>
	);
}
