import type { BillingMode } from "@/app/src/data/billing/BillingTypes";
import type {
	WorkspaceBillingTransactionCategory,
	WorkspaceBillingTransactionRecord,
	WorkspaceBillingTransactionsFilters,
	WorkspaceBillingTransactionsPayload,
	WorkspaceBillingTransactionsSummary,
} from "@/app/src/types/workspace/billing-and-transactions/WorkspaceBillingTransactionsTypes";

export const WorkspaceBillingTransactionsMockPayload: WorkspaceBillingTransactionsPayload =
	{
		subscription: {
			billingMode: "AUTO",
			currentPlan: "Accounting and Inventory",
			nextBillingDate: "2026-09-15",
			renewalDate: "2026-09-15",
			status: "ACTIVE",
		},
		records: [
			record({
				amount: 499,
				category: "PLAN_CHARGE",
				date: "2026-08-15",
				description: "Accounting and Inventory monthly plan",
				id: "wbt-001",
				invoiceNo: "GBN-INV-2026-0815",
				paidDate: "2026-08-15",
				providerReference: "sub_test_8v2h1",
				status: "PAID",
			}),
			record({
				amount: 299,
				category: "ADDITIONAL_COMPANY",
				companyName: "League Of Shimay - Cebu",
				date: "2026-08-17",
				description: "Additional company workspace activation",
				id: "wbt-002",
				invoiceNo: "GBN-INV-2026-0817",
				paidDate: "2026-08-17",
				providerReference: "cs_test_company_017",
				status: "PAID",
			}),
			record({
				amount: 180,
				category: "ADDITIONAL_USER",
				companyName: "League Of Shimay",
				date: "2026-08-19",
				description: "Three additional workspace users",
				id: "wbt-003",
				invoiceNo: "GBN-INV-2026-0819",
				paidDate: null,
				status: "OPEN",
			}),
			record({
				amount: 499,
				billingMode: "MANUAL",
				category: "RENEWAL",
				date: "2026-07-15",
				description: "Manual renewal for Accounting and Inventory",
				id: "wbt-004",
				invoiceNo: "GBN-INV-2026-0715",
				paidDate: "2026-07-16",
				paymentMethod: "Hosted checkout",
				providerReference: "checkout_20260715_004",
				status: "PAID",
			}),
			record({
				amount: 99,
				category: "ADD_ON",
				companyName: "League Of Shimay",
				date: "2026-08-24",
				description: "Future add-on charge: advanced approvals pack",
				id: "wbt-005",
				invoiceNo: "GBN-INV-2026-0824",
				paidDate: null,
				providerName: null,
				providerReference: null,
				status: "PENDING",
			}),
			record({
				amount: -75,
				category: "REFUND",
				date: "2026-08-05",
				description: "Prorated refund for removed add-on seats",
				id: "wbt-006",
				invoiceNo: "GBN-CRN-2026-0805",
				paidDate: "2026-08-05",
				providerReference: "rfnd_test_075",
				status: "REFUNDED",
			}),
			record({
				amount: 499,
				category: "PAYMENT",
				date: "2026-08-15",
				description: "Auto renewal payment received",
				id: "wbt-007",
				invoiceNo: "GBN-PAY-2026-0815",
				paidDate: "2026-08-15",
				providerReference: "pay_test_0815",
				status: "PAID",
			}),
			record({
				amount: 299,
				category: "PAYMENT",
				companyName: "League Of Shimay - Cebu",
				date: "2026-08-17",
				description: "Additional company payment received",
				id: "wbt-008",
				invoiceNo: "GBN-PAY-2026-0817",
				paidDate: "2026-08-17",
				providerReference: "pay_test_0817",
				status: "PAID",
			}),
			record({
				amount: 120,
				category: "ADDITIONAL_USER",
				companyName: "League Of Shimay",
				date: "2026-07-26",
				description: "Two additional users, failed first attempt",
				id: "wbt-009",
				invoiceNo: "GBN-INV-2026-0726",
				paidDate: null,
				providerReference: "pay_failed_0726",
				status: "FAILED",
			}),
			record({
				amount: 149,
				billingMode: "MANUAL",
				category: "ADD_ON",
				companyName: "League Of Shimay",
				date: "2026-07-08",
				description: "Canceled document automation add-on order",
				id: "wbt-010",
				invoiceNo: "GBN-INV-2026-0708",
				paidDate: null,
				paymentMethod: "Hosted checkout",
				providerName: null,
				providerReference: null,
				status: "CANCELED",
			}),
		],
	};

