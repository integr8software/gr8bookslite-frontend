import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const VehicleTypesHref = MODULE_ROUTE_MAP.DVT;
export const VehicleTypesTablePaginationStorageKey = "delivery-vehicle-management:vehicle-types";

export const VehicleTypesConfig: DeliveryVehicleModuleConfig = {
  key: "vehicle-types",
  title: "Vehicle Types",
  description: "Define reusable fleet classes, capacity limits, and handling capabilities.",
  primaryAction: "Add Vehicle Type",
  noun: "vehicle type",
  searchPlaceholder: "Search Code, Type, Body, Or Status",
  statuses: ["Active", "Inactive"],
  hideReferenceColumn: true,
  fields: [
    { key: "typeName", label: "Vehicle Type Name", required: true },
    { key: "brand", label: "Brand", required: true },
    { key: "model", label: "Model", required: true },
    {
      key: "maxPayload",
      label: "Maximum Payload (KG)",
      required: true,
      type: "number",
      tooltip: "Maximum Payload Is The Vehicle Weight Limit.",
    },
    {
      key: "cargoVolume",
      label: "Cargo Volume (CBM)",
      required: true,
      type: "number",
      defaultValue: "18",
      unitSuffix: "CBM",
      tooltip: "Cargo Volume Is The Space Limit Measured In CBM.",
    },
    {
      key: "capacityUnit",
      label: "Capacity Unit",
      required: true,
      type: "select",
      options: ["CBM"],
      defaultValue: "CBM",
    },
    {
      key: "palletCapacity",
      label: "Pallet Capacity",
      type: "number",
      tooltip: "Pallet Capacity Is The Number Of Pallets This Vehicle Type Can Carry.",
    },
    {
      key: "handling",
      label: "Handling Capability",
      type: "select",
      options: ["General Cargo", "Temperature Controlled", "Hazardous Eligible"],
      tooltip: "Handling Capability Is The Supported Cargo-Handling Features.",
    },
    { key: "description", label: "Description", maxLength: 500, type: "textarea" },
  ],
  tableFieldKeys: ["brand", "model", "maxPayload", "cargoVolume", "handling"],
  insightLabel: "Capacity Ready",
  insightStatuses: ["Active"],
  operationalNote: "Type defaults flow into vehicle profiles and are checked during load planning.",
};
