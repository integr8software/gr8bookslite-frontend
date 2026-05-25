import { z } from "zod";
import type {
	MasterPromotionFormErrors,
	MasterPromotionFormValues,
	MasterPromotionRecord,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";

const MasterPromotionFormSchema = z
	.object({
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
		expiresAt: z.string().trim().min(1, "Expiry date is required."),
		id: z.string().optional(),
		name: z.string().trim().min(3, "Name must be at least 3 characters."),
		status: z.enum(["Active", "Draft", "Inactive"]),
		target: z.string().trim().min(1, "Target plan is required."),
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
