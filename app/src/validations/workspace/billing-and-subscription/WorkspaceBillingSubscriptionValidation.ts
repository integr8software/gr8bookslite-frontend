import { z } from "zod";
import type {
	WorkspacePromotionCodeFormErrors,
	WorkspacePromotionCodeFormValues,
} from "@/app/src/types/workspace/billing-and-subscription/WorkspaceBillingSubscriptionTypes";

export const WorkspacePromotionCodeSchema = z.object({
	code: z
		.string()
		.trim()
		.min(2, "Enter a coupon, voucher, or promotion code.")
		.max(32, "Codes must be 32 characters or fewer."),
});

export function validateWorkspacePromotionCode(
	values: WorkspacePromotionCodeFormValues,
): {
	errors: WorkspacePromotionCodeFormErrors;
	values?: WorkspacePromotionCodeFormValues;
} {
	const result = WorkspacePromotionCodeSchema.safeParse(values);

	if (result.success) {
		return {
			errors: {},
			values: result.data,
		};
	}

	const fieldErrors = result.error.flatten().fieldErrors;

	return {
		errors: {
			code: fieldErrors.code?.[0],
		},
	};
}

