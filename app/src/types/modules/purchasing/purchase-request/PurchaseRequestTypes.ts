import type { FormSignatoryRow } from "@/app/src/types/modules/system-administration/form-signatory/FormSignatoryTypes";

export type PurchaseRequestStatus =
	| "Draft"
	| "Open"
	| "Approved"
	| "Closed"
	| "Cancelled";

export type PurchaseRequestItem = {
	id: string;
	itemCode: string;
	barcode: string;
	description: string;
	uom: string;
	quantity: number;
	lotNo: string;
	expiryDate: string;
	cost: number;
	responsibilityCenter: string;
};

export type PurchaseRequestRecord = {
	id: string;
	companyAddress: string;
	companyName: string;
	logoFileName: string;
	logoImageUrl: string;
	telephoneNo: string;
	vatRegTin: string;
	vceCode: string;
	vceName: string;
	purchaseType: string;
	transNo: string;
	prDate: string;
	status: PurchaseRequestStatus;
	currency: string;
	exchangeRate: number;
	bomNo: string;
	projectCode: string;
	projectName: string;
	vendorAddress: string;
	remarks: string;
	forDepartment: string;
	preparedBy: string;
	preparedByLabel: string;
	preparedBySignatureFileName: string;
	preparedBySignatureImageUrl: string;
	approvedBy: string;
	approvedByLabel: string;
	approvedBySignatureFileName: string;
	approvedBySignatureImageUrl: string;
	items: PurchaseRequestItem[];
};

export type PurchaseRequestFormValues = Omit<PurchaseRequestRecord, "id">;

export type PurchaseRequestFormMode = "add" | "edit" | "view";

export type PurchaseRequestFormErrors = Partial<
	Record<
		| keyof Omit<PurchaseRequestFormValues, "items">
		| "items",
		string
	>
>;

export type PurchaseRequestUpdateField = <
	TKey extends keyof PurchaseRequestFormValues,
>(
	field: TKey,
	value: PurchaseRequestFormValues[TKey],
) => void;

export type PurchaseRequestFormSignatoryOption = FormSignatoryRow & {
	branch: string;
	setupId: string;
};
