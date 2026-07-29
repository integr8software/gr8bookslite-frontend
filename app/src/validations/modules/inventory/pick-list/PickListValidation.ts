import {
	pickListEntryIsComplete,
} from "@/app/src/data/modules/inventory/pick-list/PickListData";
import type { PickListFormValues } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";

export type PickListValidationResult = {
	message?: string;
	isValid: boolean;
};

export function validatePickListForm(
	values: PickListFormValues,
): PickListValidationResult {
	if (!values.deliveryDate.trim()) {
		return { isValid: false, message: "Enter the delivery date." };
	}

	if (!values.partyName.trim()) {
		return { isValid: false, message: "Enter the party name." };
	}

	if (!values.partyCode.trim()) {
		return { isValid: false, message: "Enter the party code." };
	}

	if (!values.transactionNo.trim()) {
		return { isValid: false, message: "Enter the PL number." };
	}

	if (!values.documentDate.trim()) {
		return { isValid: false, message: "Enter the document date." };
	}

	if (!values.cluster.trim()) {
		return { isValid: false, message: "Select a cluster." };
	}

	if (!values.lineEntries.some(pickListEntryIsComplete)) {
		return {
			isValid: false,
			message: "Add at least one pick list row with item code and item name.",
		};
	}

	return { isValid: true };
}
