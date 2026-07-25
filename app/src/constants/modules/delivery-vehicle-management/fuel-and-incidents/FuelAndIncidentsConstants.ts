import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const FuelAndIncidentsHref = MODULE_ROUTE_MAP.DVFI;
export const FuelAndIncidentsTablePaginationStorageKey =
  "delivery-vehicle-management:fuel-and-incidents";

export const FuelAndIncidentsConfig: DeliveryVehicleModuleConfig = {
  key: "fuel-and-incidents",
  code: "DVFI",
  title: "Fuel & Incidents",
  description: "Monitor fuel usage and manage vehicle, cargo, and delivery incidents.",
  primaryAction: "Add Record",
  noun: "record",
  searchPlaceholder: "Search transaction, incident, vehicle, or trip",
  statuses: ["Recorded", "Flagged", "Reported", "Under Review", "Action Required", "Resolved", "Closed"],
  categories: ["Fuel", "Incidents"],
  fields: [
    { key: "vehicle", label: "Vehicle", required: true, type: "select", options: ["FLEET-014 · Isuzu N-Series", "FLEET-021 · Toyota HiAce", "FLEET-032 · Hino 500"] },
    { key: "trip", label: "Related trip" },
    { key: "dateTime", label: "Date and time", required: true, type: "datetime-local" },
    { key: "location", label: "Location or station", required: true },
    { key: "odometer", label: "Odometer (km)", required: true, type: "number" },
    { key: "details", label: "Fuel / incident details", required: true, type: "textarea" },
    { key: "reference", label: "Receipt or authority reference" },
  ],
  tableFieldKeys: ["vehicle", "trip", "dateTime", "details"],
  insightLabel: "Flagged or open",
  insightStatuses: ["Flagged", "Reported", "Under Review", "Action Required"],
  operationalNote: "Serious incidents can take a vehicle out of service; closure does not restore availability.",
};
