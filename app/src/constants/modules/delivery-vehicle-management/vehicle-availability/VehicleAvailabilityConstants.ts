import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const VehicleAvailabilityHref = MODULE_ROUTE_MAP.DVA;
export const VehicleAvailabilityTablePaginationStorageKey =
  "delivery-vehicle-management:vehicle-availability";

export const VehicleAvailabilityConfig: DeliveryVehicleModuleConfig = {
  key: "vehicle-availability",
  code: "DVA",
  title: "Vehicle Availability",
  description: "See which vehicles can be assigned for the selected operating window.",
  primaryAction: "Add Manual Block",
  noun: "availability block",
  searchPlaceholder: "Search vehicle, location, or reason",
  statuses: ["Available", "Reserved", "Assigned", "Loading", "On Trip", "Under Inspection", "Under Maintenance", "Out of Service", "Inactive"],
  fields: [
    { key: "vehicle", label: "Vehicle", required: true },
    { key: "vehicleType", label: "Vehicle type", required: true },
    { key: "baseWarehouse", label: "Base warehouse", required: true, type: "select", options: ["Pasig Distribution Hub", "Makati Fulfillment Center", "Cebu Central Warehouse"] },
    { key: "availableFrom", label: "Available from", required: true, type: "datetime-local" },
    { key: "reason", label: "Availability reason", required: true, type: "textarea" },
  ],
  tableFieldKeys: ["vehicleType", "baseWarehouse", "availableFrom", "reason"],
  insightLabel: "Restricted",
  insightStatuses: ["Under Maintenance", "Out of Service", "Inactive", "Under Inspection"],
  operationalNote: "Higher-priority restrictions cannot be cleared by a manual availability update.",
};
