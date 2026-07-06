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

	if (values.status === "Active" && !values.accountNumber.trim()) {
		errors.accountNumber = "Account number is required before activating.";
	}

	if (!values.accountType.trim()) {
		errors.accountType = "Account type is required.";
	}

	if (!values.currencyCode.trim()) {
		errors.currencyCode = "Currency is required.";
	}

	if (!values.seriesStart.trim()) {
		errors.seriesStart = "Series start is required.";
	}

	if (!values.seriesEnd.trim()) {
		errors.seriesEnd = "Series end is required.";
	}

	if (!values.seriesDigits.trim()) {
		errors.seriesDigits = "Series digits are required.";
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

	if (values.seriesStart.trim() && !/^\d+$/.test(values.seriesStart)) {
		errors.seriesStart = "Series start must contain digits only.";
	}

	if (values.seriesEnd.trim() && !/^\d+$/.test(values.seriesEnd)) {
		errors.seriesEnd = "Series end must contain digits only.";
	}

	if (
		/^\d+$/.test(values.seriesStart) &&
		/^\d+$/.test(values.seriesEnd) &&
		Number(values.seriesStart) > Number(values.seriesEnd)
	) {
		errors.seriesEnd = "Series end must be greater than or equal to series start.";
	}

	return errors;
}
