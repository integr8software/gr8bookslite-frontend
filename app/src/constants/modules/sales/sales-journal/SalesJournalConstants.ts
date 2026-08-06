import type { SalesJournalStatus } from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";

export const SalesJournalHref = "/sales/sales-journal";

export const SalesJournalStorageKey = "gr8books.salesJournals";

export const SalesJournalApprovedStatus: SalesJournalStatus = "Approved";
export const SalesJournalCancelledStatus: SalesJournalStatus = "Cancelled";
export const SalesJournalClosedStatus: SalesJournalStatus = "Closed";
export const SalesJournalDraftStatus: SalesJournalStatus = "Draft";
export const SalesJournalOpenStatus: SalesJournalStatus = "Open";

export const SalesJournalStatusOptions: SalesJournalStatus[] = [
	SalesJournalDraftStatus,
	SalesJournalOpenStatus,
	SalesJournalApprovedStatus,
	SalesJournalClosedStatus,
	SalesJournalCancelledStatus,
];

export const SalesJournalStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: "Draft", value: "Draft" },
	{ label: "Open", value: "Open" },
	{ label: "Approved", value: "Approved" },
	{ label: "Closed", value: "Closed" },
	{ label: "Cancelled", value: "Cancelled" },
] as const;

export const SalesJournalStatusFilters = [
	"all",
	SalesJournalDraftStatus,
	SalesJournalOpenStatus,
	SalesJournalApprovedStatus,
	SalesJournalClosedStatus,
	SalesJournalCancelledStatus,
] as const;

export const SalesJournalTablePaginationStorageKey =
	"sales.sales-journal";

	
export const SalesJournalCurrencyOptions = ["PHP", "USD", "EUR", "JPY"] as const;

export const SalesJournalVatTypeOptions = [
	"VATable",
	"VAT Exempt",
	"Zero Rated",
	"Non-VAT",
] as const;

export const SalesJournalActionCopy = {
	add: {
		title: "Add Sales Journal",
		description:
			"Encode customer journal headers and balanced debit and credit entries.",
	},
	edit: {
		title: "Edit Sales Journal",
		description:
			"Update the sales journal header and accounting distribution lines.",
	},
	view: {
		title: "View Sales Journal",
		description:
			"Review sales journal details, totals, and posting readiness.",
	},
} as const;
