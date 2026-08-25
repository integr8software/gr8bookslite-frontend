import type {
	SalesQuotationFormErrors,
	SalesQuotationFormValues,
	SalesQuotationRecord,
} from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";

export type SalesOrderFormValues = SalesQuotationFormValues & {
	contactNo: string;
	contactPerson: string;
	referenceNo: string;
};

export type SalesOrderRecord = SalesQuotationRecord & {
	contactNo: string;
	contactPerson: string;
	referenceNo: string;
};

export type SalesOrderFormMode = "add" | "edit" | "view";

export type SalesOrderFormErrors = SalesQuotationFormErrors;
