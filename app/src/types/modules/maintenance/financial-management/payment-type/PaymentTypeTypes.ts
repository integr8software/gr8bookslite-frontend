import type {
	DisbursementPaymentClassification,
	DisbursementPaymentMethod,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export type PaymentTypeStatus = "Active" | "Inactive";
export type PaymentTypeClassification = DisbursementPaymentClassification;

export type PaymentTypeRecord = {
	description: string;
	id: string;
	paymentType: DisbursementPaymentMethod;
	type: PaymentTypeClassification;
	status: PaymentTypeStatus;
};

export type PaymentTypeFormValues = {
	description: string;
	paymentType: string;
	type: PaymentTypeClassification | "";
	status: PaymentTypeStatus;
};

export type PaymentTypeFormErrors = Partial<
	Record<keyof PaymentTypeFormValues, string>
>;

export type PaymentTypeActionMode = "add" | "edit" | "view";
