import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const VehicleAssignmentHref = MODULE_ROUTE_MAP.DVAS;
export const VehicleAssignmentTablePaginationStorageKey =
  "delivery-vehicle-management:vehicle-assignment";

export const VehicleAssignmentConfig: DeliveryVehicleModuleConfig = {
  key: "vehicle-assignment",
  code: "DVAS",
  title: "Vehicle Assignment",
  description: "Match compliant vehicles and eligible delivery teams to planned loads.",
  primaryAction: "New Assignment",
  noun: "assignment",
  searchPlaceholder: "Search assignment, load, vehicle, or driver",
  statuses: ["Draft", "Reserved", "Confirmed", "Released", "Cancelled"],
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
  operationalNote: "Overlapping vehicle and driver schedules are blocked before confirmation.",
};
