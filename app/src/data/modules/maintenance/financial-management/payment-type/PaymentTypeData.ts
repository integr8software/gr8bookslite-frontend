import type {
	PaymentTypeClassification,
	PaymentTypeFormValues,
	PaymentTypeRecord,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

export const PaymentTypeOptions: PaymentTypeClassification[] = [
	"Cash",
	"With Bank",
	"Bank Transfer",
	"Debit",
];

export const PaymentTypeInitialFormValues: PaymentTypeFormValues = {
	description: "",
	paymentType: "",
	status: "Active",
	type: "",
};

export const MockPaymentTypes: PaymentTypeRecord[] = [
	{
		description: "Cash payment without additional bank details.",
		id: "payment-type-1",
		paymentType: "Cash",
		status: "Active",
		type: "Cash",
	},
	{
		description: "Bank-issued check payment requiring bank and check details.",
		id: "payment-type-2",
		paymentType: "Check",
		status: "Active",
		type: "With Bank",
	},
	{
		description: "Transfer from one bank account to a recipient bank account.",
		id: "payment-type-3",
		paymentType: "Bank Transfer",
		status: "Active",
		type: "Bank Transfer",
	},
	{
		description: "Online payment through a bank portal or digital payment channel.",
		id: "payment-type-4",
		paymentType: "Online Payment",
		status: "Active",
		type: "Bank Transfer",
	},
	{
		description: "Debit memo payment requiring bank and debit memo details.",
		id: "payment-type-5",
		paymentType: "Debit Memo",
		status: "Active",
		type: "Debit",
	},
	{
		description: "Petty cash release for reimbursements and small disbursements.",
		id: "payment-type-6",
		paymentType: "Petty Cash",
		status: "Active",
		type: "Cash",
	},
];

export function createPaymentTypeFormValues(
	record?: PaymentTypeRecord,
): PaymentTypeFormValues {
	if (!record) {
		return PaymentTypeInitialFormValues;
	}

	return {
		description: record.description,
		paymentType: record.paymentType,
		status: record.status,
		type: record.type,
	};
}

export function createPaymentTypeFromForm(
	values: PaymentTypeFormValues,
): PaymentTypeRecord {
	return {
		description: values.description.trim(),
		id: `payment-type-${Date.now()}`,
		paymentType: values.paymentType.trim(),
		status: values.status,
		type: values.type || "Cash",
	};
}

export function updatePaymentTypeFromForm(
	record: PaymentTypeRecord,
	values: PaymentTypeFormValues,
): PaymentTypeRecord {
	return {
		...record,
		description: values.description.trim(),
		paymentType: values.paymentType.trim(),
		status: values.status,
		type: values.type || record.type,
	};
}
