import { z } from "zod";
import type {
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";

const TransactionTypeStatusSchema = z.enum(["Active", "Inactive"], {
	message: "Select status.",
});

export const TransactionTypeFormValidationSchema = z.object({
	name: z.string().trim().min(1, "Enter an inventory transaction type name."),
	description: z
		.string()
		.trim()
		.max(500, "Description must be 500 characters or fewer."),
	moduleIds: z.array(z.string()).min(1, "Select at least one module."),
	accountId: z.string().trim().min(1, "Select an account."),
	status: TransactionTypeStatusSchema,
});

export function validateTransactionTypeForm(
	values: TransactionTypeFormValues,
): TransactionTypeFormErrors {
	const result = TransactionTypeFormValidationSchema.safeParse(values);

	return result.success ? {} : mapTransactionTypeIssues(result.error.issues);
}

function mapTransactionTypeIssues(issues: z.ZodIssue[]) {
	return issues.reduce<TransactionTypeFormErrors>((errors, issue) => {
		const field = issue.path[0] as keyof TransactionTypeFormValues | undefined;

		if (field && !errors[field]) {
			errors[field] = issue.message;
		}

		return errors;
	}, {});
}
