import type { FormSignatoryRow } from "@/app/src/types/modules/system-administration/form-signatory/FormSignatoryTypes";

export type SalesQuotationStatus =
	| "Draft"
	| "Open"
	| "Approved"
	| "Closed"
	| "Cancelled";

export type SalesQuotationItem = {
	id: string;
	itemCode: string;
	barcode: string;
	itemName: string;
	itemCategory: string;
	quantity: number;
	uom: string;
	itemPrice: number;
	vatAmount: number;
	ewtAmount: number;
	discountAmount: number;
	vatable: "True" | "False";
	vatInclusive: "True" | "False";
	vatType: string;
	responsibilityCenter: string;
};

export type SalesQuotationRecord = {
	id: string;
	companyAddress: string;
	companyName: string;
	logoFileName: string;
	logoImageUrl: string;
	telephoneNo: string;
	vatRegTin: string;
	partyCode: string;
	partyName: string;
	transNo: string;
	prDate: string;
	status: SalesQuotationStatus;
	currency: string;
	exchangeRate: number;
	bomNo: string;
	projectCode: string;
	projectName: string;
	partyAddress: string;
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
	items: SalesQuotationItem[];
};

export type SalesQuotationFormValues = Omit<SalesQuotationRecord, "id">;

export type SalesQuotationFormMode = "add" | "edit" | "view";

export type SalesQuotationFormErrors = Partial<
	Record<
		| keyof Omit<SalesQuotationFormValues, "items">
		| "items",
		string
	>
>;

export type SalesQuotationUpdateField = <
	TKey extends keyof SalesQuotationFormValues,
>(
	field: TKey,
	value: SalesQuotationFormValues[TKey],
) => void;

export type SalesQuotationFormSignatoryOption = FormSignatoryRow & {
	branch: string;
	setupId: string;
};
