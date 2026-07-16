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

	if (!values.transactionNo.trim()) {
		return { isValid: false, message: "Enter the transaction number." };
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
			message: "Add at least one pick list row with VCE code and VCE name.",
		};
	}

	return { isValid: true };
}
