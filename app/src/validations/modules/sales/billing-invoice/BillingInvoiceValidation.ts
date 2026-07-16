import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	BillingInvoiceFormValues,
	BillingInvoiceLineEntry,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";

export type BillingInvoiceValidationResult = {
	message?: string;
	isValid: boolean;
};

export function validateBillingInvoiceForm(
	values: BillingInvoiceFormValues,
): BillingInvoiceValidationResult {
	if (!values.code.trim()) {
		return { isValid: false, message: "Enter the customer code." };
	}

	if (!values.name.trim()) {
		return { isValid: false, message: "Select or enter a customer name." };
	}

	if (!values.transactionNo.trim()) {
		return { isValid: false, message: "Enter the transaction number." };
	}

	if (!values.documentDate.trim()) {
		return { isValid: false, message: "Enter the document date." };
	}

	if (!values.defaultAccount.trim()) {
		return { isValid: false, message: "Select a default debit account." };
	}

	if (!values.lineEntries.some(billingInvoiceEntryHasPostableAmount)) {
		return {
			isValid: false,
			message: "Add at least one billing line with an amount.",
		};
	}

	return { isValid: true };
}

function billingInvoiceEntryHasPostableAmount(entry: BillingInvoiceLineEntry) {
	return (
		parseMoneyNumberInput(entry.amount) > 0 ||
		parseMoneyNumberInput(entry.netAmount) > 0 ||
		parseMoneyNumberInput(entry.grossAmount) > 0
	);
}

