import {
	MasterSubscriptionCompanies,
	MasterSubscriptionVolumeRules,
	calculateMasterSubscriptionAmountLeft,
	calculateMasterSubscriptionQuote,
	getMasterSubscriptionCompanyById,
	getMasterSubscriptionPlanById,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import type {
	MasterInvoicePaymentMethod,
	MasterInvoiceRecord,
	MasterInvoiceSubscriberSummary,
} from "@/app/src/types/master/invoices/MasterInvoiceTypes";
import type {
	MasterSubscriptionCompanyRecord,
	MasterSubscriptionPlanRecord,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";


type MasterInvoiceSeed = Omit<
	MasterInvoiceRecord,
	"amount" | "ownerName" | "planId" | "planName" | "subscriberName"
> & {
	amount?: number;
};

const MasterInvoiceSeeds: MasterInvoiceSeed[] = [
	{
		availedItem: "Launch Upgrade monthly renewal with extra companies",
		billingPeriod: "Aug 2026",
		id: "inv-gr8books-2026-08",
		invoiceNo: "INV-2026-0801",
		paymentMethod: "Card",
		referenceNo: "PAY-8J2K91",
		status: "Paid",
		subscriberId: "sub-gr8books",
		transactionDate: "2026-08-01",
		transactionType: "Subscription",
	},
	{
		availedItem: "Accounting Essentials trial conversion",
		billingPeriod: "Aug 2026",
		id: "inv-demo-trading-2026-08",
		invoiceNo: "INV-2026-0802",
		paymentMethod: "GCash",
		referenceNo: "GC-199382",
		status: "Pending",
		subscriberId: "sub-demo-trading",
		transactionDate: "2026-08-05",
		transactionType: "Subscription",
	},
	{
		availedItem: "Full Suite subscription balance",
		billingPeriod: "Aug 2026 - Jul 2027",
		id: "inv-laguna-2026-08",
		invoiceNo: "INV-2026-0803",
		paymentMethod: "Bank Transfer",
		referenceNo: "BT-771204",
		status: "Paid",
		subscriberId: "sub-laguna-manufacturing",
		transactionDate: "2026-08-10",
		transactionType: "Subscription",
	},
	{
		availedItem: "Inventory Operations subscription renewal",
		billingPeriod: "Aug 2026 - Oct 2026",
		id: "inv-visayas-2026-08",
		invoiceNo: "INV-2026-0804",
		paymentMethod: "Maya",
		referenceNo: "MY-440912",
		status: "Failed",
		subscriberId: "sub-visayas-retail",
		transactionDate: "2026-08-10",
		transactionType: "Subscription",
	},
	{
		amount: 1500,
		availedItem: "Additional company access for Launch Upgrade",
		billingPeriod: "Aug 2026",
		id: "inv-gr8books-addon-2026-08",
		invoiceNo: "INV-2026-0805",
		paymentMethod: "Manual Payment",
		referenceNo: "OR-004992",
		status: "Paid",
		subscriberId: "sub-gr8books",
		transactionDate: "2026-08-12",
		transactionType: "Add-On",
	},
	{
		availedItem: "Launch Upgrade renewal reversed after duplicate charge",
		billingPeriod: "Jul 2026",
		id: "inv-gr8books-refund-2026-07",
		invoiceNo: "INV-2026-0712",
		paymentMethod: "Card",
		referenceNo: "RF-231908",
		status: "Refunded",
		subscriberId: "sub-gr8books",
		transactionDate: "2026-07-12",
		transactionType: "Refund",
	},
	{
		availedItem: "Transaction Lite credit top-up",
		billingPeriod: "Aug 2026",
		id: "inv-cebu-service-studio-2026-08",
		invoiceNo: "INV-2026-0806",
		paymentMethod: "GCash",
		referenceNo: "GC-772810",
		status: "Paid",
		subscriberId: "sub-cebu-service-studio",
		transactionDate: "2026-08-18",
		transactionType: "Top-Up",
	},
	{
		amount: 2400,
		availedItem: "Plan upgrade from Accounting to Full Suite",
		billingPeriod: "Aug 2026 - Jul 2027",
		id: "inv-demo-trading-upgrade-2026-08",
		invoiceNo: "INV-2026-0807",
		paymentMethod: "Card",
		referenceNo: "PAY-UP-8812",
		status: "Paid",
		subscriberId: "sub-demo-trading",
		transactionDate: "2026-08-14",
		transactionType: "Upgrade",
	},
	{
		amount: 850,
		availedItem: "HR & Payroll add-on module activation",
		billingPeriod: "Aug 2026",
		id: "inv-laguna-addon-2026-08",
		invoiceNo: "INV-2026-0808",
		paymentMethod: "Bank Transfer",
		referenceNo: "BT-990123",
		status: "Paid",
		subscriberId: "sub-laguna-manufacturing",
		transactionDate: "2026-08-15",
		transactionType: "Add-On",
	},
	{
		amount: 399,
		availedItem: "Inventory Operations renewal retry after failed payment",
		billingPeriod: "Aug 2026 - Oct 2026",
		id: "inv-visayas-retry-2026-08",
		invoiceNo: "INV-2026-0809",
		paymentMethod: "GCash",
		referenceNo: "GC-884521",
		status: "Pending",
		subscriberId: "sub-visayas-retail",
		transactionDate: "2026-08-16",
		transactionType: "Subscription",
	},
	{
		amount: 500,
		availedItem: "Transaction credit top-up — 500 credits",
		billingPeriod: "Aug 2026",
		id: "inv-gr8books-topup-2026-08",
		invoiceNo: "INV-2026-0810",
		paymentMethod: "Card",
		referenceNo: "PAY-TU-9012",
		status: "Paid",
		subscriberId: "sub-gr8books",
		transactionDate: "2026-08-17",
		transactionType: "Top-Up",
	},
	{
		amount: 1200,
		availedItem: "CRM add-on activation for Accounting plan",
		billingPeriod: "Aug 2026",
		id: "inv-cebu-addon-crm-2026-08",
		invoiceNo: "INV-2026-0811",
		paymentMethod: "Maya",
		referenceNo: "MY-CC-7712",
		status: "Failed",
		subscriberId: "sub-cebu-service-studio",
		transactionDate: "2026-08-19",
		transactionType: "Add-On",
	},
];

export const MasterInvoiceRecords: MasterInvoiceRecord[] =
	MasterInvoiceSeeds.map(createMasterInvoiceRecord);

export function formatMasterInvoiceCurrency(value: number) {
	return new Intl.NumberFormat("en-PH", {
		currency: "PHP",
		maximumFractionDigits: 0,
		style: "currency",
	}).format(value);
}

export function formatMasterInvoiceDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

export function getMasterInvoicePaymentMethodLabel(
	paymentMethod: MasterInvoicePaymentMethod,
) {
	return paymentMethod;
}

export function getMasterInvoicesBySubscriberId(subscriberId: string) {
	return MasterInvoiceRecords.filter(
		(record) => record.subscriberId === subscriberId,
	);
}

export function getMasterInvoiceSubscriberSummary(
	subscriberId: string,
): MasterInvoiceSubscriberSummary | undefined {
	const subscriber = getMasterSubscriptionCompanyById(subscriberId);
	if (!subscriber) return undefined;

	const invoices = getMasterInvoicesBySubscriberId(subscriberId);
	const paidInvoices = invoices.filter((i) => i.status === "Paid");
	const pendingInvoices = invoices.filter((i) => i.status === "Pending");
	const failedInvoices = invoices.filter((i) => i.status === "Failed");
	const refundedInvoices = invoices.filter((i) => i.status === "Refunded");

	const paidAmount = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
	const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
	const refundedAmount = refundedInvoices.reduce((sum, i) => sum + i.amount, 0);
	const totalAmount = invoices.reduce((sum, i) => sum + i.amount, 0);

	const sortedInvoices = [...invoices].sort(
		(a, b) =>
			new Date(b.transactionDate).getTime() -
			new Date(a.transactionDate).getTime(),
	);
	const lastPaid = sortedInvoices.find((i) => i.status === "Paid");

	const plan = getMasterSubscriptionPlanById(subscriber.planId);

	return {
		failedInvoices: failedInvoices.length,
		lastTransactionAmount: lastPaid?.amount,
		lastTransactionDate: lastPaid?.transactionDate,
		paidAmount,
		paidInvoices: paidInvoices.length,
		pendingAmount,
		pendingInvoices: pendingInvoices.length,
		planName: plan?.name ?? "Unknown plan",
		recentInvoices: sortedInvoices.slice(0, 5),
		refundedAmount,
		refundedInvoices: refundedInvoices.length,
		subscriberId: subscriber.id,
		subscriberName: subscriber.name,
		totalAmount,
		totalInvoices: invoices.length,
	};
}

export function getMasterInvoiceSubscriberSummaries(): MasterInvoiceSubscriberSummary[] {
	return MasterSubscriptionCompanies.map((subscriber) => {
		return (
			getMasterInvoiceSubscriberSummary(subscriber.id) ?? {
				failedInvoices: 0,
				paidAmount: 0,
				paidInvoices: 0,
				pendingAmount: 0,
				pendingInvoices: 0,
				planName: "Unknown plan",
				recentInvoices: [],
				refundedAmount: 0,
				refundedInvoices: 0,
				subscriberId: subscriber.id,
				subscriberName: subscriber.name,
				totalAmount: 0,
				totalInvoices: 0,
			}
		);
	});
}


function createMasterInvoiceRecord(
	seed: MasterInvoiceSeed,
): MasterInvoiceRecord {
	const subscriber = getMasterSubscriptionCompanyById(seed.subscriberId);
	const plan = subscriber
		? getMasterSubscriptionPlanById(subscriber.planId)
		: undefined;

	return {
		...seed,
		amount: seed.amount ?? getMasterInvoiceAmount(subscriber, plan),
		ownerName: subscriber?.ownerName ?? "Unknown owner",
		planId: plan?.id ?? "",
		planName: plan?.name ?? "Unknown plan",
		subscriberName: subscriber?.name ?? "Unknown subscriber",
	};
}

function getMasterInvoiceAmount(
	subscriber: MasterSubscriptionCompanyRecord | undefined,
	plan: MasterSubscriptionPlanRecord | undefined,
) {
	if (!subscriber || !plan) {
		return 0;
	}

	const quote = calculateMasterSubscriptionQuote({
		plan,
		rules: MasterSubscriptionVolumeRules.filter(
			(rule) => rule.planId === plan.id,
		),
		values: {
			branches: subscriber.branchCount,
			companies: subscriber.companyCount,
			users: subscriber.userCount,
		},
	});

	return Math.round(
		calculateMasterSubscriptionAmountLeft({
			billingCycle: subscriber.billingCycle,
			monthlyTotal: quote.total,
		}),
	);
}
