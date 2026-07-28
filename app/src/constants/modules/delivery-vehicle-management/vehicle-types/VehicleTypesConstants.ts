import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const VehicleTypesHref = MODULE_ROUTE_MAP.DVT;
export const VehicleTypesApiPath = "/delivery-vehicle-management/vehicle-types";
export const VehicleTypesTablePaginationStorageKey =
	"delivery-vehicle-management:vehicle-types";

export const VehicleTypesConfig: DeliveryVehicleModuleConfig = {
	key: "vehicle-types",
	code: "DVT",
	title: "Vehicle Types",
	description: "Define reusable fleet classes, capacity limits, and handling capabilities.",
	primaryAction: "Add Vehicle Type",
	noun: "vehicle type",
	searchPlaceholder: "Search code, type, or body",
	statuses: ["Active", "Inactive"],
	fields: [
		{ key: "typeName", label: "Vehicle Type Name", required: true },
		{ key: "bodyType", label: "Body type", required: true, type: "select", options: ["Closed Van", "Refrigerated Van", "Box Truck", "Motorcycle"] },
		{ key: "maxPayload", label: "Maximum payload (kg)", required: true, type: "number" },
		{ key: "cargoVolume", label: "Cargo volume (m3)", required: true, type: "number" },
		{ key: "palletCapacity", label: "Pallet capacity", type: "number" },
		{ key: "handling", label: "Handling capability", type: "select", options: ["General cargo", "Temperature controlled", "Hazardous eligible"] },
		{ key: "description", label: "Description", type: "textarea" },
	],
	tableFieldKeys: ["bodyType", "maxPayload", "cargoVolume", "handling"],
	insightLabel: "Capacity-ready",
	insightStatuses: ["Active"],
	operationalNote: "Type defaults flow into vehicle profiles and are checked during load planning.",
};
