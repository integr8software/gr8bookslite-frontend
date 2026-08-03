import {
	createBlankWarehouseModuleForm,
	createWarehouseModuleFormFromRow,
	createWarehouseModuleRows,
	removeWarehouseModuleRecord,
	upsertWarehouseModuleRecord,
} from "@/app/src/data/modules/warehouse-management/warehouses/WarehouseModuleData";
import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import type {
	WarehouseModuleActionMode,
	WarehouseModuleFormValues,
	WarehouseModuleRecord,
} from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";

export function createWarehouseTransferRows(warehouses: WarehouseRecord[]) {
	return createWarehouseModuleRows("transfers", warehouses);
}

export function createBlankWarehouseTransferForm(warehouses: WarehouseRecord[]) {
	return createBlankWarehouseModuleForm("transfers", warehouses);
}

export function createWarehouseTransferFormFromRow(
	row: WarehouseModuleRecord,
	warehouses: WarehouseRecord[],
) {
	return createWarehouseModuleFormFromRow(row, warehouses);
}

export function upsertWarehouseTransferRecord(params: {
	form: WarehouseModuleFormValues;
	mode: WarehouseModuleActionMode;
	row?: WarehouseModuleRecord;
	warehouses: WarehouseRecord[];
}) {
	return upsertWarehouseModuleRecord({ ...params, kind: "transfers" });
}

export function removeWarehouseTransferRecord(
	row: WarehouseModuleRecord,
	warehouses: WarehouseRecord[],
) {
	return removeWarehouseModuleRecord(row, warehouses);
}
