import type {
	PaymentTypeFormErrors,
	PaymentTypeFormValues,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

export function validatePaymentTypeForm(
	values: PaymentTypeFormValues,
): PaymentTypeFormErrors {
	const errors: PaymentTypeFormErrors = {};

	if (!values.paymentType.trim()) {
		errors.paymentType = "Payment type name is required.";
	}

	if (values.description.trim().length > 500) {
		errors.description = "Description must be 500 characters or fewer.";
	}

	if (!values.type) {
		errors.type = "Payment type category is required.";
	}

	if (!values.status) {
		errors.status = "Status is required.";
	}

	return errors;
}
