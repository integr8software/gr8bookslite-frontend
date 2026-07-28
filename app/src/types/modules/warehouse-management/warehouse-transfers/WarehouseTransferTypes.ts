export type WarehouseTransferStatus =
	| "Draft"
	| "Submitted"
	| "Approved"
	| "In Transit"
	| "Received"
	| "Completed";

export type WarehouseTransferType = "Location Transfer" | "Warehouse Transfer";

export type WarehouseTransferRecord = {
	id: string;
	date: string;
	referenceNumber: string;
	transferType?: WarehouseTransferType;
	sourceWarehouse: string;
	destinationWarehouse: string;
	sourceLocation?: string;
	destinationLocation?: string;
	item?: string;
	quantity?: string;
	notes?: string;
	status: WarehouseTransferStatus;
	requestedBy: string;
	approvedBy: string;
};

export type WarehouseTransferFormValues = {
	approvedBy: string;
	date: string;
	destinationWarehouse: string;
	referenceNumber: string;
	requestedBy: string;
	status: WarehouseTransferStatus;
	warehouseId: string;
};

export type WarehouseTransferListRecord = {
	id: string;
	recordId: string;
	status: WarehouseTransferStatus;
	values: string[];
	warehouseId: string;
};
