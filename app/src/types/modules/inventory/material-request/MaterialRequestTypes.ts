export type MaterialRequestStatus =
	| "Pending"
	| "Approved"
	| "Rejected"
	| "Completed";

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

export type MaterialRequestRecord = {
	id: string;
	requestNo: string;
	documentDate: string;
	requiredDate: string;
	fromWarehouse: string;
	toWarehouse: string;
	requestedBy: string;
	department: string;
	vceCode: string;
	vceName: string;
	projectRef: string;
	projectName: string;
	referenceNo: string;
	purpose: string;
	remarks: string;
	status: MaterialRequestStatus;
	items: MaterialRequestItem[];
};

export type MaterialRequestFormValues = Omit<MaterialRequestRecord, "id">;

export type MaterialRequestFormMode = "add" | "edit" | "view";

export type MaterialRequestFormErrors = Partial<
	Record<keyof Omit<MaterialRequestFormValues, "items"> | "items", string>
>;
