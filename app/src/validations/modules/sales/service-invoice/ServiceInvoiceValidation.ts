import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	ServiceInvoiceFormValues,
	ServiceInvoiceLineEntry,
} from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";

export type ServiceInvoiceValidationResult = {
	message?: string;
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
		};
	}

	return { isValid: true };
}

function serviceInvoiceEntryHasPostableAmount(entry: ServiceInvoiceLineEntry) {
	return (
		parseMoneyNumberInput(entry.amount) > 0 ||
		parseMoneyNumberInput(entry.netAmount) > 0 ||
		parseMoneyNumberInput(entry.grossAmount) > 0
	);
}
