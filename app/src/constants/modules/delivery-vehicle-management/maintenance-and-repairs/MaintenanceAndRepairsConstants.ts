import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const MaintenanceAndRepairsHref = MODULE_ROUTE_MAP.DVMR;
export const MaintenanceAndRepairsTablePaginationStorageKey =
  "delivery-vehicle-management:maintenance-and-repairs";

export const MaintenanceAndRepairsConfig: DeliveryVehicleModuleConfig = {
  key: "maintenance-and-repairs",
  code: "DVMR",
  title: "Maintenance & Repairs",
  description: "Plan preventive service and control corrective work through release.",
  primaryAction: "Create Work Order",
  noun: "work order",
  searchPlaceholder: "Search work order, vehicle, type, or provider",
  statuses: ["Draft", "Scheduled", "In Progress", "Waiting for Parts", "Completed", "Released", "Cancelled"],
  fields: [
    { key: "vehicle", label: "Vehicle", required: true, type: "select", options: ["FLEET-014 · Isuzu N-Series", "FLEET-021 · Toyota HiAce", "FLEET-032 · Hino 500"] },
    { key: "maintenanceType", label: "Maintenance type", required: true, type: "select", options: ["Preventive", "Corrective", "Emergency", "Inspection Repair", "Tire", "Registration/Compliance"] },
    { key: "priority", label: "Priority", required: true, type: "select", options: ["Low", "Normal", "High", "Critical"] },
    { key: "schedule", label: "Scheduled start", required: true, type: "datetime-local" },
    { key: "serviceProvider", label: "Service provider" },
    { key: "description", label: "Description and diagnosis", required: true, type: "textarea" },
    { key: "estimatedCost", label: "Estimated cost (PHP)", type: "number" },
  ],
  tableFieldKeys: ["vehicle", "maintenanceType", "priority", "schedule"],
  insightLabel: "Vehicle blocking",
  insightStatuses: ["In Progress", "Waiting for Parts"],
  operationalNote: "Completed work still requires release approval before the vehicle is dispatchable.",
};
