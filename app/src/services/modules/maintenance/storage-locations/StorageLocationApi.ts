import { StorageLocationsApiPath } from "@/app/src/constants/modules/maintenance/storage-locations/StorageLocationConstants";
import type {
	StorageLocationFormValues,
	StorageLocationRecord,
} from "@/app/src/types/modules/maintenance/storage-locations/StorageLocationTypes";

export { StorageLocationsApiPath };

export async function fetchStorageLocations(): Promise<StorageLocationRecord[]> {
	return [];
}

export async function createStorageLocation(
	values: StorageLocationFormValues,
): Promise<StorageLocationRecord> {
	return toStorageLocationRecord(values);
}

export async function updateStorageLocation(
	record: StorageLocationRecord,
): Promise<StorageLocationRecord> {
	return record;
}

function toStorageLocationRecord(
	values: StorageLocationFormValues,
): StorageLocationRecord {
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
