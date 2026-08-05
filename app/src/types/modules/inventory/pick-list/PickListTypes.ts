export type PickListActionMode = "add" | "edit" | "view";

export type PickListStatus =
	| "Cancelled"
	| "Disapproved"
	| "Draft"
	| "For Approval"
	| "Posted";

export type PickListRecord = {
	id: string;
	cluster: string;
	deliveryDate: string;
	documentDate: string;
	formValues?: PickListFormValues;
	referenceNo: string;
	status: PickListStatus;
	totalLines: number;
	transactionNo: string;
};

export type PickListLineEntry = {
	id: string;
	soNo: string;
	itemCode: string;
	barcode: string;
	itemName: string;
	soQuantity: string;
	plQuantity: string;
	uom: string;
	expirationDate: string;
	lotNo: string;
	color: string;
	brand: string;
	size: string;
	model: string;
	binNo: string;
};

export type PickListFormValues = {
	partyCode: string;
	partyName: string;
	deliveryDate: string;
	driverName: string;
	plateNo: string;
	remarks: string;
	cluster: string;
	transactionNo: string;
	documentDate: string;
	status: string;
	lineEntries: PickListLineEntry[];
};

export type PickListSalesOrderCopyRecord = {
	id: string;
	customerCode: string;
	customerName: string;
	documentDate: string;
	referenceNo: string;
	remarks: string;
	sourceNo: string;
};
