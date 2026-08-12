import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	ServiceInvoiceAccountingEntry,
	ServiceInvoiceFormValues,
	ServiceInvoiceLineEntry,
} from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";

export type ServiceInvoiceValidationResult = {
	accountingEntryErrors?: Record<
		string,
		Partial<Record<keyof ServiceInvoiceAccountingEntry, string>>
	>;
	accountingEntries?: string;
	message?: string;
	serviceLineErrors?: Record<
		string,
		Partial<Record<keyof ServiceInvoiceLineEntry, string>>
	>;
	serviceLines?: string;
	isValid: boolean;
};

export function validateServiceInvoiceForm(
	values: ServiceInvoiceFormValues,
): ServiceInvoiceValidationResult {
	if (!values.name.trim()) {
		return { isValid: false, message: "Select or enter a customer name." };
	}

	if (!values.transactionNo.trim()) {
		return { isValid: false, message: "Enter the transaction number." };
	}

	if (!values.documentDate.trim()) {
		return { isValid: false, message: "Enter the document date." };
	}

	if (!values.lineEntries.some(serviceInvoiceEntryHasPostableAmount)) {
		return {
			isValid: false,
			message: "Add at least one service line with an amount.",
			serviceLines: "Add at least one service line with an amount.",
		};
	}

	const accountingTotals = getAccountingTotals(values.accountingEntries);
	const validation: ServiceInvoiceValidationResult = { isValid: true };

	if (values.accountingEntries.length < 2) {
		validation.isValid = false;
		validation.accountingEntries = "Add at least two accounting entries.";
	}

	if (!amountsMatch(accountingTotals.debit, accountingTotals.credit)) {
		validation.isValid = false;
		validation.accountingEntries =
			"Accounting debit and credit totals must balance.";
		validation.accountingEntryErrors = createAccountingAmountErrors(
			values.accountingEntries,
			"Debit and credit totals must balance.",
		);
	}

	if (!validation.isValid) {
		return {
			...validation,
			message:
				validation.accountingEntries ??
				validation.serviceLines ??
				"Please fix the highlighted fields.",
		};
	}

	return validation;
}

function serviceInvoiceEntryHasPostableAmount(entry: ServiceInvoiceLineEntry) {
	return (
		parseMoneyNumberInput(entry.amount) > 0 ||
		parseMoneyNumberInput(entry.netAmount) > 0 ||
		parseMoneyNumberInput(entry.grossAmount) > 0
	);
}

function getAccountingTotals(entries: ServiceInvoiceAccountingEntry[]) {
	return entries.reduce(
		(totals, entry) => ({
			credit: roundCurrency(totals.credit + Number(entry.credit || 0)),
			debit: roundCurrency(totals.debit + Number(entry.debit || 0)),
		}),
		{ credit: 0, debit: 0 },
	);
}

function createAccountingAmountErrors(
	entries: ServiceInvoiceAccountingEntry[],
	message: string,
) {
	return entries.reduce<
		NonNullable<ServiceInvoiceValidationResult["accountingEntryErrors"]>
	>((errors, entry) => {
		if (Number(entry.debit || 0) > 0 || Number(entry.credit || 0) > 0) {
			errors[entry.id] = {
				...errors[entry.id],
				credit: message,
				debit: message,
			};
		}

		return errors;
	}, {});
}

function amountsMatch(left: number, right: number) {
	return Math.abs(roundCurrency(left) - roundCurrency(right)) < 0.01;
}

function roundCurrency(value: number) {
	return Math.round(Number(value || 0) * 100) / 100;
}
