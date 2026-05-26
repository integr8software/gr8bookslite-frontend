import type {
	MasterInvoicePaymentMethod,
	MasterInvoiceRecord,
} from "@/app/src/types/master/invoices/MasterInvoiceTypes";

export const MasterInvoiceRecords: MasterInvoiceRecord[] = [
	{
		amount: 9300,
		availedItem: "Growth Suite monthly renewal with 3 extra users",
		billingPeriod: "May 2026",
		id: "inv-gr8books-2026-05",
		invoiceNo: "INV-2026-0501",
		ownerName: "John Dela Cruz",
		paymentMethod: "Card",
		planName: "Growth Suite",
		referenceNo: "PAY-8J2K91",
		status: "Paid",
		subscriberId: "sub-gr8books",
		subscriberName: "Gr8Books HQ",
		transactionDate: "2026-05-01",
	},
	{
		amount: 2900,
		availedItem: "Core Books trial conversion",
		billingPeriod: "May 2026",
		id: "inv-demo-trading-2026-05",
		invoiceNo: "INV-2026-0502",
		ownerName: "Jane Santos",
		paymentMethod: "GCash",
		planName: "Core Books",
		referenceNo: "GC-199382",
		status: "Pending",
		subscriberId: "sub-demo-trading",
		subscriberName: "Demo Trading Corp.",
		transactionDate: "2026-05-05",
	},
	{
		amount: 18820,
		availedItem: "Enterprise Ops annual subscription balance",
		billingPeriod: "May 2026 - Apr 2027",
		id: "inv-laguna-2026-05",
		invoiceNo: "INV-2026-0503",
		ownerName: "Emily Lim",
		paymentMethod: "Bank Transfer",
		planName: "Enterprise Ops",
		referenceNo: "BT-771204",
		status: "Paid",
		subscriberId: "sub-laguna-manufacturing",
		subscriberName: "Laguna Manufacturing Inc.",
		transactionDate: "2026-05-10",
	},
	{
		amount: 25240,
		availedItem: "Enterprise Ops quarterly subscription renewal",
		billingPeriod: "May 2026 - Jul 2026",
		id: "inv-visayas-2026-05",
		invoiceNo: "INV-2026-0504",
		ownerName: "Miguel Reyes",
		paymentMethod: "Maya",
		planName: "Enterprise Ops",
		referenceNo: "MY-440912",
		status: "Failed",
		subscriberId: "sub-visayas-retail",
		subscriberName: "Visayas Retail Group",
		transactionDate: "2026-05-10",
	},
	{
		amount: 1500,
		availedItem: "Additional branch access for Growth Suite",
		billingPeriod: "Apr 2026",
		id: "inv-gr8books-addon-2026-04",
		invoiceNo: "INV-2026-0417",
		ownerName: "John Dela Cruz",
		paymentMethod: "Manual Payment",
		planName: "Growth Suite",
		referenceNo: "OR-004992",
		status: "Paid",
		subscriberId: "sub-gr8books",
		subscriberName: "Gr8Books HQ",
		transactionDate: "2026-04-17",
	},
	{
		amount: 7900,
		availedItem: "Growth Suite renewal reversed after duplicate charge",
		billingPeriod: "Mar 2026",
		id: "inv-gr8books-refund-2026-03",
		invoiceNo: "INV-2026-0312",
		ownerName: "John Dela Cruz",
		paymentMethod: "Card",
		planName: "Growth Suite",
		referenceNo: "RF-231908",
		status: "Refunded",
		subscriberId: "sub-gr8books",
		subscriberName: "Gr8Books HQ",
		transactionDate: "2026-03-12",
	},
];

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
