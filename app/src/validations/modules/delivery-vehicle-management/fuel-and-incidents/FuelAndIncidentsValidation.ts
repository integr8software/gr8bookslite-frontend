import { FuelAndIncidentsConfig } from "@/app/src/constants/modules/delivery-vehicle-management/fuel-and-incidents/FuelAndIncidentsConstants";
import { validateDeliveryVehicleModuleRecord } from "@/app/src/validations/modules/delivery-vehicle-management/DeliveryVehicleModuleValidation";

export function validateFuelAndIncident(values: Record<string, string>) {
  return validateDeliveryVehicleModuleRecord(FuelAndIncidentsConfig.fields, values);
}

