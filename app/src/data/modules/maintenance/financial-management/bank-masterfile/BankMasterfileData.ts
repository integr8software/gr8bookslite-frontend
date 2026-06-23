import type {
	BankMasterfile,
	BankMasterfileFormValues,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";

export const BankMasterfileInitialFormValues: BankMasterfileFormValues = {
	bankName: "",
	branch: "",
	accountNumber: "",
	accountType: "Checking",
	currencyCode: "PHP",
	currencyExchangeRate: "",
	isDefault: false,
	seriesStart: "",
	seriesEnd: "",
	seriesDigits: "",
	status: "Active",
};

export function createBankMasterfileFormValues(
	bank: BankMasterfile,
): BankMasterfileFormValues {
	return {
		bankName: bank.bankName,
		branch: bank.branch,
		accountNumber: bank.accountNumber,
		accountType: bank.accountType || "Checking",
		currencyCode: bank.currencyCode || "PHP",
		currencyExchangeRate: bank.currencyExchangeRate,
		isDefault: bank.isDefault,
		seriesStart: bank.seriesStart,
		seriesEnd: bank.seriesEnd,
		seriesDigits: bank.seriesDigits,
		status: bank.status,
	};
}

export function updateBankMasterfileFromForm(
	bank: BankMasterfile,
	values: BankMasterfileFormValues,
): BankMasterfile {
	return {
		...bank,
		...values,
		bankName: values.bankName.trim(),
		branch: values.branch.trim(),
		accountNumber: values.accountNumber.trim(),
		accountType: values.accountType.trim(),
		currencyCode: values.currencyCode.trim(),
		currencyExchangeRate: values.currencyExchangeRate.trim(),
		seriesStart: values.seriesStart.trim(),
		seriesEnd: values.seriesEnd.trim(),
		seriesDigits: values.seriesDigits.trim(),
		accountName: buildBankMasterfileAccountName(values),
	};
}

export function buildBankMasterfileAccountName(
	values: Pick<BankMasterfileFormValues, "bankName" | "branch" | "accountNumber">,
) {
	return [
		"Cash in Bank",
		values.bankName.trim(),
		values.branch.trim(),
		values.accountNumber.trim(),
	]
		.filter(Boolean)
		.join(" - ");
}