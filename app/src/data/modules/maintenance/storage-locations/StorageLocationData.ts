import {
	createBlankWarehouseModuleForm,
	createWarehouseModuleFormFromRow,
	createWarehouseModuleRows,
	removeWarehouseModuleRecord,
	upsertWarehouseModuleRecord,
} from "@/app/src/data/modules/maintenance/warehouses/WarehouseModuleData";
import type { WarehouseRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import type {
	WarehouseModuleActionMode,
	WarehouseModuleFormValues,
	WarehouseModuleRecord,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";

export function createStorageLocationRows(warehouses: WarehouseRecord[]) {
	return createWarehouseModuleRows("storage-locations", warehouses);
}

export function createBlankStorageLocationForm(warehouses: WarehouseRecord[]) {
	return createBlankWarehouseModuleForm("storage-locations", warehouses);
}

export function createStorageLocationFormFromRow(
	row: WarehouseModuleRecord,
	warehouses: WarehouseRecord[],
) {
	return createWarehouseModuleFormFromRow(row, warehouses);
}

export function upsertStorageLocationRecord(params: {
	form: WarehouseModuleFormValues;
	mode: WarehouseModuleActionMode;
	row?: WarehouseModuleRecord;
	warehouses: WarehouseRecord[];
}) {
	return upsertWarehouseModuleRecord({ ...params, kind: "storage-locations" });
}

export function removeStorageLocationRecord(
	row: WarehouseModuleRecord,
	warehouses: WarehouseRecord[],
) {
	return removeWarehouseModuleRecord(row, warehouses);
}
