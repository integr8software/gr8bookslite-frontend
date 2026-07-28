"use client";

import {
	TripMonitoringConfig,
	TripMonitoringHref,
} from "@/app/src/constants/modules/delivery-vehicle-management/trip-monitoring/TripMonitoringConstants";
import { TripMonitoringMockData } from "@/app/src/data/modules/delivery-vehicle-management/trip-monitoring/TripMonitoringData";
import { validateTripMonitoringEvent } from "@/app/src/validations/modules/delivery-vehicle-management/trip-monitoring/TripMonitoringValidation";
import { DeliveryVehicleModuleFormPage } from "@/app/src/ui/modules/delivery-vehicle-management/DeliveryVehicleModuleFormPage";

export function TripMonitoringFormPage() {
	return (
		<DeliveryVehicleModuleFormPage
			config={TripMonitoringConfig}
			href={TripMonitoringHref}
			initialRecords={TripMonitoringMockData}
			validateRecord={validateTripMonitoringEvent}
		/>
	);
}
