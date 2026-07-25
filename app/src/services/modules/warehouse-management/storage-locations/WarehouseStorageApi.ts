import { WarehouseStorageApiPath } from "@/app/src/constants/modules/warehouse-management/storage-locations/WarehouseStorageConstants";
import type {
	WarehouseStorageFormValues,
	WarehouseStorageRecord,
} from "@/app/src/types/modules/warehouse-management/storage-locations/WarehouseStorageTypes";

export { WarehouseStorageApiPath };

export async function fetchWarehouseStorage(): Promise<WarehouseStorageRecord[]> {
	return [];
}

export async function createWarehouseStorage(
	values: WarehouseStorageFormValues,
): Promise<WarehouseStorageRecord> {
	return toWarehouseStorageRecord(values);
}

export async function updateWarehouseStorage(
	record: WarehouseStorageRecord,
): Promise<WarehouseStorageRecord> {
	return record;
}

function toWarehouseStorageRecord(
	values: WarehouseStorageFormValues,
): WarehouseStorageRecord {
	return {
		aisle: values.aisle.trim(),
		binNo: values.binNo.trim(),
		id: `loc-${Date.now()}`,
		locationCode: values.locationCode.trim(),
		rackNo: values.rackNo.trim(),
		shelfNo: values.shelfNo.trim(),
		status: values.status,
		warehouseId: values.warehouseId,
		warehouseName: "",
		zone: values.zone.trim(),
	};
}
