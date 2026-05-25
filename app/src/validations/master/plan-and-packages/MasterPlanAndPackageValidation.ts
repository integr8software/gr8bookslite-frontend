import { z } from "zod";
import type {
	MasterPlanAndPackageFormErrors,
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackageRecord,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

const MasterPlanAndPackageFormSchema = z
	.object({
		amount: z.number().min(0, "Amount cannot be negative."),
		baseAmount: z.number().min(0, "Base amount cannot be negative."),
		billingLabel: z.string().trim(),
		code: z
			.string()
			.trim()
			.min(3, "Code must be at least 3 characters.")
			.max(32, "Code must be 32 characters or less."),
		description: z
			.string()
			.trim()
			.min(10, "Description must be at least 10 characters."),
		features: z.string().trim().min(3, "Add at least one feature."),
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
		unitLabel: z.string().trim(),
		userAddOnPrice: z.number().min(0, "Add-on price cannot be negative."),
		userAddOnStart: z
			.number()
			.int()
			.min(1, "Add-on start must be at least 1."),
		userIncludedFree: z
			.number()
			.int()
			.min(1, "Included users must be at least 1."),
		userLimitKind: z.enum(["Fixed", "Range", "Add-on"]),
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

		if (values.pricingKind === "Transactional" && !values.unitLabel.trim()) {
			context.addIssue({
				code: "custom",
				message: "Unit label is required for transactional pricing.",
				path: ["unitLabel"],
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

			if (!values.billingLabel.trim()) {
				context.addIssue({
					code: "custom",
					message: "Billing label is required for percent-off pricing.",
					path: ["billingLabel"],
				});
			}
		}

		if (values.userLimitKind === "Range" && values.userMax < values.userMin) {
			context.addIssue({
				code: "custom",
				message: "Maximum users must be greater than or equal to minimum users.",
				path: ["userMax"],
			});
		}

		if (
			values.userLimitKind === "Add-on" &&
			values.userAddOnStart <= values.userIncludedFree
		) {
			context.addIssue({
				code: "custom",
				message: "Add-ons must start after the free user count.",
				path: ["userAddOnStart"],
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
	const normalizedCode = values.code.trim().toUpperCase();
	const hasDuplicateCode = records.some(
		(record) =>
			record.id !== values.id &&
			record.code.trim().toUpperCase() === normalizedCode,
	);

	if (hasDuplicateCode) {
		errors.code = "A plan with this code already exists.";
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
