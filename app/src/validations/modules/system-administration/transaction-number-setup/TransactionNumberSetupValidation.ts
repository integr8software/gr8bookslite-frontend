import { z } from "zod";
import type {
	TransactionNumberSetupFormErrors,
	TransactionNumberSetupFormValues,
	TransactionNumberSetupRecord,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

const NumericDraftValueSchema = z.union([z.number(), z.literal("")]);

export const TransactionNumberSetupFormSchema = z
	.object({
		moduleCode: z.string().trim().min(1, "Select a module."),
		inputMode: z.enum(["Auto", "Manual"]),
		prefix: z
			.string()
			.trim()
			.max(40, "Prefix must be 40 characters or fewer."),
		suffix: z
			.string()
			.trim()
			.max(40, "Suffix must be 40 characters or fewer."),
		padding: NumericDraftValueSchema,
		startingNumber: NumericDraftValueSchema,
		currentNumber: NumericDraftValueSchema,
		scope: z.enum(["all", "branch", "shared"]),
		branchIds: z.array(z.string()),
		status: z.enum(["Active", "Inactive"]),
	})
	.superRefine((values, context) => {
		if (values.inputMode === "Auto" && !values.prefix.trim()) {
			context.addIssue({
				code: "custom",
				message: "Enter a prefix.",
				path: ["prefix"],
			});
		}

		if (values.inputMode === "Auto") {
			validateAutoNumberField({
				context,
				max: 12,
				message: "Padding must be a whole number between 1 and 12.",
				min: 1,
				path: "padding",
				value: values.padding,
			});
			validateAutoNumberField({
				context,
				message: "Starting number must be a whole number.",
				min: 0,
				path: "startingNumber",
				value: values.startingNumber,
			});
			validateAutoNumberField({
				context,
				message: "Current number must be a whole number.",
				min: 0,
				path: "currentNumber",
				value: values.currentNumber,
			});
		}

		if (
			values.inputMode === "Auto" &&
			typeof values.currentNumber === "number" &&
			typeof values.startingNumber === "number" &&
			values.currentNumber < values.startingNumber
		) {
			context.addIssue({
				code: "custom",
				message: "Current number cannot be lower than the starting number.",
				path: ["currentNumber"],
			});
		}

		if (values.scope === "branch" && values.branchIds.length !== 1) {
			context.addIssue({
				code: "custom",
				message: "Choose one branch for branch-specific numbering.",
				path: ["branchIds"],
			});
		}

		if (values.scope === "all" && values.branchIds.length > 0) {
			context.addIssue({
				code: "custom",
				message: "All branches do not need branch selection.",
				path: ["branchIds"],
			});
		}

		if (values.scope === "shared" && values.branchIds.length < 2) {
			context.addIssue({
				code: "custom",
				message: "Choose two or more branches for shared numbering.",
				path: ["branchIds"],
			});
		}
	});

function validateAutoNumberField({
	context,
	max,
	message,
	min,
	path,
	value,
}: {
	context: z.RefinementCtx;
	max?: number;
	message: string;
	min: number;
	path: keyof Pick<
		TransactionNumberSetupFormValues,
		"currentNumber" | "padding" | "startingNumber"
	>;
	value: number | "";
}) {
	if (
		value === "" ||
		!Number.isInteger(value) ||
		value < min ||
		(max !== undefined && value > max)
	) {
		context.addIssue({
			code: "custom",
			message,
			path: [path],
		});
	}
}

export function validateTransactionNumberSetupForm({
	allBranchIds,
	currentRecordId,
	existingRecords,
	values,
}: {
	allBranchIds: string[];
	currentRecordId?: string;
	existingRecords: TransactionNumberSetupRecord[];
	values: TransactionNumberSetupFormValues;
}) {
	const result = TransactionNumberSetupFormSchema.safeParse(values);
	const errors: TransactionNumberSetupFormErrors = {};

	if (!result.success) {
		result.error.issues.forEach((issue) => {
			const field = issue.path[0] as
				| keyof TransactionNumberSetupFormErrors
				| undefined;

			if (field) {
				errors[field] = issue.message;
			}
		});
	}

	if (
		values.status === "Active" &&
		values.moduleCode &&
		hasOverlappingActiveSetup({
			allBranchIds,
			currentRecordId,
			existingRecords,
			values,
		})
	) {
		errors.branchIds =
			"An active setup already covers this module and branch selection.";
	}

	return errors;
}

function hasOverlappingActiveSetup({
	allBranchIds,
	currentRecordId,
	existingRecords,
	values,
}: {
	allBranchIds: string[];
	currentRecordId?: string;
	existingRecords: TransactionNumberSetupRecord[];
	values: TransactionNumberSetupFormValues;
}) {
	const nextCoverage = getCoverageIds(values, allBranchIds);

	return existingRecords.some((record) => {
		if (
			record.id === currentRecordId ||
			record.status !== "Active" ||
			record.moduleCode !== values.moduleCode
		) {
			return false;
		}

		const currentCoverage = getCoverageIds(record, allBranchIds);

		return currentCoverage.some((branchId) => nextCoverage.includes(branchId));
	});
}

function getCoverageIds(
	values: Pick<TransactionNumberSetupFormValues, "branchIds" | "scope">,
	allBranchIds: string[],
) {
	if (values.scope === "all") {
		return allBranchIds;
	}

	return values.branchIds;
}
