export type MaterialRequestStatus =
	| "Draft"
	| "Active"
	| "Pending"
	| "Approved"
	| "Rejected"
	| "Completed"
	| "Cancelled";

export type MaterialRequestItem = {
	id: string;
	barcode: string;
	category: string;
	itemCode: string;
	itemName: string;
	lotNo: string;
	requestQuantity: number;
	stockQuantity: number;
	uom: string;
	remarks: string;
};

export type MaterialRequestItemClearMode =
	| "all"
	| "with-data"
	| "incomplete"
	| "no-data";

export type MaterialRequestRecord = {
	id: string;
	requestNo: string;
	documentDate: string;
	requiredDate: string;
	fromWarehouse: string;
	toWarehouse: string;
	department: string;
	vceCode: string;
	vceName: string;
	projectRef: string;
	projectName: string;
	referenceModule: string;
	referenceNo: string;
	purpose: string;
	requiresApproval: boolean;
	remarks: string;
	status: MaterialRequestStatus;
	items: MaterialRequestItem[];
};

export type MaterialRequestFormValues = Omit<MaterialRequestRecord, "id">;

export type MaterialRequestFormMode = "add" | "edit" | "view";

export type MaterialRequestFormErrors = Partial<
	Record<keyof Omit<MaterialRequestFormValues, "items"> | "items", string>
>;
