export type DeliveryReceiptActionMode = "add" | "edit" | "view";

export type DeliveryReceiptStatus =
	| "Active"
	| "Approved"
	| "Cancelled"
	| "Closed"
	| "Disapproved"
	| "Draft"
	| "Pending";

export type DeliveryReceiptRecord = {
	id: string;
	customerCode: string;
	customerName: string;
	deliveryDate: string;
	documentDate: string;
	formValues?: DeliveryReceiptFormValues;
	referenceNo: string;
	status: DeliveryReceiptStatus;
	totalQuantity: number;
	transactionNo: string;
};

export type DeliveryReceiptLineEntry = {
	id: string;
	itemCode: string;
	barcode: string;
	name: string;
	description: string;
	serialNo: string;
	quantity: string;
	uom: string;
	lotNo: string;
	warehouse: string;
	stockQuantity: string;
	responsibilityCenter: string;
	particulars: string;
};

export type DeliveryReceiptFormValues = {
	vceCode: string;
	vceName: string;
	billToCode: string;
	billToName: string;
	currency: string;
	exchangeRate: string;
	address: string;
	branch: string;
	contactNo: string;
	remarks: string;
	terms: string;
	dueDate: string;
	deliveryDate: string;
	driverName: string;
	plateNo: string;
	transactionNo: string;
	documentDate: string;
	soNo: string;
	soDate: string;
	poNo: string;
	status: string;
	projectRef: string;
	lineEntries: DeliveryReceiptLineEntry[];
};
