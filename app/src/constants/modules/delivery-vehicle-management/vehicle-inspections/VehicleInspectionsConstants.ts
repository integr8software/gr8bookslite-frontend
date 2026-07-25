import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const VehicleInspectionsHref = MODULE_ROUTE_MAP.DVIN;
export const VehicleInspectionsTablePaginationStorageKey =
  "delivery-vehicle-management:vehicle-inspections";

export const VehicleInspectionsConfig: DeliveryVehicleModuleConfig = {
  key: "vehicle-inspections",
  code: "DVIN",
  title: "Vehicle Inspections",
  description: "Record safety checks, findings, and release readiness for fleet units.",
  primaryAction: "New Inspection",
  noun: "inspection",
  searchPlaceholder: "Search inspection, vehicle, type, or inspector",
  statuses: ["Passed", "Passed with Observation", "Failed"],
  fields: [
    { key: "vehicle", label: "Vehicle", required: true, type: "select", options: ["FLEET-014 · Isuzu N-Series", "FLEET-021 · Toyota HiAce", "FLEET-032 · Hino 500"] },
    { key: "inspectionType", label: "Inspection type", required: true, type: "select", options: ["Pre-trip", "Post-trip", "Periodic", "Maintenance release", "Incident follow-up"] },
    { key: "inspector", label: "Inspector", required: true },
    { key: "inspectionDate", label: "Inspection date", required: true, type: "datetime-local" },
    { key: "checklist", label: "Checklist summary", required: true, type: "textarea" },
    { key: "findings", label: "Findings and corrective action", type: "textarea" },
  ],
  tableFieldKeys: ["vehicle", "inspectionType", "inspector", "inspectionDate"],
  insightLabel: "Blocking findings",
  insightStatuses: ["Failed"],
  operationalNote: "A failed safety-critical item blocks dispatch until resolved and released.",
};
