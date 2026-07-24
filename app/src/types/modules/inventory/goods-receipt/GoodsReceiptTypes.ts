export type GoodsReceiptActionMode = "add" | "edit" | "view";

export type GoodsReceiptStatus =
	| "Active"
	| "Approved"
	| "Cancelled"
	| "Closed"
	| "Disapproved"
	| "Draft"
	| "Pending";

export type GoodsReceiptRecord = {
	id: string;
	documentDate: string;
	formValues?: GoodsReceiptFormValues;
	referenceNo: string;
	status: GoodsReceiptStatus;
	totalAmount: number;
	transactionNo: string;
	transactionType: string;
	vceName: string;
};

export type GoodsReceiptLineEntry = {
	id: string;
	itemCode: string;
	barcode: string;
	itemName: string;
	itemCategory: string;
	uom: string;
	lotNo: string;
	stockQuantity: string;
	receivedQuantity: string;
	unitCost: string;
	amount: string;
	referenceNo: string;
	responsibilityCenter: string;
};

export type GoodsReceiptFormValues = {
	transactionType: string;
	sourceWarehouse: string;
	receivingWarehouse: string;
	vceCode: string;
	vceName: string;
	remarks: string;
	transactionNo: string;
	documentDate: string;
	status: string;
	icNo: string;
	giNo: string;
	siRef: string;
	projectRef: string;
	projectName: string;
	lineEntries: GoodsReceiptLineEntry[];
};

export type GoodsReceiptTotals = {
	receivedQuantity: number;
	amount: number;
};
