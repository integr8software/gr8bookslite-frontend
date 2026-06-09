import { z } from "zod";
import { TransactionNumberModuleCodes } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import type {
	TransactionNumberSetupFormErrors,
	TransactionNumberSetupFormValues,
	TransactionNumberSetupRecord,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

export const TransactionNumberSetupFormSchema = z
	.object({
		moduleCode: z.enum(TransactionNumberModuleCodes, {
			error: "Select a module.",
		}),
		inputMode: z.enum(["Auto", "Manual"]),
		prefix: z
			.string()
			.trim()
			.min(1, "Enter a prefix.")
			.max(40, "Prefix must be 40 characters or fewer."),
		padding: z
			.number()
			.int("Padding must be a whole number.")
			.min(1, "Padding must be at least 1 digit.")
			.max(12, "Padding cannot exceed 12 digits."),
		startingNumber: z
			.number()
			.int("Starting number must be a whole number.")
			.nonnegative("Starting number must not be negative."),
		currentNumber: z
			.number()
			.int("Current number must be a whole number.")
			.nonnegative("Current number must not be negative."),
		scope: z.enum(["all", "branch", "shared"]),
		branchIds: z.array(z.string()),
		status: z.enum(["Active", "Inactive"]),
		description: z.string().trim().max(180, "Description is too long."),
	})
	.superRefine((values, context) => {
		if (values.currentNumber < values.startingNumber) {
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
