import { formatCurrency } from "@/app/src/utils/currency.util";
import type { WarehouseAccessRecord } from "@/app/src/types/modules/maintenance/warehouse-access/WarehouseAccessTypes";
import type { StorageLocationRecord } from "@/app/src/types/modules/maintenance/storage-locations/StorageLocationTypes";
import type { WarehouseTransferRecord } from "@/app/src/types/modules/maintenance/warehouse-transfers/WarehouseTransferTypes";
import type {
	WarehouseRecord,
	WarehouseStatus,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import type {
	WarehouseEditableSupportKind,
	WarehouseModuleFormValues,
	WarehouseModulePageKind,
	WarehouseModuleRecord,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import { getWarehouseAvailableStock } from "@/app/src/data/modules/maintenance/warehouses/WarehouseData";

export function createWarehouseModuleRows(
	kind: WarehouseModulePageKind,
	warehouses: WarehouseRecord[],
) {
	if (kind === "access") {
		return warehouses.flatMap((warehouse) =>
			warehouse.access.map((access) =>
				createWarehouseModuleRecord(kind, warehouse.id, access.id, [
					warehouse.name,
					access.userName,
					access.permissions.join(", "),
					access.status,
				]),
			),
		);
	}

	if (kind === "storage-locations") {
		return warehouses.flatMap((warehouse) =>
			warehouse.locations.map((location) =>
				createWarehouseModuleRecord(kind, warehouse.id, location.id, [
					warehouse.name,
					location.zone || "-",
					location.aisle || "-",
					location.rackNo || "-",
					location.shelfNo || "-",
					location.binNo || "-",
					location.locationCode,
					location.status,
				]),
			),
		);
	}

	if (kind === "stock-inquiry") {
		return warehouses.flatMap((warehouse) =>
			warehouse.items.map((item) =>
				createWarehouseModuleRecord(kind, warehouse.id, item.id, [
					warehouse.name,
					item.itemName,
					item.category,
					item.uom,
					String(item.onHand),
					String(item.reserved),
					String(getWarehouseAvailableStock(item)),
					formatCurrency(item.onHand * item.unitCost),
					item.lotNumber || "-",
					item.serialNumber || "-",
					item.storageLocation || "-",
				]),
			),
		);
	}

	return warehouses.flatMap((warehouse) =>
		warehouse.transfers.map((transfer) =>
			createWarehouseModuleRecord(kind, warehouse.id, transfer.id, [
				transfer.date,
				transfer.referenceNumber,
				transfer.sourceWarehouse,
				transfer.destinationWarehouse,
				transfer.requestedBy,
				transfer.approvedBy,
				transfer.status,
			]),
		),
	);
}

export function createBlankWarehouseModuleForm(
	kind: WarehouseEditableSupportKind,
	warehouses: WarehouseRecord[],
): WarehouseModuleFormValues {
	const firstWarehouse = warehouses[0];

	return {
		accessLevel: "Viewer",
		approvedBy: "",
		aisle: "",
		balance: "0",
		binNo: "",
		date: new Date().toISOString().slice(0, 10),
		destinationWarehouse:
			warehouses.find((warehouse) => warehouse.id !== firstWarehouse?.id)?.name ??
			"",
		item: "",
		locationCode: "",
		permissions: ["View Stock"],
		quantityIn: "0",
		quantityOut: "0",
		rackNo: "",
		referenceNumber: createWarehouseModuleReferenceNumber(kind),
		requestedBy: "",
		shelfNo: "",
		sourceWarehouse: firstWarehouse?.name ?? "",
		status: kind === "transfers" ? "Draft" : "Active",
		transactionType: "",
		user: "",
		userName: "",
		warehouseId: firstWarehouse?.id ?? "",
		zone: "",
	};
}

export function createWarehouseModuleFormFromRow(
	row: WarehouseModuleRecord,
	warehouses: WarehouseRecord[],
): WarehouseModuleFormValues {
	const form = createBlankWarehouseModuleForm(
		toEditableWarehouseModuleKind(row.kind),
		warehouses,
	);
	const warehouse = warehouses.find((current) => current.id === row.warehouseId);

	if (!warehouse) {
		return form;
	}

	if (row.kind === "access") {
		const record = warehouse.access.find((access) => access.id === row.recordId);

		return record
			? {
					...form,
					accessLevel: record.accessLevel,
					permissions: record.permissions,
					status: record.status,
					userName: record.userName,
					warehouseId: warehouse.id,
				}
			: form;
	}

	if (row.kind === "storage-locations") {
		const record = warehouse.locations.find(
			(location) => location.id === row.recordId,
		);

		return record
			? {
					...form,
					aisle: record.aisle,
					binNo: record.binNo,
					locationCode: record.locationCode,
					rackNo: record.rackNo,
					shelfNo: record.shelfNo,
					status: record.status,
					warehouseId: warehouse.id,
					zone: record.zone,
				}
			: form;
	}

	if (row.kind === "transfers") {
		const record = warehouse.transfers.find(
			(transfer) => transfer.id === row.recordId,
		);

		return record
			? {
					...form,
					approvedBy: record.approvedBy,
					date: record.date,
					destinationWarehouse: record.destinationWarehouse,
					referenceNumber: record.referenceNumber,
					requestedBy: record.requestedBy,
					sourceWarehouse: record.sourceWarehouse,
					status: record.status,
					warehouseId: warehouse.id,
				}
			: form;
	}

	return {
		...form,
		item: row.values[1] ?? "",
		locationCode: row.values[10] ?? "",
		warehouseId: warehouse.id,
	};
}

export function upsertWarehouseModuleRecord({
	form,
	kind,
	mode,
	row,
	warehouses,
}: {
	form: WarehouseModuleFormValues;
	kind: WarehouseEditableSupportKind;
	mode: "add" | "edit" | "view";
	row?: WarehouseModuleRecord;
	warehouses: WarehouseRecord[];
}) {
	const targetWarehouseId = form.warehouseId || row?.warehouseId;

	return warehouses.map((warehouse) => {
		if (warehouse.id !== targetWarehouseId) {
			if (mode === "edit" && row?.warehouseId === warehouse.id) {
				return removeRecordFromWarehouse(warehouse, kind, row.recordId);
			}

			return warehouse;
		}

		return upsertRecordIntoWarehouse(warehouse, kind, form, row?.recordId);
	});
}

export function removeWarehouseModuleRecord(
	row: WarehouseModuleRecord,
	warehouses: WarehouseRecord[],
) {
	return warehouses
		.map((warehouse) =>
			warehouse.id === row.warehouseId && row.kind !== "stock-inquiry"
				? removeRecordFromWarehouse(
						warehouse,
						row.kind as WarehouseEditableSupportKind,
						row.recordId,
					)
				: warehouse,
		)
		.find((warehouse, index) => warehouse !== warehouses[index]);
}

export function toEditableWarehouseModuleKind(
	kind: WarehouseModulePageKind,
): WarehouseEditableSupportKind {
	if (kind === "stock-inquiry") {
		return "storage-locations";
	}

	return kind as WarehouseEditableSupportKind;
}

function createWarehouseModuleRecord(
	kind: WarehouseModulePageKind,
	warehouseId: string,
	recordId: string,
	values: string[],
): WarehouseModuleRecord {
	const status =
		values.find((value) =>
			[
				"Active",
				"Inactive",
				"Draft",
				"Submitted",
				"Approved",
				"In Transit",
				"Received",
				"Completed",
			].includes(value),
		) ?? "Active";

	return {
		id: `${kind}-${warehouseId}-${recordId}`,
		kind,
		recordId,
		status,
		values,
		warehouseId,
	};
}

function upsertRecordIntoWarehouse(
	warehouse: WarehouseRecord,
	kind: WarehouseEditableSupportKind,
	form: WarehouseModuleFormValues,
	recordId?: string,
): WarehouseRecord {
	if (kind === "access") {
		const record: WarehouseAccessRecord = {
			accessLevel: form.accessLevel,
			id: recordId ?? `access-${Date.now()}`,
			permissions: form.permissions,
			status: normalizeStatus(form.status),
			userName: form.userName.trim(),
		};

		return {
			...warehouse,
			access: upsertById(warehouse.access, record),
		};
	}

	if (kind === "storage-locations") {
		const record: StorageLocationRecord = {
			aisle: form.aisle.trim(),
			binNo: form.binNo.trim(),
			id: recordId ?? `loc-${Date.now()}`,
			locationCode: form.locationCode.trim() || createLocationCode(form),
			rackNo: form.rackNo.trim(),
			shelfNo: form.shelfNo.trim(),
			status: normalizeStatus(form.status),
			warehouseId: warehouse.id,
			warehouseName: warehouse.name,
			zone: form.zone.trim(),
		};

		return {
			...warehouse,
			locations: upsertById(warehouse.locations, record),
		};
	}

	const record: WarehouseTransferRecord = {
		approvedBy: form.approvedBy.trim(),
		date: form.date,
		destinationWarehouse: form.destinationWarehouse.trim(),
		id: recordId ?? `transfer-${Date.now()}`,
		referenceNumber: form.referenceNumber.trim(),
		requestedBy: form.requestedBy.trim(),
		sourceWarehouse: warehouse.name,
		status: form.status as WarehouseTransferRecord["status"],
	};

	return {
		...warehouse,
		transfers: upsertById(warehouse.transfers, record),
	};
}

function removeRecordFromWarehouse(
	warehouse: WarehouseRecord,
	kind: WarehouseEditableSupportKind,
	recordId: string,
): WarehouseRecord {
	if (kind === "access") {
		return {
			...warehouse,
			access: warehouse.access.filter((record) => record.id !== recordId),
		};
	}

	if (kind === "storage-locations") {
		return {
			...warehouse,
			locations: warehouse.locations.filter((record) => record.id !== recordId),
		};
	}

	return {
		...warehouse,
		transfers: warehouse.transfers.filter((record) => record.id !== recordId),
	};
}

function upsertById<TRecord extends { id: string }>(
	records: TRecord[],
	record: TRecord,
) {
	const exists = records.some((current) => current.id === record.id);

	return exists
		? records.map((current) => (current.id === record.id ? record : current))
		: [...records, record];
}

function normalizeStatus(status: string): WarehouseStatus {
	return status === "Inactive" ? "Inactive" : "Active";
}

function createLocationCode(form: WarehouseModuleFormValues) {
	return [form.zone, form.rackNo, form.shelfNo, form.binNo]
		.map((part) => part.trim())
		.filter(Boolean)
		.join("-");
}

function createWarehouseModuleReferenceNumber(
	kind: WarehouseEditableSupportKind,
) {
	const prefix =
		kind === "transfers"
			? "WT"
			: kind === "storage-locations"
				? "LOC"
				: "ACC";

	return `${prefix}-${Date.now().toString().slice(-6)}`;
}
