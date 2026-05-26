import { z } from "zod";
import type {
	MasterSubscriptionPlanFormErrors,
	MasterSubscriptionPlanFormValues,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";

const MasterSubscriptionPlanFormSchema = z.object({
	billingCycle: z.enum([
		"Monthly",
		"Every 3 months",
		"Annual",
		"Per transaction",
	]),
	code: z
		.string()
		.trim()
		.min(2, "Code must be at least 2 characters.")
		.max(16, "Code must be 16 characters or less."),
	description: z
		.string()
		.trim()
		.min(12, "Description must be at least 12 characters."),
	includedBranches: z
		.number()
		.int()
		.min(0, "Included branches cannot be negative."),
	includedCompanies: z
		.number()
		.int()
		.min(1, "Include at least 1 company."),
	includedUsers: z.number().int().min(1, "Include at least 1 user."),
	moduleIds: z.array(z.string()).min(1, "Enable at least one module."),
	monthlyBasePrice: z.number().min(0, "Base price cannot be negative."),
	name: z
		.string()
		.trim()
		.min(3, "Plan name must be at least 3 characters."),
	pricing: z.object({
		branch: z.number().min(0, "Branch pricing cannot be negative."),
		company: z.number().min(0, "Company pricing cannot be negative."),
		user: z.number().min(0, "User pricing cannot be negative."),
	}),
	status: z.enum(["Active", "Draft", "Inactive"]),
});

export function validateMasterSubscriptionPlanForm(
	values: MasterSubscriptionPlanFormValues,
) {
	const result = MasterSubscriptionPlanFormSchema.safeParse(values);

	if (result.success) {
		return {};
	}

	return zodIssuesToErrors<MasterSubscriptionPlanFormErrors>(
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
