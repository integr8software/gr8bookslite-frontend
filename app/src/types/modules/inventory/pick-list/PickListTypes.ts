export type PickListActionMode = "add" | "edit" | "view";

export type PickListStatus =
	| "Active"
	| "Approved"
	| "Cancelled"
	| "Closed"
	| "Disapproved"
	| "Draft"
	| "Pending";

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
	vceCode: string;
	vceName: string;
	remarks: string;
	referenceNo: string;
};

export type PickListFormValues = {
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
