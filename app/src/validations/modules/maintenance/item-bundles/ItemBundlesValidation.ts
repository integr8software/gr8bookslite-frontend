import type { ItemRecord } from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import type { UnitOfMeasurementRecord } from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";
import type {
	ItemBundleFormErrors,
	ItemBundleFormValues,
} from "@/app/src/types/modules/maintenance/item-bundles/ItemBundlesTypes";

export function validateItemBundleForm(
	values: ItemBundleFormValues,
	items: ItemRecord[],
	unitsOfMeasurement: UnitOfMeasurementRecord[] = [],
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
			!getItemAllowsDecimalQuantity(selectedItem, unitsOfMeasurement) &&
			!Number.isInteger(line.quantity)
		) {
			currentErrors.quantity = "This UOM requires a whole number.";
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

export function getItemAllowsDecimalQuantity(
	item?: ItemRecord,
	unitsOfMeasurement: UnitOfMeasurementRecord[] = [],
) {
	if (!item) {
		return true;
	}

	const itemUom = unitsOfMeasurement.find((uom) => uom.symbol === item.uom);

	return itemUom?.quantityMode !== "Integer";
}
