import { WarehouseTransfersApiPath } from "@/app/src/constants/modules/maintenance/warehouse-transfers/WarehouseTransferConstants";
import type {
	WarehouseTransferFormValues,
	WarehouseTransferRecord,
} from "@/app/src/types/modules/maintenance/warehouse-transfers/WarehouseTransferTypes";

export { WarehouseTransfersApiPath };

export async function fetchWarehouseTransfers(): Promise<WarehouseTransferRecord[]> {
	return [];
}

export async function createWarehouseTransfer(
	values: WarehouseTransferFormValues,
): Promise<WarehouseTransferRecord> {
	return toWarehouseTransferRecord(values);
}

export async function updateWarehouseTransfer(
	record: WarehouseTransferRecord,
): Promise<WarehouseTransferRecord> {
	return record;
}

function toWarehouseTransferRecord(
	values: WarehouseTransferFormValues,
): WarehouseTransferRecord {
	return {
		approvedBy: values.approvedBy.trim(),
		date: values.date,
		destinationWarehouse: values.destinationWarehouse.trim(),
		id: `transfer-${Date.now()}`,
		referenceNumber: values.referenceNumber.trim(),
		requestedBy: values.requestedBy.trim(),
		sourceWarehouse: "",
		status: values.status,
	};
}
