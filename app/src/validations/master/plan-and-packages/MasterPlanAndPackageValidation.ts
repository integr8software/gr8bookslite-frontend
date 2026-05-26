import { z } from "zod";
import type {
	MasterPlanAndPackageFormErrors,
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackageReductionTier,
	MasterPlanAndPackageRecord,
	MasterPlanAndPackageScaleKind,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

const ScaleKindSchema = z.enum(["Range", "Add-on", "Reduction"]);
const ReductionTierSchema = z.object({
	reductionPercent: z
		.number()
		.min(0, "Reduction cannot be negative.")
		.max(100, "Reduction cannot exceed 100."),
	thresholdCount: z.number().int().min(1, "Count must be at least 1."),
});

const MasterPlanAndPackageFormSchema = z
	.object({
		amount: z.number().min(0, "Amount cannot be negative."),
		baseAmount: z.number().min(0, "Base amount cannot be negative."),
		branchAddOnPrice: z.number().min(0, "Branch add-on price cannot be negative."),
		branchIncludedFree: z
			.number()
			.int()
			.min(1, "Included branches must be at least 1."),
		branchLimitKind: ScaleKindSchema,
		branchMax: z.number().int().min(1, "Maximum branches must be at least 1."),
		branchMin: z.number().int().min(1, "Minimum branches must be at least 1."),
		branchReductionTiers: z
			.array(ReductionTierSchema)
			.min(1, "Add at least one branch reduction tier."),
		companyAddOnPrice: z.number().min(0, "Company add-on price cannot be negative."),
		companyIncludedFree: z
			.number()
			.int()
			.min(1, "Included companies must be at least 1."),
		companyLimitKind: ScaleKindSchema,
		companyMax: z.number().int().min(1, "Maximum companies must be at least 1."),
		companyMin: z.number().int().min(1, "Minimum companies must be at least 1."),
		companyReductionTiers: z
			.array(ReductionTierSchema)
			.min(1, "Add at least one company reduction tier."),
		description: z
			.string()
			.trim()
			.min(10, "Description must be at least 10 characters."),
		discountAppliesFrom: z
			.number()
			.int()
			.min(1, "First discounted billing cycle must be 1 or higher."),
		discountAppliesTo: z
			.number()
			.int()
			.min(1, "Last discounted billing cycle must be 1 or higher."),
		featureIds: z.array(z.string()).min(1, "Select at least one module feature."),
		id: z.string().optional(),
		intervalMonths: z
			.number()
			.int()
			.min(1, "Interval must be at least 1 month."),
		name: z.string().trim().min(3, "Name must be at least 3 characters."),
		percentOff: z
			.number()
			.min(0, "Percent off cannot be negative.")
			.max(100, "Percent off cannot exceed 100."),
		pricingKind: z.enum([
			"Monthly",
			"Interval",
			"Yearly",
			"Transactional",
			"Percent Off",
		]),
		status: z.enum(["Active", "Draft", "Inactive"]),
		transactionLimit: z
			.number()
			.int()
			.min(1, "Transaction amount must be at least 1."),
		transactionReset: z.enum(["Daily", "Monthly", "Yearly", "When Consumed"]),
		userAddOnPrice: z.number().min(0, "User add-on price cannot be negative."),
		userIncludedFree: z
			.number()
			.int()
			.min(1, "Included users must be at least 1."),
		userLimitKind: ScaleKindSchema,
		userMax: z.number().int().min(1, "Maximum users must be at least 1."),
		userMin: z.number().int().min(1, "Minimum users must be at least 1."),
		userReductionTiers: z
			.array(ReductionTierSchema)
			.min(1, "Add at least one user reduction tier."),
	})
	.superRefine((values, context) => {
		if (values.pricingKind !== "Percent Off" && values.amount <= 0) {
			context.addIssue({
				code: "custom",
				message: "Amount must be greater than 0.",
				path: ["amount"],
			});
		}

		if (values.pricingKind === "Percent Off") {
			if (values.baseAmount <= 0) {
				context.addIssue({
					code: "custom",
					message: "Base amount must be greater than 0.",
					path: ["baseAmount"],
				});
			}

			if (values.percentOff <= 0) {
				context.addIssue({
					code: "custom",
					message: "Percent off must be greater than 0.",
					path: ["percentOff"],
				});
			}

			if (values.discountAppliesTo < values.discountAppliesFrom) {
				context.addIssue({
					code: "custom",
					message:
						"Last discounted billing cycle must be greater than or equal to the first discounted cycle.",
					path: ["discountAppliesTo"],
				});
			}
		}

		if (values.pricingKind === "Transactional" && values.transactionLimit <= 0) {
			context.addIssue({
				code: "custom",
				message: "Transaction amount must be greater than 0.",
				path: ["transactionLimit"],
			});
		}

		validateScaleRule({
			kind: values.companyLimitKind,
			max: values.companyMax,
			maxPath: "companyMax",
			min: values.companyMin,
			name: "Company",
			reductionTiers: values.companyReductionTiers,
			reductionTiersPath: "companyReductionTiers",
			context,
		});
		validateScaleRule({
			kind: values.branchLimitKind,
			max: values.branchMax,
			maxPath: "branchMax",
			min: values.branchMin,
			name: "Branch",
			reductionTiers: values.branchReductionTiers,
			reductionTiersPath: "branchReductionTiers",
			context,
		});
		validateScaleRule({
			kind: values.userLimitKind,
			max: values.userMax,
			maxPath: "userMax",
			min: values.userMin,
			name: "User",
			reductionTiers: values.userReductionTiers,
			reductionTiersPath: "userReductionTiers",
			context,
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

function validateScaleRule({
	context,
	kind,
	max,
	maxPath,
	min,
	name,
	reductionTiers,
	reductionTiersPath,
}: {
	context: z.RefinementCtx;
	kind: MasterPlanAndPackageScaleKind;
	max: number;
	maxPath: keyof MasterPlanAndPackageFormValues;
	min: number;
	name: string;
	reductionTiers: MasterPlanAndPackageReductionTier[];
	reductionTiersPath: keyof MasterPlanAndPackageFormValues;
}) {
	if (kind === "Range" && max < min) {
		context.addIssue({
			code: "custom",
			message: `${name} range maximum must be greater than or equal to minimum.`,
			path: [maxPath],
		});
	}

	if (kind !== "Reduction") {
		return;
	}

	if (reductionTiers.length === 0) {
		context.addIssue({
			code: "custom",
			message: `Add at least one ${name.toLowerCase()} reduction tier.`,
			path: [reductionTiersPath],
		});
	}

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
