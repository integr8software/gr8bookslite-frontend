import { goodsReceiptEntryIsComplete } from "@/app/src/data/modules/inventory/goods-receipt/GoodsReceiptData";
import type { GoodsReceiptFormValues } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";

export type GoodsReceiptValidationResult = {
	message?: string;
	isValid: boolean;
};

export function validateGoodsReceiptForm(
	values: GoodsReceiptFormValues,
): GoodsReceiptValidationResult {
	if (!values.transactionType.trim()) {
		return { isValid: false, message: "Select the transaction type." };
	}

	if (!values.sourceWarehouse.trim()) {
		return { isValid: false, message: "Select the destination warehouse." };
	}

	if (!values.vceCode.trim()) {
		return { isValid: false, message: "Enter the VCE code." };
	}

	if (!values.vceName.trim()) {
		return { isValid: false, message: "Select or enter the VCE name." };
	}

	if (!values.transactionNo.trim()) {
		return { isValid: false, message: "Enter the GR number." };
	}

	if (!values.documentDate.trim()) {
		return { isValid: false, message: "Enter the document date." };
	}

	if (!values.lineEntries.some(goodsReceiptEntryIsComplete)) {
		return {
			isValid: false,
			message: "Add at least one item with received quantity.",
		};
	}

	return { isValid: true };
}
