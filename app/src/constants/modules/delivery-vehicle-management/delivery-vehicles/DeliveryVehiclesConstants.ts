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
  searchPlaceholder: "Search fleet no., plate, make, model, or status",
  statuses: ["Active", "Inactive"],
  fieldTabs: [
    {
      label: "Vehicles",
      fieldKeys: ["plateNumber", "vehicleType", "makeModel", "baseWarehouse", "deliveryStatus"],
    },
    {
      label: "Capacity & Specifications",
      fieldKeys: ["cargoCapacity", "capacityUnit", "odometer"],
    },
    {
      label: "Ownership & Assignment",
      fieldKeys: ["ownership"],
    },
    {
      label: "Registration Details",
      fieldKeys: ["registrationExpiry", "insuranceExpiry"],
    },
  ],
  fields: [
    { key: "plateNumber", label: "Plate number", required: true },
    {
      key: "vehicleType",
      label: "Vehicle type",
      required: true,
      type: "select",
      options: ["Light Truck", "Refrigerated Van", "Delivery Van", "Motorcycle", "Heavy Truck"],
    },
    { key: "makeModel", label: "Make and model", required: true },
    {
      key: "baseWarehouse",
      label: "Base warehouse",
      required: true,
      type: "select",
      options: ["Pasig Distribution Hub", "Makati Fulfillment Center", "Cebu Central Warehouse"],
    },
    {
      key: "deliveryStatus",
      label: "Delivery status",
      required: true,
      type: "select",
      options: [
        "Pending",
        "Schedule",
        "For Dispatch",
        "In Transit",
        "Delivered",
        "Cancelled",
        "Returned",
        "On Hold",
      ],
      defaultValue: "Pending",
    },
    { key: "registrationExpiry", label: "Registration expiry", required: true, type: "date" },
    { key: "insuranceExpiry", label: "Insurance expiry", required: true, type: "date" },
    { key: "odometer", label: "Current odometer (km)", required: true, type: "number" },
    {
      key: "ownership",
      label: "Ownership",
      type: "select",
      options: ["Company owned", "Leased", "Third party"],
    },
    {
      key: "cargoCapacity",
      label: "Cargo capacity",
      required: true,
      type: "number",
      defaultValue: "18",
    },
    {
      key: "capacityUnit",
      label: "Capacity unit",
      required: true,
      type: "select",
      options: ["CBM (m³)"],
      defaultValue: "CBM (m³)",
    },
  ],
  tableFieldKeys: [
    "plateNumber",
    "vehicleType",
    "deliveryStatus",
    "cargoCapacity",
    "capacityUnit",
    "baseWarehouse",
    "registrationExpiry",
  ],
  insightLabel: "Compliance alerts",
  insightStatuses: ["Inactive"],
  operationalNote:
    "Vehicle records keep capacity, ownership, registration, and status together; type defaults are maintained under Vehicle Types.",
};
