import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	BillingFormValues,
	BillingLineEntry,
} from "@/app/src/types/modules/sales/billing/BillingTypes";

export type BillingValidationResult = {
	message?: string;
	isValid: boolean;
};

export function validateBillingForm(
	values: BillingFormValues,
): BillingValidationResult {
	if (!values.name.trim()) {
		return { isValid: false, message: "Select or enter a customer name." };
	}

	if (!values.transactionNo.trim()) {
		return { isValid: false, message: "Enter the transaction number." };
	}

	if (!values.documentDate.trim()) {
		return { isValid: false, message: "Enter the document date." };
	}

	if (!values.lineEntries.some(billingEntryHasPostableAmount)) {
		return {
			isValid: false,
			message: "Add at least one billing line with an amount.",
		};
	}

	return { isValid: true };
}

function billingEntryHasPostableAmount(entry: BillingLineEntry) {
	return (
		parseMoneyNumberInput(entry.amount) > 0 ||
		parseMoneyNumberInput(entry.netAmount) > 0 ||
		parseMoneyNumberInput(entry.grossAmount) > 0
	);
}
