export type MaterialRequestStatus =
	| "Draft"
	| "Active"
	| "Pending"
	| "Approved"
	| "Disapproved"
	| "Completed"
	| "Cancelled";

export type MaterialRequestHistoryEntry = {
	id: string;
	action: string;
	actor: string;
	createdAt: string;
	description: string;
	status: MaterialRequestStatus;
};

export type MaterialRequestNumberValue = number | "";

export type MaterialRequestItem = {
	id: string;
	barcode: string;
	category: string;
	itemCode: string;
	itemName: string;
	lotNo: string;
	requestQuantity: MaterialRequestNumberValue;
	stockQuantity: MaterialRequestNumberValue;
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
	history: MaterialRequestHistoryEntry[];
	items: MaterialRequestItem[];
};

export type MaterialRequestFormValues = Omit<
	MaterialRequestRecord,
	"id" | "history"
>;

export type MaterialRequestFormMode = "add" | "edit" | "view";

export type MaterialRequestFormErrors = Partial<
	Record<keyof Omit<MaterialRequestFormValues, "items"> | "items", string>
>;
