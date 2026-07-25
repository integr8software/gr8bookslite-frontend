import { z } from "zod";
import {
	PaymentTypeClassificationOptions,
	PaymentTypeStatusOptions,
} from "@/app/src/constants/modules/financial-maintenance/payment-type/PaymentTypeConstants";
import type {
	PaymentTypeFormErrors,
	PaymentTypeFormValues,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";

export const PaymentTypeFormValidationSchema = z.object({
	description: z
		.string()
		.trim()
		.max(500, "Description must be 500 characters or fewer."),
	paymentType: z.string().trim().min(1, "Payment type name is required."),
	sortOrder: z
		.string()
		.trim()
		.refine((value) => /^\d+$/.test(value), {
			message: "Order must be a whole number.",
		}),
	type: z.enum(PaymentTypeClassificationOptions, {
		message: "Payment type category is required.",
	}),
	status: z.enum(PaymentTypeStatusOptions, {
		message: "Status is required.",
	}),
});

export function validatePaymentTypeForm(
	values: PaymentTypeFormValues,
): PaymentTypeFormErrors {
	const result = PaymentTypeFormValidationSchema.safeParse(values);

	return result.success ? {} : mapPaymentTypeIssues(result.error.issues);
}

function mapPaymentTypeIssues(issues: z.ZodIssue[]) {
	return issues.reduce<PaymentTypeFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof PaymentTypeFormValues | undefined;

		if (field && !errors[field]) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}

