import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	DeliveryReceiptFormValues,
	DeliveryReceiptLineEntry,
} from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";

export type DeliveryReceiptValidationResult = {
	message?: string;
	isValid: boolean;
};

export function validateDeliveryReceiptForm(
	values: DeliveryReceiptFormValues,
): DeliveryReceiptValidationResult {
	if (!values.vceCode.trim()) {
		return { isValid: false, message: "Enter the Party Code." };
	}

	if (!values.vceName.trim()) {
		return { isValid: false, message: "Select or enter the Party Name." };
	}

	if (!values.transactionNo.trim()) {
		return { isValid: false, message: "Enter the transaction number." };
	}

	if (!values.documentDate.trim()) {
		return { isValid: false, message: "Enter the document date." };
	}

	if (!values.deliveryDate.trim()) {
		return { isValid: false, message: "Enter the delivery date." };
	}

	if (!values.terms.trim()) {
		return { isValid: false, message: "Select delivery receipt terms." };
	}

	if (!values.lineEntries.some(deliveryReceiptEntryHasQuantity)) {
		return {
			isValid: false,
			message: "Add at least one delivery item with quantity.",
		};
	}

	return { isValid: true };
}

function deliveryReceiptEntryHasQuantity(entry: DeliveryReceiptLineEntry) {
	return parseMoneyNumberInput(entry.quantity) > 0;
}
