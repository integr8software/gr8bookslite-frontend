import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const DeliveryVehiclesHref = MODULE_ROUTE_MAP.DVE;
export const DeliveryVehiclesTablePaginationStorageKey =
  "delivery-vehicle-management:delivery-vehicles";

export const DeliveryVehiclesConfig: DeliveryVehicleModuleConfig = {
  key: "delivery-vehicles",
  code: "DVE",
  title: "Delivery Vehicles",
  description: "Manage fleet identity, compliance, capacity, and home-base information.",
  primaryAction: "Add Vehicle",
  noun: "vehicle",
  searchPlaceholder: "Search fleet no., plate, make, or model",
  statuses: ["Active", "Inactive", "Retired"],
  categories: ["Vehicles", "Capacity & Specifications", "Ownership & Assignment", "Registration Details", "Status"],
  fields: [
    { key: "plateNumber", label: "Plate number", required: true },
    { key: "vehicleType", label: "Vehicle type", required: true, type: "select", options: ["Light Truck", "Refrigerated Van", "Delivery Van", "Motorcycle"] },
    { key: "makeModel", label: "Make and model", required: true },
    { key: "baseWarehouse", label: "Base warehouse", required: true, type: "select", options: ["Pasig Distribution Hub", "Makati Fulfillment Center", "Cebu Central Warehouse"] },
    { key: "registrationExpiry", label: "Registration expiry", required: true, type: "date" },
    { key: "insuranceExpiry", label: "Insurance expiry", required: true, type: "date" },
    { key: "odometer", label: "Current odometer (km)", required: true, type: "number" },
    { key: "ownership", label: "Ownership", type: "select", options: ["Company owned", "Leased", "Third party"] },
  ],
  tableFieldKeys: ["plateNumber", "vehicleType", "baseWarehouse", "registrationExpiry"],
  insightLabel: "Compliance alerts",
  insightStatuses: ["Inactive", "Retired"],
  operationalNote: "Vehicle records keep capacity, ownership, registration, and status together; type defaults are maintained under Vehicle Types.",
};
