import { formatCurrency } from "@/app/src/utils/currency.util";
import type { WarehouseAccessRecord } from "@/app/src/types/modules/maintenance/warehouse-access/WarehouseAccessTypes";
import type { WarehouseStorageRecord } from "@/app/src/types/modules/maintenance/warehouse-storage/WarehouseStorageTypes";
import type { WarehouseTransferRecord } from "@/app/src/types/modules/maintenance/warehouse-transfers/WarehouseTransferTypes";
import type { WarehouseRecord, WarehouseStatus } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import type {
  WarehouseEditableSupportKind,
  WarehouseModuleFormValues,
  WarehouseModulePageKind,
  WarehouseModuleRecord,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import { getWarehouseAvailableStock } from "@/app/src/data/modules/maintenance/warehouses/WarehouseData";

export function createWarehouseModuleRows(kind: WarehouseModulePageKind, warehouses: WarehouseRecord[]) {
  if (kind === "access") {
    return warehouses.flatMap((warehouse) =>
      warehouse.access.map((access) =>
        createWarehouseModuleRecord(kind, warehouse.id, access.id, [warehouse.name, access.userName, access.permissions.join(", "), access.status]),
      ),
    );
  }

  if (kind === "warehouse-storage") {
    return warehouses.flatMap((warehouse) =>
      warehouse.locations.map((location) =>
        createWarehouseModuleRecord(kind, warehouse.id, location.id, [
          location.locationCode,
          getLocationName(location),
          warehouse.name,
          createLocationPath(location),
          location.locationType || "-",
          String(warehouse.items.filter((item) => item.storageLocation === location.locationCode || item.storageLocation === location.locationName).length),
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

export function createBlankWarehouseModuleForm(kind: WarehouseEditableSupportKind, warehouses: WarehouseRecord[]): WarehouseModuleFormValues {
  const firstWarehouse = warehouses[0];

  return {
    accessLevel: "Viewer",
    approvedBy: "",
    aisle: "",
    balance: "0",
    binNo: "",
    capacity: "",
    capacityUom: "units",
    date: new Date().toISOString().slice(0, 10),
    destinationWarehouse: warehouses.find((warehouse) => warehouse.id !== firstWarehouse?.id)?.name ?? "",
    item: "",
    locationCode: "",
    locationName: "",
    locationType: "General Storage",
    notes: "",
    permissions: ["View Stock"],
    quantityIn: "0",
    quantityOut: "0",
    rackNo: "",
    referenceNumber: createWarehouseModuleReferenceNumber(kind),
    requestedBy: "",
    room: "",
    shelfNo: "",
    sourceWarehouse: firstWarehouse?.name ?? "",
    status: kind === "transfers" ? "Draft" : "Active",
    temperatureZone: "",
    transactionType: "",
    user: "",
    userEmail: "",
    userId: "",
    userName: "",
    warehouseId: firstWarehouse?.id ?? "",
    zone: "",
  };
}

export function createWarehouseModuleFormFromRow(row: WarehouseModuleRecord, warehouses: WarehouseRecord[]): WarehouseModuleFormValues {
  const form = createBlankWarehouseModuleForm(toEditableWarehouseModuleKind(row.kind), warehouses);
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
          userEmail: record.userEmail ?? "",
          userId: record.userId ?? "",
          userName: record.userName,
          warehouseId: warehouse.id,
        }
      : form;
  }

  if (row.kind === "warehouse-storage") {
    const record = warehouse.locations.find((location) => location.id === row.recordId);

    return record
      ? {
          ...form,
          aisle: record.aisle,
          binNo: record.binNo,
          capacity: record.capacity ?? "",
          capacityUom: record.capacityUom ?? "units",
          locationCode: record.locationCode,
          locationName: record.locationName ?? "",
          locationType: record.locationType ?? "General Storage",
          notes: record.notes ?? "",
          rackNo: record.rackNo,
          room: record.room ?? "",
          shelfNo: record.shelfNo,
          status: record.status,
          temperatureZone: record.temperatureZone ?? "",
          warehouseId: warehouse.id,
          zone: record.zone,
        }
      : form;
  }

  if (row.kind === "transfers") {
    const record = warehouse.transfers.find((transfer) => transfer.id === row.recordId);

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

export function removeWarehouseModuleRecord(row: WarehouseModuleRecord, warehouses: WarehouseRecord[]) {
  return warehouses
    .map((warehouse) =>
      warehouse.id === row.warehouseId && row.kind !== "stock-inquiry"
        ? removeRecordFromWarehouse(warehouse, row.kind as WarehouseEditableSupportKind, row.recordId)
        : warehouse,
    )
    .find((warehouse, index) => warehouse !== warehouses[index]);
}

export function toEditableWarehouseModuleKind(kind: WarehouseModulePageKind): WarehouseEditableSupportKind {
  if (kind === "stock-inquiry") {
    return "warehouse-storage";
  }

  return kind as WarehouseEditableSupportKind;
}

function createWarehouseModuleRecord(kind: WarehouseModulePageKind, warehouseId: string, recordId: string, values: string[]): WarehouseModuleRecord {
  const status =
    values.find((value) => ["Active", "Inactive", "Blocked", "Reserved", "Draft", "Submitted", "Approved", "In Transit", "Received", "Completed"].includes(value)) ?? "Active";

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
      userEmail: form.userEmail || undefined,
      userId: form.userId || undefined,
      userName: form.userName.trim(),
    };

    return {
      ...warehouse,
      access: upsertById(warehouse.access, record),
    };
  }

  if (kind === "warehouse-storage") {
    const record: WarehouseStorageRecord = {
      aisle: form.aisle.trim(),
      binNo: form.binNo.trim(),
      capacity: form.capacity.trim() || undefined,
      capacityUom: form.capacityUom.trim() || undefined,
      id: recordId ?? `loc-${Date.now()}`,
      locationCode: form.locationCode.trim() || createLocationCode(form),
      locationName: form.locationName.trim() || form.locationCode.trim() || createLocationCode(form),
      locationType: form.locationType.trim() || undefined,
      notes: form.notes.trim() || undefined,
      rackNo: form.rackNo.trim(),
      room: form.room.trim() || undefined,
      shelfNo: form.shelfNo.trim(),
      status: normalizeWarehouseStorageStatus(form.status),
      temperatureZone: form.temperatureZone.trim() || undefined,
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

function removeRecordFromWarehouse(warehouse: WarehouseRecord, kind: WarehouseEditableSupportKind, recordId: string): WarehouseRecord {
  if (kind === "access") {
    return {
      ...warehouse,
      access: warehouse.access.filter((record) => record.id !== recordId),
    };
  }

  if (kind === "warehouse-storage") {
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

function upsertById<TRecord extends { id: string }>(records: TRecord[], record: TRecord) {
  const exists = records.some((current) => current.id === record.id);

  return exists ? records.map((current) => (current.id === record.id ? record : current)) : [...records, record];
}

function normalizeStatus(status: string): WarehouseStatus {
  return status === "Inactive" ? "Inactive" : "Active";
}

function normalizeWarehouseStorageStatus(status: string) {
  if (status === "Inactive" || status === "Blocked" || status === "Reserved") {
    return status;
  }

  return "Active";
}

function createLocationCode(form: WarehouseModuleFormValues) {
  const structuredCode = [form.zone, form.room, form.aisle, form.rackNo, form.shelfNo, form.binNo, form.temperatureZone]
    .map((part) => part.trim().replace(/\s+/g, "").toUpperCase())
    .filter(Boolean)
    .join("-");

  return structuredCode || form.locationName.trim().replace(/\s+/g, "-").toUpperCase();
}

function getLocationName(location: { locationCode: string; locationName?: string; zone: string; room?: string; aisle: string; rackNo: string; shelfNo: string; binNo: string; temperatureZone?: string }) {
  return location.locationName?.trim() || location.locationCode || createLocationPath(location);
}

function createLocationPath(location: { locationCode: string; locationName?: string; zone: string; room?: string; aisle: string; rackNo: string; shelfNo: string; binNo: string; temperatureZone?: string }) {
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

function createPathPart(label: string, value?: string) {
  const normalizedValue = value?.trim();

  return normalizedValue ? `${label} ${normalizedValue}` : "";
}

function createWarehouseModuleReferenceNumber(kind: WarehouseEditableSupportKind) {
  const prefix = kind === "transfers" ? "WT" : kind === "warehouse-storage" ? "LOC" : "ACC";

  return `${prefix}-${Date.now().toString().slice(-6)}`;
}
