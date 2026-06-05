import { z } from "zod";
import type {
	MasterPromotionFormErrors,
	MasterPromotionFormValues,
	MasterPromotionRecord,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";

const MasterPromotionFormSchema = z
	.object({
		availabilityMode: z.enum(["One-time", "Recurring"]),
		billingCycle: z.enum([
			"Whole plan",
			"1 billing cycle",
			"2 billing cycles",
			"3 billing cycles",
			"4 billing cycles",
			"5 billing cycles",
			"6 billing cycles",
			"7 billing cycles",
			"8 billing cycles",
			"9 billing cycles",
			"10 billing cycles",
			"11 billing cycles",
			"12 billing cycles",
		]),
		code: z
			.string()
			.trim()
			.min(3, "Code must be at least 3 characters.")
			.max(24, "Code must be 24 characters or less."),
		description: z
			.string()
			.trim()
			.min(10, "Description must be at least 10 characters."),
		discountKind: z.enum(["Percent", "Fixed"]),
		expirationMode: z.enum(["With expiration", "No expiration"]),
		expiresAt: z.string().trim(),
		id: z.string().optional(),
		limitMode: z.enum(["Limited", "Unlimited"]),
		name: z.string().trim().min(3, "Name must be at least 3 characters."),
		redemptionLimit: z.number().min(0, "Limit cannot be negative."),
		recurringAvailability: z.enum([
			"First day of billing cycle",
			"First day of month",
			"First month of year",
		]),
		status: z.enum(["Active", "Draft", "Inactive"]),
		startsAt: z.string().trim(),
		targetPlanIds: z
			.array(z.string().trim().min(1))
			.min(1, "Select at least one target plan."),
		type: z.enum(["Promo Code", "Coupon", "Voucher", "Event Promo"]),
		value: z.number().positive("Discount value must be greater than 0."),
	})
	.superRefine((values, context) => {
		if (values.discountKind === "Percent" && values.value > 100) {
			context.addIssue({
				code: "custom",
				message: "Percent discounts cannot exceed 100.",
				path: ["value"],
			});
		}

		if (
			values.expirationMode === "With expiration" &&
			values.expiresAt.trim().length === 0
		) {
			context.addIssue({
				code: "custom",
				message: "Expiry date is required.",
				path: ["expiresAt"],
			});
		}

		if (values.startsAt.trim().length === 0) {
			context.addIssue({
				code: "custom",
				message: "Starting date is required.",
				path: ["startsAt"],
			});
		}

		if (
			values.startsAt.trim().length > 0 &&
			values.expirationMode === "With expiration" &&
			values.expiresAt.trim().length > 0 &&
			values.expiresAt < values.startsAt
		) {
			context.addIssue({
				code: "custom",
				message: "Expiry date cannot be earlier than the starting date.",
				path: ["expiresAt"],
			});
		}

		if (values.limitMode === "Limited" && values.redemptionLimit <= 0) {
			context.addIssue({
				code: "custom",
				message: "Limit must be greater than 0.",
				path: ["redemptionLimit"],
			});
		}
	});

export function validateMasterPromotionForm({
	records,
	values,
}: {
	records: MasterPromotionRecord[];
	values: MasterPromotionFormValues;
}) {
	const result = MasterPromotionFormSchema.safeParse(values);
	const errors = result.success
		? {}
		: zodIssuesToErrors<MasterPromotionFormErrors>(
				result.error.issues,
			);
	const normalizedCode = values.code.trim().toUpperCase();
	const hasDuplicateCode = records.some(
		(record) =>
			record.id !== values.id &&
			record.code.trim().toUpperCase() === normalizedCode,
	);

	if (hasDuplicateCode) {
		errors.code = "A promotion with this code already exists.";
	}

	return errors;
}

function zodIssuesToErrors<TErrorShape>(issues: z.ZodIssue[]) {
	return issues.reduce<Record<string, string>>((errors, issue) => {
		const key = issue.path[0];

		if (typeof key === "string" && !errors[key]) {
			errors[key] = issue.message;
		}

		return errors;
	}, {}) as TErrorShape;
}
