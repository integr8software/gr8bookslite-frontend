import { WarehouseAccessApiPath } from "@/app/src/constants/modules/maintenance/warehouse-access/WarehouseAccessConstants";
import type {
	WarehouseAccessFormValues,
	WarehouseAccessRecord,
} from "@/app/src/types/modules/maintenance/warehouse-access/WarehouseAccessTypes";

export { WarehouseAccessApiPath };

export async function fetchWarehouseAccess(): Promise<WarehouseAccessRecord[]> {
	return [];
}

export async function createWarehouseAccess(
	values: WarehouseAccessFormValues,
): Promise<WarehouseAccessRecord> {
	return toWarehouseAccessRecord(values);
}

export async function updateWarehouseAccess(
	record: WarehouseAccessRecord,
): Promise<WarehouseAccessRecord> {
	return record;
}

function toWarehouseAccessRecord(
	values: WarehouseAccessFormValues,
): WarehouseAccessRecord {
	return {
		accessLevel: values.accessLevel,
		id: `access-${Date.now()}`,
		permissions: values.permissions,
		status: values.status,
		userName: values.userName.trim(),
	};
}
