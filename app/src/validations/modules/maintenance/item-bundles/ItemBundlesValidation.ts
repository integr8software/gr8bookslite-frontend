import { ItemUomDictionary } from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import type { ItemRecord } from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import type {
	ItemBundleFormErrors,
	ItemBundleFormValues,
} from "@/app/src/types/modules/maintenance/item-bundles/ItemBundlesTypes";

export function validateItemBundleForm(
	values: ItemBundleFormValues,
	items: ItemRecord[],
): ItemBundleFormErrors {
	const errors: ItemBundleFormErrors = {};
	const lineErrors: NonNullable<ItemBundleFormErrors["lineErrors"]> = {};

	if (!values.code.trim()) {
		errors.code = "Bundle code is required.";
	}

	if (!values.name.trim()) {
		errors.name = "Bundle name is required.";
	}

	if (values.bundlePrice <= 0) {
		errors.bundlePrice = "Bundle price must be greater than zero.";
	}

	if (values.lines.length === 0) {
		errors.lines = "Add at least one bundle item.";
	}

	values.lines.forEach((line) => {
		const selectedItem = items.find((item) => item.id === line.itemId);
		const currentErrors: Partial<Record<"itemId" | "quantity", string>> = {};

		if (!line.itemId || !selectedItem) {
			currentErrors.itemId = "Item is required.";
		}

		if (line.quantity <= 0) {
			currentErrors.quantity = "Quantity must be greater than zero.";
		} else if (
			!getItemAllowsDecimalQuantity(selectedItem) &&
			!Number.isInteger(line.quantity)
		) {
			currentErrors.quantity = "PCS quantity must be a whole number.";
		}

		if (Object.keys(currentErrors).length > 0) {
			lineErrors[line.id] = currentErrors;
		}
	});

	if (Object.keys(lineErrors).length > 0) {
		errors.lineErrors = lineErrors;
	}

	return errors;
}

export function hasItemBundleErrors(errors: ItemBundleFormErrors) {
	return Boolean(
		errors.bundlePrice ||
			errors.code ||
			errors.lines ||
			errors.name ||
			Object.keys(errors.lineErrors ?? {}).length > 0,
	);
}

export function getItemAllowsDecimalQuantity(item?: ItemRecord) {
	if (!item) {
		return true;
	}

	const itemUom = ItemUomDictionary.find((uom) => uom.code === item.uom);
	const uomCode = itemUom?.code ?? item.uom;

	return uomCode !== "PCS";
}
