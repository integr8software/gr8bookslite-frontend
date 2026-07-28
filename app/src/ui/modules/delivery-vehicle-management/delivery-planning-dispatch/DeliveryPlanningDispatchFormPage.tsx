"use client";

import {
	DeliveryPlanningDispatchConfig,
	DeliveryPlanningDispatchHref,
} from "@/app/src/constants/modules/delivery-vehicle-management/delivery-planning-dispatch/DeliveryPlanningDispatchConstants";
import { DeliveryPlanningDispatchMockData } from "@/app/src/data/modules/delivery-vehicle-management/delivery-planning-dispatch/DeliveryPlanningDispatchData";
import { validateDeliveryTrip } from "@/app/src/validations/modules/delivery-vehicle-management/delivery-planning-dispatch/DeliveryPlanningDispatchValidation";
import { DeliveryVehicleModuleFormPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleFormPage";

export function DeliveryPlanningDispatchFormPage() {
	return (
		<DeliveryVehicleModuleFormPage
			config={DeliveryPlanningDispatchConfig}
			href={DeliveryPlanningDispatchHref}
			initialRecords={DeliveryPlanningDispatchMockData}
			validateRecord={validateDeliveryTrip}
		/>
	);
}
