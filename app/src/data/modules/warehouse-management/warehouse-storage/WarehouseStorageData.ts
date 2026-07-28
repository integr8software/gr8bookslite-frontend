import {
	createBlankWarehouseModuleForm,
	createWarehouseModuleFormFromRow,
	createWarehouseModuleRows,
	removeWarehouseModuleRecord,
	upsertWarehouseModuleRecord,
} from "@/app/src/data/modules/warehouse-management/warehouses/WarehouseModuleData";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import type { WarehouseInventoryStockItem as WarehouseStockItem } from "@/app/src/types/modules/warehouse-management/warehouse-inventory-stock/WarehouseInventoryStockTypes";
import type {
	WarehouseStorageListRecord,
	WarehouseStorageRecord,
	WarehouseStorageStructureField,
	WarehouseStorageSetup,
} from "@/app/src/types/modules/warehouse-management/warehouse-storage/WarehouseStorageTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import type {
	WarehouseModuleActionMode,
	WarehouseModuleFormValues,
	WarehouseModuleRecord,
} from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";

export function createWarehouseStorageRows(warehouses: WarehouseRecord[]) {
	return createWarehouseModuleRows("warehouse-storage", warehouses);
}

export function createWarehouseStorageListRecords(warehouses: WarehouseRecord[]): WarehouseStorageListRecord[] {
	return warehouses.flatMap((warehouse) =>
		warehouse.locations.map((location) => {
			const path = createWarehouseStoragePath(location);
			const items = getWarehouseStorageItems(warehouse, location, path);

			return {
				id: `warehouse-storage-${warehouse.id}-${location.id}`,
				itemCount: items.length,
				itemsOnHand: items.reduce((total, item) => total + item.onHand, 0),
				location,
				path,
				recordId: location.id,
				status: location.status,
				values: [
					location.locationCode,
					getWarehouseStorageName(location),
					warehouse.name,
					path,
					location.locationType || "-",
					String(items.length),
					location.status,
				],
				warehouseId: warehouse.id,
			};
		}),
	);
}

export function createBlankWarehouseStorageForm(warehouses: WarehouseRecord[]) {
	return createBlankWarehouseModuleForm("warehouse-storage", warehouses);
}

export function createWarehouseStorageFormFromRow(
	row: WarehouseModuleRecord,
	warehouses: WarehouseRecord[],
) {
	return createWarehouseModuleFormFromRow(row, warehouses);
}

export function upsertWarehouseStorageRecord(params: {
	form: WarehouseModuleFormValues;
	mode: WarehouseModuleActionMode;
	row?: WarehouseModuleRecord;
	warehouses: WarehouseRecord[];
}) {
	return upsertWarehouseModuleRecord({ ...params, kind: "warehouse-storage" });
}

export function removeWarehouseStorageRecord(
	row: WarehouseModuleRecord,
	warehouses: WarehouseRecord[],
) {
	return removeWarehouseModuleRecord(row, warehouses);
}

export function getWarehouseStorageSetup(warehouse: WarehouseRecord | undefined): WarehouseStorageSetup {
	if (!warehouse) {
		return createStorageSetup("Simple", []);
	}

	if (warehouse.locations.some((location) => location.temperatureZone || location.locationType === "Cold Storage")) {
		return createStorageSetup("Custom", ["room", "temperatureZone", "rackNo", "binNo"], "Optional", "Optional");
	}

	if (
		warehouse.locations.some((location) =>
			Boolean(location.zone || location.aisle || location.rackNo || location.shelfNo || location.binNo),
		)
	) {
		return createStorageSetup("Structured", ["zone", "aisle", "rackNo", "shelfNo", "binNo"]);
	}

	return createStorageSetup("Simple", []);
}

export function getWarehouseStorageName(location: WarehouseStorageRecord) {
	return location.locationName?.trim() || location.locationCode || createWarehouseStoragePath(location);
}

export function createWarehouseStoragePath(location: WarehouseStorageRecord) {
	const structuredParts = [
		createPathPart("Zone", location.zone),
		createPathPart("Room", location.room),
		createPathPart("Aisle", location.aisle),
		createPathPart("Rack", location.rackNo),
		createPathPart("Level", location.shelfNo),
		createPathPart("Bin", location.binNo),
		createPathPart("Temp", location.temperatureZone),
	].filter(Boolean);

	return structuredParts.join(" / ") || location.locationName?.trim() || location.locationCode || "-";
}

export function createStorageCodeFromForm(form: WarehouseModuleFormValues) {
	const structuredCode = [form.zone, form.room, form.aisle, form.rackNo, form.shelfNo, form.binNo, form.temperatureZone]
		.map((part) => part.trim().replace(/\s+/g, "").toUpperCase())
		.filter(Boolean)
		.join("-");

	if (structuredCode) {
		return structuredCode;
	}

	return form.locationName.trim().replace(/\s+/g, "-").toUpperCase();
}

export function getWarehouseStorageItems(
	warehouse: WarehouseRecord | undefined,
	location: WarehouseStorageRecord,
	path = createWarehouseStoragePath(location),
): WarehouseStockItem[] {
	if (!warehouse) {
		return [];
	}

	const searchableLocationValues = [
		location.locationCode,
		location.locationName,
		path,
		location.zone,
		location.room,
		location.aisle,
		location.rackNo,
		location.shelfNo,
		location.binNo,
	].map((value) => normalizeLowercaseText(value ?? "")).filter(Boolean);

	return warehouse.items.filter((item) => {
		const itemLocation = normalizeLowercaseText(item.storageLocation);

		return Boolean(itemLocation) && searchableLocationValues.some((value) => itemLocation === value || itemLocation.includes(value));
	});
}

function createStorageSetup(
	trackingMode: WarehouseStorageSetup["trackingMode"],
	requiredFields: WarehouseStorageStructureField[],
	capacityTracking: WarehouseStorageSetup["capacityTracking"] = "Optional",
	temperatureTracking: WarehouseStorageSetup["temperatureTracking"] = "Off",
): WarehouseStorageSetup {
	return {
		capacityTracking,
		codeFormat: trackingMode === "Structured" ? "[ZONE]-[AISLE]-[RACK]-[LEVEL]-[BIN]" : "[NAME]",
		defaultLocationRequired: trackingMode !== "No Tracking",
		requiredFields,
		temperatureTracking,
		trackingMode,
	};
}

function createPathPart(label: string, value?: string) {
	const normalizedValue = value?.trim();

	return normalizedValue ? `${label} ${normalizedValue}` : "";
}
