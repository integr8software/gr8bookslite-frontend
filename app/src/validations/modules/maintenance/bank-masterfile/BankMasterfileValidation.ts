import type {
	BankMasterfileFormErrors,
	BankMasterfileFormValues,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";

export function validateBankMasterfileForm(
	values: BankMasterfileFormValues,
): BankMasterfileFormErrors {
	const errors: BankMasterfileFormErrors = {};

	if (!values.bankName.trim()) {
		errors.bankName = "Bank is required.";
	}

	if (!values.accountNumber.trim()) {
		errors.accountNumber = "Account number is required.";
	}

	if (!values.currencyCode.trim()) {
		errors.currencyCode = "Currency is required.";
	}

	if (
		values.currencyExchangeRate.trim() &&
		Number.isNaN(Number(values.currencyExchangeRate))
	) {
		errors.currencyExchangeRate = "Exchange rate must be numeric.";
	}

	if (values.seriesDigits.trim()) {
		const digits = Number(values.seriesDigits);

		if (!Number.isInteger(digits) || digits < 1) {
			errors.seriesDigits = "Series digits must be a positive whole number.";
		}
	}

	return errors;
}