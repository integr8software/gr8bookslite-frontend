import type {
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

export function validateTransactionTypeForm(
	values: TransactionTypeFormValues,
): TransactionTypeFormErrors {
	const errors: TransactionTypeFormErrors = {};

	if (!values.name.trim()) {
		errors.name = "Enter a transaction type name.";
	}

	if (!values.description.trim()) {
		errors.description = "Enter a description.";
	}

	if (!values.moduleId) {
		errors.moduleId = "Select a module.";
	}

	if (!values.accountId) {
		errors.accountId = "Select an account.";
	}

	if (!values.status) {
		errors.status = "Select status.";
	}

	return errors;
}
