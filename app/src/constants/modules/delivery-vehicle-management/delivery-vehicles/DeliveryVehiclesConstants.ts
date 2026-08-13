import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const DeliveryVehiclesHref = MODULE_ROUTE_MAP.DVE;
export const DeliveryVehiclesTablePaginationStorageKey = "delivery-vehicle-management:delivery-vehicles";

export const DeliveryVehicleStatuses = {
  active: "Active",
  inactive: "Inactive",
} as const;

export const DeliveryVehicleStatusOptions = [DeliveryVehicleStatuses.active, DeliveryVehicleStatuses.inactive] as const;

export const DeliveryVehicleStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: DeliveryVehicleStatuses.active, value: DeliveryVehicleStatuses.active },
  { label: DeliveryVehicleStatuses.inactive, value: DeliveryVehicleStatuses.inactive },
] as const;

export const DeliveryVehicleStatusFilters = ["all", DeliveryVehicleStatuses.active, DeliveryVehicleStatuses.inactive] as const;

export const DeliveryVehicleDefaultStatus = DeliveryVehicleStatuses.active;
export const DeliveryVehicleTypeOptions = ["Light Truck", "Refrigerated Van", "Delivery Van", "Motorcycle", "Heavy Truck"] as const;
export const DeliveryVehicleBaseWarehouseOptions = [
  "Pasig Distribution Hub",
  "Makati Fulfillment Center",
  "Cebu Central Warehouse",
] as const;
export const DeliveryVehicleDeliveryStatusOptions = [
  "Pending",
  "Scheduled",
  "For Dispatch",
  "In Transit",
  "Delivered",
  "Cancelled",
  "Returned",
  "On Hold",
] as const;
export const DeliveryVehicleDispatchQueueStatuses = ["Pending", "Scheduled", "For Dispatch"] as const;
export const DeliveryVehicleOwnershipOptions = ["Company Owned", "Leased", "Third Party"] as const;

export const DeliveryVehiclesConfig: DeliveryVehicleModuleConfig = {
  key: "delivery-vehicles",
  title: "Delivery Vehicles",
  description: "Manage fleet identity, compliance, assignment, and home-base information.",
  primaryAction: "Add Vehicle",
  noun: "vehicle",
  searchPlaceholder: "Search fleet no., plate, or warehouse",
  statuses: DeliveryVehicleStatusOptions,
  dispatchQueueStatuses: DeliveryVehicleDispatchQueueStatuses,
  hideReferenceColumn: true,
  fields: [
    { key: "plateNumber", label: "Vehicle Plate No.", required: true },
    {
      key: "vehicleType",
      label: "Vehicle Type",
      required: true,
      type: "select",
      options: DeliveryVehicleTypeOptions,
    },
    {
      key: "baseWarehouse",
      label: "Base Warehouse",
      required: true,
      type: "select",
      options: DeliveryVehicleBaseWarehouseOptions,
    },
    {
      key: "deliveryStatus",
      label: "Delivery Status",
      required: true,
      type: "select",
      options: DeliveryVehicleDeliveryStatusOptions,
      defaultValue: "Pending",
    },
    {
      key: "ownership",
      label: "Ownership",
      type: "select",
      options: DeliveryVehicleOwnershipOptions,
    },
    { key: "registrationExpiry", label: "Registration Expiry", required: true, type: "date" },
    { key: "insuranceExpiry", label: "Insurance Expiry", type: "date" },
    { key: "description", label: "Description", maxLength: 500, type: "textarea" },
  ],
  tableFieldKeys: ["plateNumber", "vehicleType", "baseWarehouse", "deliveryStatus", "registrationExpiry", "insuranceExpiry"],
  insightLabel: "Compliance Alerts",
  insightStatuses: [DeliveryVehicleStatuses.inactive],
  operationalNote:
    "Vehicle records keep assignment, compliance, ownership, and status together; type defaults are maintained under Vehicle Types.",
};
