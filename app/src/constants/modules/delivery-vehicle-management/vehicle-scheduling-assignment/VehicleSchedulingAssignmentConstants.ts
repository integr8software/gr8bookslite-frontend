import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const VehicleSchedulingAssignmentHref = MODULE_ROUTE_MAP.DVAS;
export const VehicleSchedulingAssignmentTablePaginationStorageKey =
  "delivery-vehicle-management:vehicle-scheduling-assignment";

export const VehicleSchedulingAssignmentConfig: DeliveryVehicleModuleConfig = {
  key: "vehicle-scheduling-assignment",
  code: "DVAS",
  title: "Vehicle Scheduling & Assignment",
  description: "Match compliant vehicles and eligible delivery teams to planned loads.",
  primaryAction: "New Assignment",
  noun: "assignment",
  searchPlaceholder: "Search assignment, load, vehicle, or driver",
  statuses: ["Draft", "Reserved", "Confirmed", "Released", "Cancelled"],
  categories: ["Availability Calendar", "Vehicle Assignments", "Driver Assignments", "Reservation History", "Conflict Warnings"],
  fields: [
    { key: "loadPlan", label: "Load plan", required: true },
    { key: "originWarehouse", label: "Origin warehouse", required: true, type: "select", options: ["Pasig Distribution Hub", "Makati Fulfillment Center", "Cebu Central Warehouse"] },
    { key: "schedule", label: "Schedule start", required: true, type: "datetime-local" },
    { key: "vehicle", label: "Vehicle", required: true, type: "select", options: ["FLEET-014 · Isuzu N-Series", "FLEET-021 · Toyota HiAce", "FLEET-032 · Hino 500"] },
    { key: "driver", label: "Driver", required: true, type: "select", options: ["Marco Reyes", "Liza Santos", "Joel Mendoza", "Carlo Dizon"] },
    { key: "crew", label: "Helpers or crew" },
    { key: "notes", label: "Dispatch notes", type: "textarea" },
  ],
  tableFieldKeys: ["loadPlan", "vehicle", "driver", "schedule"],
  insightLabel: "Confirmed",
  insightStatuses: ["Confirmed", "Released"],
  operationalNote: "Availability is checked against assignments, trips, inspections, and maintenance before confirmation.",
};
