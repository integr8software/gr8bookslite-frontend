import {
	calculateBillingInvoiceTotals,
	createBlankBillingInvoiceLineEntry,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import { SalesQuotationServicesStorageKey } from "@/app/src/constants/modules/sales/sales-quotation-services/SalesQuotationServicesConstants";
import {
	createSalesQuotationFormValues,
	createSalesQuotationId,
} from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import type { BillingInvoiceLineEntry } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import type {
	SalesQuotationServicesFormValues,
	SalesQuotationServicesRecord,
} from "@/app/src/types/modules/sales/sales-quotation-services/SalesQuotationServicesTypes";

export function createSalesQuotationServicesFormValues(): SalesQuotationServicesFormValues {
	return {
		...createSalesQuotationFormValues(),
		contactNo: "",
		contactPerson: "",
		referenceNo: "",
	};
}

export function createSalesQuotationServicesLineEntry(): BillingInvoiceLineEntry {
	return createBlankBillingInvoiceLineEntry();
}

export function createSalesQuotationServicesRecord(
	formValues: SalesQuotationServicesFormValues,
	lineEntries: BillingInvoiceLineEntry[],
	id = createSalesQuotationId("sqs"),
): SalesQuotationServicesRecord {
	return {
		id,
		amount: calculateBillingInvoiceTotals(lineEntries).grossAmount,
		formValues,
		lineEntries,
	};
}

export function getInitialSalesQuotationServices(): SalesQuotationServicesRecord[] {
	if (typeof window === "undefined") return [];
	try {
		const stored = window.localStorage.getItem(SalesQuotationServicesStorageKey);
		const records = stored ? (JSON.parse(stored) as SalesQuotationServicesRecord[]) : [];
		return records
			.filter((record) => Boolean(record.formValues))
			.map((record) => ({
				...record,
				formValues: {
					...record.formValues,
					contactNo: record.formValues.contactNo ?? "",
					contactPerson: record.formValues.contactPerson ?? "",
					referenceNo: record.formValues.referenceNo ?? "",
				},
			}));
	} catch {
		return [];
	}
}

export function writeSalesQuotationServices(records: SalesQuotationServicesRecord[]) {
	if (typeof window !== "undefined") {
		window.localStorage.setItem(SalesQuotationServicesStorageKey, JSON.stringify(records));
	}
}
