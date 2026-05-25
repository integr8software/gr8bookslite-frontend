import { z } from "zod";
import type {
	MasterPlanAndPackageFormErrors,
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackageRecord,
	MasterPlanAndPackageScaleKind,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

const ScaleKindSchema = z.enum(["Fixed", "Range", "Add-on"]);

const MasterPlanAndPackageFormSchema = z
	.object({
		amount: z.number().min(0, "Amount cannot be negative."),
		baseAmount: z.number().min(0, "Base amount cannot be negative."),
		branchAddOnPrice: z.number().min(0, "Branch add-on price cannot be negative."),
		branchAddOnStart: z
			.number()
			.int()
			.min(1, "Branch add-on start must be at least 1."),
		branchIncludedFree: z
			.number()
			.int()
			.min(1, "Included branches must be at least 1."),
		branchLimitKind: ScaleKindSchema,
		branchMax: z.number().int().min(1, "Maximum branches must be at least 1."),
		branchMin: z.number().int().min(1, "Minimum branches must be at least 1."),
		companyAddOnPrice: z.number().min(0, "Company add-on price cannot be negative."),
		companyAddOnStart: z
			.number()
			.int()
			.min(1, "Company add-on start must be at least 1."),
		companyIncludedFree: z
			.number()
			.int()
			.min(1, "Included companies must be at least 1."),
		companyLimitKind: ScaleKindSchema,
		companyMax: z.number().int().min(1, "Maximum companies must be at least 1."),
		companyMin: z.number().int().min(1, "Minimum companies must be at least 1."),
		description: z
			.string()
			.trim()
			.min(10, "Description must be at least 10 characters."),
		discountAppliesFrom: z
			.number()
			.int()
			.min(1, "Discount range must start at 1 or higher."),
		discountAppliesTo: z
			.number()
			.int()
			.min(1, "Discount range must end at 1 or higher."),
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
		userAddOnPrice: z.number().min(0, "User add-on price cannot be negative."),
		userAddOnStart: z
			.number()
			.int()
			.min(1, "User add-on start must be at least 1."),
		userIncludedFree: z
			.number()
			.int()
			.min(1, "Included users must be at least 1."),
		userLimitKind: ScaleKindSchema,
		userMax: z.number().int().min(1, "Maximum users must be at least 1."),
		userMin: z.number().int().min(1, "Minimum users must be at least 1."),
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
					message: "Discount range end must be greater than or equal to start.",
					path: ["discountAppliesTo"],
				});
			}
		}

		validateScaleRule({
			addOnStart: values.companyAddOnStart,
			includedFree: values.companyIncludedFree,
			kind: values.companyLimitKind,
			max: values.companyMax,
			maxPath: "companyMax",
			min: values.companyMin,
			name: "Company",
			path: "companyAddOnStart",
			context,
		});
		validateScaleRule({
			addOnStart: values.branchAddOnStart,
			includedFree: values.branchIncludedFree,
			kind: values.branchLimitKind,
			max: values.branchMax,
			maxPath: "branchMax",
			min: values.branchMin,
			name: "Branch",
			path: "branchAddOnStart",
			context,
		});
		validateScaleRule({
			addOnStart: values.userAddOnStart,
			includedFree: values.userIncludedFree,
			kind: values.userLimitKind,
			max: values.userMax,
			maxPath: "userMax",
			min: values.userMin,
			name: "User",
			path: "userAddOnStart",
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
	addOnStart,
	context,
	includedFree,
	kind,
	max,
	maxPath,
	min,
	name,
	path,
}: {
	addOnStart: number;
	context: z.RefinementCtx;
	includedFree: number;
	kind: MasterPlanAndPackageScaleKind;
	max: number;
	maxPath: keyof MasterPlanAndPackageFormValues;
	min: number;
	name: string;
	path: keyof MasterPlanAndPackageFormValues;
}) {
	if (kind === "Range" && max < min) {
		context.addIssue({
			code: "custom",
			message: `${name} range maximum must be greater than or equal to minimum.`,
			path: [maxPath],
		});
	}

	if (kind === "Add-on" && addOnStart <= includedFree) {
		context.addIssue({
			code: "custom",
			message: `${name} add-ons must start after the free count.`,
			path: [path],
		});
	}
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
