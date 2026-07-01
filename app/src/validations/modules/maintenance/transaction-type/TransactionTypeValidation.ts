import type {
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/maintenance/transaction-type/TransactionTypeTypes";

export function validateTransactionTypeForm(
	values: TransactionTypeFormValues,
): TransactionTypeFormErrors {
	const errors: TransactionTypeFormErrors = {};

	if (!values.name.trim()) {
		errors.name = "Enter a transaction type name.";
	}

	if (!values.description.trim()) {
		errors.description = "Enter a description.";
	} else if (values.description.trim().length > 500) {
		errors.description = "Description must be 500 characters or fewer.";
	}

	if (values.moduleIds.length === 0) {
		errors.moduleIds = "Select at least one module.";
	}

	if (!values.accountId) {
		errors.accountId = "Select an account.";
	}

	if (!values.status) {
		errors.status = "Select status.";
	}

	return errors;
}
