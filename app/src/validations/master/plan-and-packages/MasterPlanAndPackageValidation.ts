import { z } from "zod";
import type {
	MasterPlanAndPackageFormErrors,
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackageReductionTier,
	MasterPlanAndPackageRecord,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

const ReductionTierSchema = z.object({
	reductionPercent: z
		.number()
		.min(0, "Reduction cannot be negative.")
		.max(100, "Reduction cannot exceed 100."),
	thresholdCount: z.number().int().min(1, "Count must be at least 1."),
});

const MasterPlanAndPackageFormSchema = z
	.object({
		description: z
			.string()
			.trim()
			.min(10, "Description must be at least 10 characters."),
		featureIds: z.array(z.string()).min(1, "Select at least one module feature."),
		id: z.string().optional(),
		monthlyBasePrice: z
			.number()
			.min(0, "Monthly base price cannot be negative."),
		monthlyBranchAddOnPrice: z
			.number()
			.min(0, "Monthly branch add-on price cannot be negative."),
		monthlyBranchIncludedFree: z
			.number()
			.int()
			.min(1, "Monthly included branches must be at least 1."),
		monthlyBranchReductionTiers: z.array(ReductionTierSchema),
		monthlyPercentOff: z
			.number()
			.min(0, "Monthly percent off cannot be negative.")
			.max(100, "Monthly percent off cannot exceed 100."),
		monthlyUserAddOnPrice: z
			.number()
			.min(0, "Monthly user add-on price cannot be negative."),
		monthlyUserIncludedFree: z
			.number()
			.int()
			.min(1, "Monthly included users must be at least 1."),
		monthlyUserReductionTiers: z.array(ReductionTierSchema),
		name: z.string().trim().min(3, "Name must be at least 3 characters."),
		status: z.enum(["Active", "Draft", "Inactive"]),
		yearlyBasePrice: z
			.number()
			.min(0, "Yearly base price cannot be negative."),
		yearlyBranchAddOnPrice: z
			.number()
			.min(0, "Yearly branch add-on price cannot be negative."),
		yearlyBranchIncludedFree: z
			.number()
			.int()
			.min(1, "Yearly included branches must be at least 1."),
		yearlyBranchReductionTiers: z.array(ReductionTierSchema),
		yearlyPercentOff: z
			.number()
			.min(0, "Yearly percent off cannot be negative.")
			.max(100, "Yearly percent off cannot exceed 100."),
		yearlyUserAddOnPrice: z
			.number()
			.min(0, "Yearly user add-on price cannot be negative."),
		yearlyUserIncludedFree: z
			.number()
			.int()
			.min(1, "Yearly included users must be at least 1."),
		yearlyUserReductionTiers: z.array(ReductionTierSchema),
	})
	.superRefine((values, context) => {
		if (values.monthlyBasePrice <= 0) {
			context.addIssue({
				code: "custom",
				message: "Monthly base price must be greater than 0.",
				path: ["monthlyBasePrice"],
			});
		}

		if (values.yearlyBasePrice <= 0) {
			context.addIssue({
				code: "custom",
				message: "Yearly base price must be greater than 0.",
				path: ["yearlyBasePrice"],
			});
		}

		validateReductionTiers({
			context,
			name: "Monthly branch",
			reductionTiers: values.monthlyBranchReductionTiers,
			reductionTiersPath: "monthlyBranchReductionTiers",
		});
		validateReductionTiers({
			context,
			name: "Monthly user",
			reductionTiers: values.monthlyUserReductionTiers,
			reductionTiersPath: "monthlyUserReductionTiers",
		});
		validateReductionTiers({
			context,
			name: "Yearly branch",
			reductionTiers: values.yearlyBranchReductionTiers,
			reductionTiersPath: "yearlyBranchReductionTiers",
		});
		validateReductionTiers({
			context,
			name: "Yearly user",
			reductionTiers: values.yearlyUserReductionTiers,
			reductionTiersPath: "yearlyUserReductionTiers",
		});
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
	const hasDuplicateName = records.some(
		(record) =>
			record.id !== values.id &&
			record.name.trim().toLowerCase() === normalizedName,
	);

	if (hasDuplicateName) {
		errors.name = "A plan with this name already exists.";
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
				code: "custom",
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
				code: "custom",
				message: `${name} reduction tiers must be ordered from lowest count to highest count.`,
				path: [reductionTiersPath],
			});
		}

		if (tier.reductionPercent < previousTier.reductionPercent) {
			context.addIssue({
				code: "custom",
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
