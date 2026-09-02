import { z } from "zod";
import type {
	MasterPlanAndPackageFormErrors,
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackageReductionTier,
	MasterPlanAndPackageRecord,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

const CustomIssueCode = z.ZodIssueCode.custom;

const ReductionTierSchema = z.object({
	reductionPercent: z
		.number()
		.min(0, "Reduction cannot be negative.")
		.max(100, "Reduction cannot exceed 100."),
	thresholdCount: z.number().int().min(1, "Count must be at least 1."),
});

const MasterPlanAndPackageFormSchema = z
	.object({
		code: z.string().trim().optional(),
		description: z
			.string()
			.trim()
			.min(10, "Description must be at least 10 characters."),
		featureIds: z.array(z.string()).min(1, "Select at least one system."),
		id: z.string().optional(),
		branchAddOnPrice: z
			.number()
			.min(0, "Branch add-on price cannot be negative.")
			.optional(),
		branchIncludedFree: z
			.number()
			.int()
			.min(0, "Included branches cannot be negative.")
			.optional(),
		branchReductionTiers: z.array(ReductionTierSchema).optional(),
		hasTrial: z.boolean().optional(),
		monthlyBasePrice: z
			.number()
			.min(0, "Monthly base price cannot be negative."),
		monthlyPercentOff: z
			.number()
			.min(0, "Monthly percent off cannot be negative.")
			.max(100, "Monthly percent off cannot exceed 100."),
		name: z.string().trim().min(3, "Name must be at least 3 characters."),
		scope: z.enum(["ALL", "ONBOARDING", "ADDITIONAL_COMPANY"]),
		scopes: z
			.array(z.enum(["ALL", "ONBOARDING", "ADDITIONAL_COMPANY"]))
			.optional(),
		status: z.enum(["Active", "Draft", "Inactive"]),
		trialDays: z
			.number()
			.int()
			.min(0, "Trial days cannot be negative.")
			.max(365, "Trial days cannot exceed 365."),
		trialPrice: z
			.number()
			.min(0, "Trial price cannot be negative."),
		userAddOnPrice: z
			.number()
			.min(0, "User add-on price cannot be negative.")
			.optional(),
		userIncludedFree: z
			.number()
			.int()
			.min(0, "Included users cannot be negative.")
			.optional(),
		userReductionTiers: z.array(ReductionTierSchema).optional(),
		yearlyBasePrice: z
			.number()
			.min(0, "Yearly base price cannot be negative."),
		yearlyPercentOff: z
			.number()
			.min(0, "Yearly percent off cannot be negative.")
			.max(100, "Yearly percent off cannot exceed 100."),
	})
	.superRefine((values, context) => {
		const isTrial = Boolean(values.hasTrial || values.trialDays > 0);

		if (isTrial && values.trialDays <= 0) {
			context.addIssue({
				code: CustomIssueCode,
				message: "Trial duration must be at least 1 day.",
				path: ["trialDays"],
			});
		}

		if (values.monthlyBasePrice <= 0) {
			context.addIssue({
				code: CustomIssueCode,
				message: "Monthly price must be greater than 0.",
				path: ["monthlyBasePrice"],
			});
		}

		if (values.yearlyBasePrice <= 0) {
			context.addIssue({
				code: CustomIssueCode,
				message: "Yearly price must be greater than 0.",
				path: ["yearlyBasePrice"],
			});
		}

		if (values.branchReductionTiers && values.branchReductionTiers.length > 0) {
			validateReductionTiers({
				context,
				name: "Branch",
				reductionTiers: values.branchReductionTiers,
				reductionTiersPath: "branchReductionTiers",
			});
		}
		if (values.userReductionTiers && values.userReductionTiers.length > 0) {
			validateReductionTiers({
				context,
				name: "User",
				reductionTiers: values.userReductionTiers,
				reductionTiersPath: "userReductionTiers",
			});
		}
	});

export function validateMasterPlanAndPackageForm({
	records,
	values,
}: {
	records: MasterPlanAndPackageRecord[];
	values: MasterPlanAndPackageFormValues;
}) {
	const result = MasterPlanAndPackageFormSchema.safeParse(values);
	const errors = result.success
		? {}
		: zodIssuesToErrors<MasterPlanAndPackageFormErrors>(
				result.error.issues,
			);
	const normalizedName = values.name.trim().toLowerCase();
	const normalizedCode = values.code?.trim().toUpperCase() ?? "";
	const hasDuplicateName = records.some(
		(record) =>
			record.id !== values.id &&
			record.name.trim().toLowerCase() === normalizedName,
	);
	const hasDuplicateCode =
		Boolean(normalizedCode) &&
		records.some(
			(record) =>
				record.id !== values.id &&
				record.code.trim().toUpperCase() === normalizedCode,
		);

	if (hasDuplicateName) {
		errors.name = "A plan with this name already exists.";
	}

	if (hasDuplicateCode) {
		errors.code = "A plan with this code already exists.";
	}

	return errors;
}

function validateReductionTiers({
	context,
	name,
	reductionTiers,
	reductionTiersPath,
}: {
	context: z.RefinementCtx;
	name: string;
	reductionTiers: MasterPlanAndPackageReductionTier[];
	reductionTiersPath: keyof MasterPlanAndPackageFormValues;
}) {
	reductionTiers.forEach((tier, index) => {
		if (tier.reductionPercent <= 0) {
			context.addIssue({
				code: CustomIssueCode,
				message: `${name} reduction percent must be greater than 0.`,
				path: [reductionTiersPath],
			});
		}

		const previousTier = reductionTiers[index - 1];

		if (!previousTier) {
			return;
		}

		if (tier.thresholdCount <= previousTier.thresholdCount) {
			context.addIssue({
				code: CustomIssueCode,
				message: `${name} reduction tiers must be ordered from lowest count to highest count.`,
				path: [reductionTiersPath],
			});
		}

		if (tier.reductionPercent < previousTier.reductionPercent) {
			context.addIssue({
				code: CustomIssueCode,
				message: `${name} reduction percent should not decrease in later tiers.`,
				path: [reductionTiersPath],
			});
		}
	});
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
