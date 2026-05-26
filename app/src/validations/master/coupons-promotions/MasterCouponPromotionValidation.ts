import { z } from "zod";
import type {
	MasterCouponPromotionFormErrors,
	MasterCouponPromotionFormValues,
	MasterCouponPromotionRecord,
} from "@/app/src/types/master/coupons-promotions/MasterCouponPromotionTypes";

const MasterCouponPromotionFormSchema = z
	.object({
		code: z
			.string()
			.trim()
			.min(3, "Code must be at least 3 characters.")
			.max(24, "Code must be 24 characters or less."),
		discountKind: z.enum(["Percent", "Fixed"]),
		expiresAt: z.string().trim().min(1, "Expiry date is required."),
		name: z.string().trim().min(3, "Name must be at least 3 characters."),
		status: z.enum(["Active", "Draft", "Inactive"]),
		target: z.enum([
			"All Plans",
			"Accounting",
			"Inventory",
			"Accounting + Inventory",
			"Add-ons",
		]),
		type: z.enum(["Promo", "Coupon", "Voucher"]),
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

export function validateMasterCouponPromotionForm({
	editingRecordId,
	records,
	values,
}: {
	editingRecordId: string | null;
	records: MasterCouponPromotionRecord[];
	values: MasterCouponPromotionFormValues;
}) {
	const result = MasterCouponPromotionFormSchema.safeParse(values);
	const errors = result.success
		? {}
		: zodIssuesToErrors<MasterCouponPromotionFormErrors>(
				result.error.issues,
			);
	const normalizedCode = values.code.trim().toUpperCase();
	const hasDuplicateCode = records.some(
		(record) =>
			record.id !== editingRecordId &&
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
