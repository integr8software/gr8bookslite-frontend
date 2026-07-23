import { z } from "zod";
import {
	DiscountManagementStatusOptions,
	DiscountManagementTypeOptions,
	DiscountManagementValueTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/discount-management/DiscountManagementConstants";
import type {
	DiscountManagementFormErrors,
	DiscountManagementFormValues,
} from "@/app/src/types/modules/financial-maintenance/discount-management/DiscountManagementTypes";

export const DiscountManagementFormValidationSchema = z
	.object({
		name: z.string().trim().min(1, "Enter a discount name."),
		description: z
			.string()
			.trim()
			.max(500, "Description must be 500 characters or fewer."),
		type: z.enum(DiscountManagementTypeOptions, {
			message: "Select Purchase or Sales.",
		}),
		discountType: z.enum(DiscountManagementValueTypeOptions, {
			message: "Select discount type.",
		}),
		amount: z.string().trim().min(1, "Enter a discount value."),
		status: z.enum(DiscountManagementStatusOptions, {
			message: "Select status.",
		}),
	})
	.superRefine((values, context) => {
		const amount = Number(values.amount);

		if (Number.isNaN(amount) || amount < 0) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Enter a valid discount value.",
				path: ["amount"],
			});
			return;
		}

		if (values.discountType === "Percentage" && amount > 100) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Enter a percentage from 0 to 100.",
				path: ["amount"],
			});
		}
	});

export function validateDiscountManagementForm(
	values: DiscountManagementFormValues,
): DiscountManagementFormErrors {
	const result = DiscountManagementFormValidationSchema.safeParse(values);

	return result.success ? {} : mapDiscountManagementIssues(result.error.issues);
}

function mapDiscountManagementIssues(issues: z.ZodIssue[]) {
	return issues.reduce<DiscountManagementFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof DiscountManagementFormValues | undefined;

		if (field && !errors[field]) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}

