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

export function createWarehouseAccessRows(warehouses: WarehouseRecord[]) {
	return createWarehouseModuleRows("access", warehouses);
}

export function createBlankWarehouseAccessForm(warehouses: WarehouseRecord[]) {
	return createBlankWarehouseModuleForm("access", warehouses);
}

export function createWarehouseAccessFormFromRow(
	row: WarehouseModuleRecord,
	warehouses: WarehouseRecord[],
) {
	return createWarehouseModuleFormFromRow(row, warehouses);
}

export function upsertWarehouseAccessRecord(params: {
	form: WarehouseModuleFormValues;
	mode: WarehouseModuleActionMode;
	row?: WarehouseModuleRecord;
	warehouses: WarehouseRecord[];
}) {
	return upsertWarehouseModuleRecord({ ...params, kind: "access" });
}

export function removeWarehouseAccessRecord(
	row: WarehouseModuleRecord,
	warehouses: WarehouseRecord[],
) {
	return removeWarehouseModuleRecord(row, warehouses);
}
