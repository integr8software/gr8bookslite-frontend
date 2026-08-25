import type { BillingInvoiceLineEntry } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import type { SalesQuotationFormValues } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";

export type SalesQuotationServicesFormValues = SalesQuotationFormValues & {
	contactNo: string;
	contactPerson: string;
	referenceNo: string;
};

export type SalesQuotationServicesRecord = {
	id: string;
	amount: number;
	formValues: SalesQuotationServicesFormValues;
	lineEntries: BillingInvoiceLineEntry[];
};
