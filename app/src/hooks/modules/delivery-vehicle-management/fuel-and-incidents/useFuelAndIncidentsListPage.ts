"use client";

import { FuelAndIncidentsConfig } from "@/app/src/constants/modules/delivery-vehicle-management/fuel-and-incidents/FuelAndIncidentsConstants";
import { createFuelAndIncidentRecord, FuelAndIncidentsMockData } from "@/app/src/data/modules/delivery-vehicle-management/fuel-and-incidents/FuelAndIncidentsData";
import { useDeliveryVehicleModuleListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/useDeliveryVehicleModuleListPage";
import { validateFuelAndIncident } from "@/app/src/validations/modules/delivery-vehicle-management/fuel-and-incidents/FuelAndIncidentsValidation";

export function useFuelAndIncidentsListPage() {
  return useDeliveryVehicleModuleListPage({
    config: FuelAndIncidentsConfig,
    createRecord: createFuelAndIncidentRecord,
    initialRecords: FuelAndIncidentsMockData,
    validateRecord: validateFuelAndIncident,
  });
}
