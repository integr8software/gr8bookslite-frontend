import type { ModuleDataEntryExportOption } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import type { BillingInvoiceEntriesTab } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";

export const BillingInvoiceEntryExportOptions = [
	{ id: "csv", label: "CSV", onSelect: () => undefined },
	{ id: "excel", label: "Excel", onSelect: () => undefined },
	{ id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];

export const BillingInvoiceEntryTabs = [
	{ id: "items", label: "Item Entry" },
	{ id: "accounts", label: "Accounting Entries" },
] satisfies Array<{
	id: BillingInvoiceEntriesTab;
	label: string;
}>;

export const BillingInvoiceAccountingDefaultVisibleColumnIds = [
	"accountTitle",
	"debit",
	"credit",
	"particulars",
];

export const BillingInvoiceAccountingProtectedColumnIds = new Set([
	"accountTitle",
	"debit",
	"credit",
]);
