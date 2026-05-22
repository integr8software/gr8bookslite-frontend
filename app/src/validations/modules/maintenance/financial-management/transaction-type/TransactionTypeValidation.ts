import type {
	TransactionTypeFormErrors,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

export function validateTransactionTypeForm(
	values: TransactionTypeFormValues,
): TransactionTypeFormErrors {
	const errors: TransactionTypeFormErrors = {};

	if (!values.type.trim()) {
		errors.type = "Enter a transaction type code.";
	}

	if (!values.description.trim()) {
		errors.description = "Enter a description.";
	}

	if (!values.accountCode.trim()) {
		errors.accountCode = "Enter an account code.";
	} else if (!/^[0-9]+$/.test(values.accountCode.trim())) {
		errors.accountCode = "Enter a valid numeric account code.";
	}

	if (!values.accountTitle.trim()) {
		errors.accountTitle = "Enter an account title.";
	}

	return errors;
}
