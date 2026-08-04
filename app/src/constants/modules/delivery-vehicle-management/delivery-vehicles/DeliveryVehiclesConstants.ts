import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const DeliveryVehiclesHref = MODULE_ROUTE_MAP.DVE;
export const DeliveryVehiclesTablePaginationStorageKey =
  "delivery-vehicle-management:delivery-vehicles";

export const DeliveryVehiclesConfig: DeliveryVehicleModuleConfig = {
  key: "delivery-vehicles",
  code: "DVE",
  title: "Delivery Vehicles",
  description: "Manage fleet identity, compliance, assignment, and home-base information.",
  primaryAction: "Add Vehicle",
  noun: "vehicle",
  searchPlaceholder: "Search Fleet No., Plate, Or Warehouse",
  statuses: ["Active", "Inactive"],
  hideReferenceColumn: true,
  fields: [
    { key: "plateNumber", label: "Vehicle Plate No.", required: true },
    {
      key: "vehicleType",
      label: "Vehicle Type",
      required: true,
      type: "select",
      options: ["Light Truck", "Refrigerated Van", "Delivery Van", "Motorcycle", "Heavy Truck"],
    },
    {
      key: "baseWarehouse",
      label: "Base Warehouse",
      required: true,
      type: "select",
      options: ["Pasig Distribution Hub", "Makati Fulfillment Center", "Cebu Central Warehouse"],
    },
    {
      key: "deliveryStatus",
      label: "Delivery Status",
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
    {
      key: "ownership",
      label: "Ownership",
      type: "select",
      options: ["Company Owned", "Leased", "Third Party"],
    },
    { key: "registrationExpiry", label: "Registration Expiry", required: true, type: "date" },
    { key: "insuranceExpiry", label: "Insurance Expiry", type: "date" },
    { key: "description", label: "Description", maxLength: 500, type: "textarea" },
  ],
  tableFieldKeys: [
    "plateNumber",
    "vehicleType",
    "baseWarehouse",
    "deliveryStatus",
    "registrationExpiry",
    "insuranceExpiry",
  ],
  insightLabel: "Compliance Alerts",
  insightStatuses: ["Inactive"],
  operationalNote:
    "Vehicle records keep assignment, compliance, ownership, and status together; type defaults are maintained under Vehicle Types.",
};
