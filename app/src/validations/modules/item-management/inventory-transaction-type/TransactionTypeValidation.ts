import { z } from "zod";
import { TransactionTypeStatusOptions } from "@/app/src/constants/modules/item-management/inventory-transaction-type/TransactionTypeConstants";
import type {
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";

const TransactionTypeStatusSchema = z.enum(TransactionTypeStatusOptions, {
	message: "Select status.",
});

export const TransactionTypeFormValidationSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Enter the name of the inventory transaction type.")
		.max(100, "Inventory transaction name must be 100 characters or fewer."),
	description: z
		.string()
		.trim()
		.max(500, "Description must be 500 characters or fewer."),
	moduleIds: z
		.array(z.string())
		.length(1, "Select either Goods Receipt or Goods Issue."),
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
