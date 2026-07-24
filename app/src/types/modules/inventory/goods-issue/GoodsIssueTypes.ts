export type GoodsIssueActionMode = "add" | "edit" | "view";

export type GoodsIssueStatus =
	| "Active"
	| "Approved"
	| "Cancelled"
	| "Closed"
	| "Disapproved"
	| "Draft"
	| "Pending";

export type GoodsIssueRecord = {
	id: string;
	documentDate: string;
	formValues?: GoodsIssueFormValues;
	referenceNo: string;
	status: GoodsIssueStatus;
	totalAmount: number;
	transactionNo: string;
	transactionType: string;
	vceName: string;
};

export type GoodsIssueLineEntry = {
	id: string;
	itemCode: string;
	barcode: string;
	description: string;
	itemCategory: string;
	uom: string;
	lotNo: string;
	stockQuantity: string;
	issueQuantity: string;
	unitCost: string;
	amount: string;
	referenceNo: string;
	responsibilityCenter: string;
};

export type GoodsIssueMaterialRequestCopyRecord = {
	id: string;
	documentDate: string;
	itemCode: string;
	itemCategory: string;
	mrNo: string;
	partyCode: string;
	partyName: string;
	remarks: string;
	requestedQuantity: string;
	sourceNo: string;
	uom: string;
	warehouse: string;
};

export type GoodsIssueFormValues = {
	transactionType: string;
	sourceWarehouse: string;
	vceCode: string;
	vceName: string;
	remarks: string;
	transactionNo: string;
	documentDate: string;
	status: string;
	mrNo: string;
	rrNo: string;
	icNo: string;
	faNo: string;
	projectRef: string;
	projectName: string;
	lineEntries: GoodsIssueLineEntry[];
};

export type GoodsIssueTotals = {
	issueQuantity: number;
	amount: number;
};
