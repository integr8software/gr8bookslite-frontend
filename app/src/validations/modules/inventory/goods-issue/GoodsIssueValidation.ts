import { goodsIssueEntryIsComplete } from "@/app/src/data/modules/inventory/goods-issue/GoodsIssueData";
import type { GoodsIssueFormValues } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";

export type GoodsIssueValidationResult = {
	message?: string;
	isValid: boolean;
};

export function validateGoodsIssueForm(
	values: GoodsIssueFormValues,
): GoodsIssueValidationResult {
	if (!values.transactionType.trim()) {
		return { isValid: false, message: "Select the transaction type." };
	}

	if (!values.sourceWarehouse.trim()) {
		return { isValid: false, message: "Select the source warehouse." };
	}

	if (!values.vceCode.trim()) {
		return { isValid: false, message: "Enter the Party Code." };
	}

	if (!values.vceName.trim()) {
		return { isValid: false, message: "Select or enter the Party Name." };
	}

	if (!values.transactionNo.trim()) {
		return { isValid: false, message: "Enter the GI number." };
	}

	if (!values.documentDate.trim()) {
		return { isValid: false, message: "Enter the document date." };
	}

	if (!values.lineEntries.some(goodsIssueEntryIsComplete)) {
		return {
			isValid: false,
			message: "Add at least one item with issue quantity.",
		};
	}

	return { isValid: true };
}
