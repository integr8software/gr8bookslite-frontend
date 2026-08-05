export type DeliveryReceiptActionMode = "add" | "edit" | "view";

export type DeliveryReceiptStatus =
	| "Cancelled"
	| "Disapproved"
	| "Draft"
	| "For Approval"
	| "Posted";

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
	expirationDate: string;
	lotNo: string;
	color: string;
	brand: string;
	size: string;
	model: string;
	binNo: string;
	warehouse: string;
	stockQuantity: string;
	responsibilityCenter: string;
	particulars: string;
};

export type DeliveryReceiptAccountingEntry = {
	id: string;
	accountCode: string;
	accountTitle: string;
	debit: number;
	credit: number;
	partyCode: string;
	partyName: string;
	particulars: string;
	vatType: string;
	atcCode: string;
	responsibilityCenter: string;
	refNo: string;
};

export type DeliveryReceiptAttachment = {
	id: string;
	name: string;
	size: number;
	type: string;
	lastModified: number;
	dataUrl?: string;
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
	contactPerson: string;
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
	projectName: string;
	plNo: string;
	resCenter: string;
	attachments: DeliveryReceiptAttachment[];
	accountingEntries: DeliveryReceiptAccountingEntry[];
	lineEntries: DeliveryReceiptLineEntry[];
};
