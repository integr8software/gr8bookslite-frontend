export type InventoryCountMode = "add" | "edit" | "view";

export type InventoryCountStatus =
	| "Approved"
	| "Cancelled"
	| "Disapproved"
	| "Draft"
	| "In Progress";

export type InventoryCountRecord = {
	id: string;
	countNo: string;
	countDate: string;
	warehouse: string;
	uploader: string;
	category: string;
	totalItems: number;
	variance: string;
	status: InventoryCountStatus;
};

export type InventoryCountLine = {
	id: string;
	itemCode: string;
	itemName: string;
	uom: string;
	systemQty: string;
	countQty: string;
	variance: string;
	remarks: string;
};

export type InventoryCountUploadHistoryEntry = {
	id: string;
	countNo: string;
	uploadedAt: string;
	uploader: string;
	fileName: string;
	rowCount: number;
	status: string;
};

export type InventoryCountValues = {
	countNo: string;
	countDate: string;
	warehouse: string;
	uploader: string;
	itemType: string;
	category: string;
	itemGroup: string;
	counter: string;
	status: string;
	remarks: string;
	lines: InventoryCountLine[];
	uploadHistory: InventoryCountUploadHistoryEntry[];
};
