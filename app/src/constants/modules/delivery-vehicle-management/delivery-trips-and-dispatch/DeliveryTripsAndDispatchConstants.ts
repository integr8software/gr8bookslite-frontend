import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const DeliveryTripsAndDispatchHref = MODULE_ROUTE_MAP.DVD;
export const DeliveryTripsAndDispatchTablePaginationStorageKey =
  "delivery-vehicle-management:delivery-trips-and-dispatch";

export const DeliveryTripsAndDispatchConfig: DeliveryVehicleModuleConfig = {
  key: "delivery-trips-and-dispatch",
  code: "DVD",
  title: "Delivery Trips & Dispatch",
  description: "Control loading, dispatch readiness, route execution, and trip completion.",
  primaryAction: "Create Trip",
  noun: "trip",
  searchPlaceholder: "Search trip, vehicle, route, or driver",
  statuses: ["Draft", "Planned", "Assigned", "Loading", "Ready for Dispatch", "Dispatched", "In Transit", "Partially Completed", "Completed", "Returned", "Cancelled"],
  fields: [
    { key: "originWarehouse", label: "Origin warehouse", required: true, type: "select", options: ["Pasig Distribution Hub", "Makati Fulfillment Center", "Cebu Central Warehouse"] },
    { key: "loadPlan", label: "Load plan", required: true },
    { key: "vehicle", label: "Vehicle", required: true, type: "select", options: ["FLEET-014 · Isuzu N-Series", "FLEET-021 · Toyota HiAce", "FLEET-032 · Hino 500"] },
    { key: "driver", label: "Driver", required: true },
    { key: "route", label: "Route", required: true },
    { key: "plannedDeparture", label: "Planned departure", required: true, type: "datetime-local" },
    { key: "stops", label: "Stops and delivery documents", required: true, type: "textarea" },
    { key: "odometer", label: "Starting odometer (km)", type: "number" },
  ],
  tableFieldKeys: ["vehicle", "driver", "route", "plannedDeparture"],
  insightLabel: "On the road",
  insightStatuses: ["Dispatched", "In Transit", "Partially Completed"],
  operationalNote: "Dispatch requires a confirmed assignment, passed inspection, and warehouse-ready load.",
};
