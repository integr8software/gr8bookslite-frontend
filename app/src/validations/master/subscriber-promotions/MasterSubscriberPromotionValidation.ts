import { z } from "zod";
import type {
	MasterSubscriberPromotionFormErrors,
	MasterSubscriberPromotionFormValues,
} from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";

const MasterSubscriberPromotionFormSchema = z
	.object({
		assignmentMode: z.enum([
			"Chosen subscriber",
			"Condition based",
			"Multiple selected",
			"Random pick",
		]),
		conditionBillingCycles: z.array(
			z.enum(["Monthly", "Every 3 months", "Annual", "Per transaction"]),
		),
		conditionPlanIds: z.array(z.string().trim().min(1)),
		conditionStatuses: z.array(
			z.enum(["Active", "Trial", "Past Due", "Scheduled"]),
		),
		expiresAt: z.string().trim(),
		notes: z.string().trim().max(240, "Notes must be 240 characters or less."),
		promotionIds: z
			.array(z.string().trim().min(1))
			.min(1, "Select at least one promotion."),
		randomCount: z.number().int().min(1, "Random count must be at least 1."),
		startsAt: z.string().trim().min(1, "Start date is required."),
		subscriberIds: z.array(z.string().trim().min(1)),
	})
	.superRefine((values, context) => {
		if (
			values.assignmentMode === "Chosen subscriber" &&
			values.subscriberIds.length !== 1
		) {
			context.addIssue({
				code: "custom",
				message: "Choose one subscriber.",
				path: ["subscriberIds"],
			});
		}

		if (
			values.assignmentMode === "Multiple selected" &&
			values.subscriberIds.length < 2
		) {
			context.addIssue({
				code: "custom",
				message: "Select at least two subscribers.",
				path: ["subscriberIds"],
			});
		}

		if (
			values.assignmentMode === "Condition based" &&
			values.conditionPlanIds.length === 0 &&
			values.conditionStatuses.length === 0 &&
			values.conditionBillingCycles.length === 0
		) {
			context.addIssue({
				code: "custom",
				message: "Add at least one condition.",
				path: ["conditionPlanIds"],
			});
		}

		if (values.expiresAt && values.startsAt > values.expiresAt) {
			context.addIssue({
				code: "custom",
				message: "Expiry date must be after the start date.",
				path: ["expiresAt"],
			});
		}
	});

export function validateMasterSubscriberPromotionForm(
	values: MasterSubscriberPromotionFormValues,
) {
	const result = MasterSubscriberPromotionFormSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return zodIssuesToErrors<MasterSubscriberPromotionFormErrors>(
		result.error.issues,
	);
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