export function getWorkspaceBillingTransactionsSummary(
	payload: WorkspaceBillingTransactionsPayload,
): WorkspaceBillingTransactionsSummary {
	const billableRecords = payload.records.filter(
		(record) => record.category !== "PAYMENT",
	);
	const paidRecords = payload.records.filter(
		(record) => record.status === "PAID" && record.category !== "PAYMENT",
	);
	const totalBilled = billableRecords.reduce(
		(total, record) => total + Math.max(record.amount, 0),
		0,
	);
	const totalPaid = paidRecords.reduce(
		(total, record) => total + Math.max(record.amount, 0),
		0,
	);

	return {
		billingMode: payload.subscription.billingMode,
		currentPlan: payload.subscription.currentPlan,
		nextBillingDate: payload.subscription.nextBillingDate,
		outstandingBalance: Math.max(totalBilled - totalPaid, 0),
		totalBilled,
		totalPaid,
	};
}

export function queryWorkspaceBillingTransactions(
	filters: WorkspaceBillingTransactionsFilters,
	records: WorkspaceBillingTransactionRecord[],
) {
	const normalizedQuery = filters.query.trim().toLowerCase();

	return records.filter((record) => {
		const matchesSection = matchesWorkspaceBillingSection(
			filters.section,
			record.category,
		);
		const matchesMode =
			filters.billingMode === "all" ||
			record.billingMode === filters.billingMode;
		const matchesStatus =
			filters.status === "all" || record.status === filters.status;
		const matchesQuery =
			!normalizedQuery ||
			[
				record.invoiceNo,
				record.companyName,
				record.description,
				record.category,
				record.billingMode,
				record.status,
				record.providerReference,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);

		return matchesSection && matchesMode && matchesStatus && matchesQuery;
	});
}

export function getRecentWorkspaceBillingTransactions(
	records: WorkspaceBillingTransactionRecord[],
) {
	return [...records]
		.sort(
			(first, second) =>
				new Date(second.date).getTime() - new Date(first.date).getTime(),
		)
		.slice(0, 5);
}

export function formatWorkspaceBillingTransactionAmount(
	amount: number,
	currencyCode = "PHP",
) {
	return new Intl.NumberFormat("en-PH", {
		currency: currencyCode,
		style: "currency",
	}).format(amount);
}

export function formatWorkspaceBillingTransactionDate(value: string | null) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (!Number.isFinite(date.getTime())) {
		return "-";
	}

	return new Intl.DateTimeFormat("en-PH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
}

export function formatWorkspaceBillingTransactionCategory(
	category: WorkspaceBillingTransactionCategory,
) {
	switch (category) {
		case "PLAN_CHARGE":
			return "Plan charge";
		case "RENEWAL":
			return "Renewal";
		case "ADDITIONAL_COMPANY":
			return "Additional company";
		case "ADDITIONAL_USER":
			return "Additional user";
		case "ADD_ON":
			return "Add-on";
		case "PAYMENT":
			return "Payment";
		case "REFUND":
			return "Refund";
	}
}

function matchesWorkspaceBillingSection(
	section: WorkspaceBillingTransactionsFilters["section"],
	category: WorkspaceBillingTransactionCategory,
) {
	if (section === "overview") {
		return true;
	}

	if (section === "payments") {
		return category === "PAYMENT" || category === "REFUND";
	}

	if (section === "invoices") {
		return category !== "PAYMENT";
	}

	return (
		category === "PLAN_CHARGE" ||
		category === "RENEWAL" ||
		category === "ADDITIONAL_COMPANY" ||
		category === "ADDITIONAL_USER" ||
		category === "ADD_ON"
	);
}

function record(
	input: Omit<
		WorkspaceBillingTransactionRecord,
		| "billingMode"
		| "billingPeriodEnd"
		| "billingPeriodStart"
		| "companyName"
		| "currencyCode"
		| "issuedDate"
		| "paymentMethod"
		| "providerName"
		| "providerReference"
	> & {
		billingMode?: BillingMode;
		billingPeriodEnd?: string | null;
		billingPeriodStart?: string | null;
		companyName?: string;
		currencyCode?: string;
		issuedDate?: string;
		paymentMethod?: string | null;
		providerName?: string | null;
		providerReference?: string | null;
	},
): WorkspaceBillingTransactionRecord {
	return {
		billingMode: input.billingMode ?? "AUTO",
		billingPeriodEnd: input.billingPeriodEnd ?? "2026-09-14",
		billingPeriodStart: input.billingPeriodStart ?? "2026-08-15",
		companyName: input.companyName ?? "League Of Shimay",
		currencyCode: input.currencyCode ?? "PHP",
		issuedDate: input.issuedDate ?? input.date,
		paymentMethod: input.paymentMethod ?? "Visa ending 4345",
		providerName: input.providerName ?? "PayMongo",
		providerReference: input.providerReference ?? null,
		...input,
	};
}
