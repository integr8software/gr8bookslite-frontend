import type { ItemPromotionFormValues } from "@/app/src/types/modules/maintenance/item-promotions/ItemPromotionsTypes";

export type ItemPromotionFormErrors = Partial<Record<keyof ItemPromotionFormValues, string>>;

export function validateItemPromotionForm(values: ItemPromotionFormValues) {
	const errors: ItemPromotionFormErrors = {};

	if (!values.code.trim()) {
		errors.code = "Promotion code is required.";
	}

	if (!values.name.trim()) {
		errors.name = "Promotion name is required.";
	}

	if (!values.itemId.trim()) {
		errors.itemId = "Select the promoted item.";
	}

	if (values.type === "Bundle Discount" && !values.bundleId.trim()) {
		errors.bundleId = "Select the bundle link.";
	}

	if (values.type === "Buy 1 Take 1" && !values.freeItemId.trim()) {
		errors.freeItemId = "Select the free item.";
	}

	if (values.minimumQuantity <= 0) {
		errors.minimumQuantity = "Minimum quantity must be greater than zero.";
	}

	if (values.type !== "Buy 1 Take 1" && values.value <= 0) {
		errors.value = "Promotion value must be greater than zero.";
	}

	if (values.startDate && values.endDate && values.startDate > values.endDate) {
		errors.endDate = "End date must be after the start date.";
	}

	return errors;
}
