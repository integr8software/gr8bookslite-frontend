import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const VehicleTypesHref = MODULE_ROUTE_MAP.DVT;
export const VehicleTypesTablePaginationStorageKey = "delivery-vehicle-management:vehicle-types";

export const VehicleTypesConfig: DeliveryVehicleModuleConfig = {
  key: "vehicle-types",
  code: "DVT",
  title: "Vehicle Types",
  description: "Define reusable fleet classes, capacity limits, and handling capabilities.",
  primaryAction: "Add Vehicle Type",
  noun: "vehicle type",
  searchPlaceholder: "Search code, type, body, or status",
  statuses: ["Active", "Inactive"],
  hideReferenceColumn: true,
  fields: [
    { key: "typeName", label: "Vehicle Type Name", required: true },
    { key: "brand", label: "Brand", required: true },
    { key: "model", label: "Model", required: true },
    {
      key: "bodyType",
      label: "Body type",
      required: true,
      type: "select",
      options: ["Closed Van", "Refrigerated Van", "Box Truck", "Motorcycle"],
    },
    {
      key: "maxPayload",
      label: "Maximum payload (kg)",
      required: true,
      type: "number",
      tooltip: "Maximum payload is the vehicle weight limit.",
    },
    {
      key: "cargoVolume",
      label: "Cargo volume",
      required: true,
      type: "number",
      defaultValue: "18",
      unitSuffix: "CBM",
      tooltip: "Cargo volume is the space limit measured in CBM (m³).",
    },
    {
      key: "capacityUnit",
      label: "Capacity unit",
      required: true,
      type: "select",
      options: ["CBM (m³)"],
      defaultValue: "CBM (m³)",
    },
    {
      key: "palletCapacity",
      label: "Pallet capacity",
      type: "number",
      tooltip: "Pallet capacity is the number of pallets this vehicle type can carry.",
    },
    {
      key: "handling",
      label: "Handling capability",
      type: "select",
      options: ["General cargo", "Temperature controlled", "Hazardous eligible"],
      tooltip: "Handling capability is the supported cargo-handling features.",
    },
    { key: "description", label: "Description", maxLength: 500, type: "textarea" },
  ],
  tableFieldKeys: ["brand", "model", "bodyType", "maxPayload", "cargoVolume", "handling"],
  insightLabel: "Capacity-ready",
  insightStatuses: ["Active"],
  operationalNote: "Type defaults flow into vehicle profiles and are checked during load planning.",
};
