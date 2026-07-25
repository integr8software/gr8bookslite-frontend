import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const LoadPlanningHref = MODULE_ROUTE_MAP.DVLP;
export const LoadPlanningTablePaginationStorageKey =
  "delivery-vehicle-management:load-planning";

export const LoadPlanningConfig: DeliveryVehicleModuleConfig = {
  key: "load-planning",
  code: "DVLP",
  title: "Load Planning",
  description: "Group warehouse-ready demand into compatible, capacity-safe delivery loads.",
  primaryAction: "Create Load Plan",
  noun: "load plan",
  searchPlaceholder: "Search plan, route, warehouse, or destination",
  statuses: ["Draft", "Planned", "Ready for Assignment", "Assigned", "Cancelled"],
  fields: [
    { key: "originWarehouse", label: "Origin warehouse", required: true, type: "select", options: ["Pasig Distribution Hub", "Makati Fulfillment Center", "Cebu Central Warehouse"] },
    { key: "routeZone", label: "Route or service area", required: true },
    { key: "schedule", label: "Proposed schedule", required: true, type: "datetime-local" },
    { key: "requiredType", label: "Required vehicle type", required: true, type: "select", options: ["Light Truck", "Refrigerated Van", "Delivery Van", "Motorcycle"] },
    { key: "demand", label: "Source demand", required: true },
    { key: "weight", label: "Planned weight (kg)", required: true, type: "number" },
    { key: "volume", label: "Planned volume (m³)", required: true, type: "number" },
    { key: "readiness", label: "Warehouse readiness", type: "select", options: ["Ready", "Picking", "Expected"] },
    { key: "remarks", label: "Planner remarks", type: "textarea" },
  ],
  tableFieldKeys: ["originWarehouse", "routeZone", "schedule", "readiness"],
  insightLabel: "Ready to assign",
  insightStatuses: ["Ready for Assignment"],
  operationalNote: "Planning reserves transport capacity only; warehouse posting remains authoritative.",
};
