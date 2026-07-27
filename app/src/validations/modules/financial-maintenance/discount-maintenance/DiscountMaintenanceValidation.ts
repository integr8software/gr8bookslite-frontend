import { z } from "zod";
import {
	DiscountMaintenanceStatusOptions,
	DiscountMaintenanceTypeOptions,
	DiscountMaintenanceValueTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import type {
	DiscountMaintenanceFormErrors,
	DiscountMaintenanceFormValues,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";

export const DiscountMaintenanceFormValidationSchema = z
	.object({
		name: z.string().trim().min(1, "Enter a discount name."),
		description: z
			.string()
			.trim()
			.max(500, "Description must be 500 characters or fewer."),
		type: z.enum(DiscountMaintenanceTypeOptions, {
			message: "Select Purchase or Sales.",
		}),
		discountType: z.enum(DiscountMaintenanceValueTypeOptions, {
			message: "Select discount type.",
		}),
		amount: z.string().trim().min(1, "Enter a discount value."),
		status: z.enum(DiscountMaintenanceStatusOptions, {
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

export function validateDiscountMaintenanceForm(
	values: DiscountMaintenanceFormValues,
): DiscountMaintenanceFormErrors {
	const result = DiscountMaintenanceFormValidationSchema.safeParse(values);

	return result.success ? {} : mapDiscountMaintenanceIssues(result.error.issues);
}

function mapDiscountMaintenanceIssues(issues: z.ZodIssue[]) {
	return issues.reduce<DiscountMaintenanceFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof DiscountMaintenanceFormValues | undefined;

		if (field && !errors[field]) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}

