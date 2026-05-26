import {
	MasterSubscriptionVolumeRules,
	calculateMasterSubscriptionAmountLeft,
	calculateMasterSubscriptionQuote,
	getMasterSubscriptionCompanyById,
	getMasterSubscriptionPlanById,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import type {
	MasterInvoicePaymentMethod,
	MasterInvoiceRecord,
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
		billingPeriod: "May 2026",
		id: "inv-gr8books-2026-05",
		invoiceNo: "INV-2026-0501",
		paymentMethod: "Card",
		referenceNo: "PAY-8J2K91",
		status: "Paid",
		subscriberId: "sub-gr8books",
		transactionDate: "2026-05-01",
	},
	{
		availedItem: "Accounting Essentials trial conversion",
		billingPeriod: "May 2026",
		id: "inv-demo-trading-2026-05",
		invoiceNo: "INV-2026-0502",
		paymentMethod: "GCash",
		referenceNo: "GC-199382",
		status: "Pending",
		subscriberId: "sub-demo-trading",
		transactionDate: "2026-05-05",
	},
	{
		availedItem: "Full Suite subscription balance",
		billingPeriod: "May 2026 - Apr 2027",
		id: "inv-laguna-2026-05",
		invoiceNo: "INV-2026-0503",
		paymentMethod: "Bank Transfer",
		referenceNo: "BT-771204",
		status: "Paid",
		subscriberId: "sub-laguna-manufacturing",
		transactionDate: "2026-05-10",
	},
	{
		availedItem: "Inventory Operations subscription renewal",
		billingPeriod: "May 2026 - Jul 2026",
		id: "inv-visayas-2026-05",
		invoiceNo: "INV-2026-0504",
		paymentMethod: "Maya",
		referenceNo: "MY-440912",
		status: "Failed",
		subscriberId: "sub-visayas-retail",
		transactionDate: "2026-05-10",
	},
	{
		amount: 1500,
		availedItem: "Additional company access for Launch Upgrade",
		billingPeriod: "Apr 2026",
		id: "inv-gr8books-addon-2026-04",
		invoiceNo: "INV-2026-0417",
		paymentMethod: "Manual Payment",
		referenceNo: "OR-004992",
		status: "Paid",
		subscriberId: "sub-gr8books",
		transactionDate: "2026-04-17",
	},
	{
		availedItem: "Launch Upgrade renewal reversed after duplicate charge",
		billingPeriod: "Mar 2026",
		id: "inv-gr8books-refund-2026-03",
		invoiceNo: "INV-2026-0312",
		paymentMethod: "Card",
		referenceNo: "RF-231908",
		status: "Refunded",
		subscriberId: "sub-gr8books",
		transactionDate: "2026-03-12",
	},
	{
		availedItem: "Transaction Lite transaction credit top-up",
		billingPeriod: "May 2026",
		id: "inv-cebu-service-studio-2026-05",
		invoiceNo: "INV-2026-0505",
		paymentMethod: "GCash",
		referenceNo: "GC-772810",
		status: "Paid",
		subscriberId: "sub-cebu-service-studio",
		transactionDate: "2026-05-18",
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
