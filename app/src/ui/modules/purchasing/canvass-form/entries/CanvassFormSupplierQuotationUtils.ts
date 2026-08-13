import type { CanvassFormItem } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { formatMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";

export const SupplierQuotationFields = [
	{
		index: 1,
		code: "supplierCode1",
		name: "supplierName1",
		cost: "unitCost1",
		vatExclusive: "vatExclusive1",
		vatInclusive: "vatInclusive1",
	},
	{
		index: 2,
		code: "supplierCode2",
		name: "supplierName2",
		cost: "unitCost2",
		vatExclusive: "vatExclusive2",
		vatInclusive: "vatInclusive2",
	},
	{
		index: 3,
		code: "supplierCode3",
		name: "supplierName3",
		cost: "unitCost3",
		vatExclusive: "vatExclusive3",
		vatInclusive: "vatInclusive3",
	},
	{
		index: 4,
		code: "supplierCode4",
		name: "supplierName4",
		cost: "unitCost4",
		vatExclusive: "vatExclusive4",
		vatInclusive: "vatInclusive4",
	},
] satisfies {
	index: number;
	code: keyof CanvassFormItem;
	name: keyof CanvassFormItem;
	cost: keyof CanvassFormItem;
	vatExclusive: keyof CanvassFormItem;
	vatInclusive: keyof CanvassFormItem;
}[];

export function getSupplierSelectionOptions(row: CanvassFormItem) {
	return SupplierQuotationFields.reduce<AppAdvancedDropdownOption[]>((options, supplier) => {
		const name = String(row[supplier.name] ?? "").trim();
		const code = String(row[supplier.code] ?? "").trim();
		const value = name || code;

		if (!value) {
			return options;
		}

		options.push({
			name: value,
			value: `${supplier.index}:${value}`,
			label: code && name && code !== name ? code : undefined,
		});

		return options;
	}, []);
}

export function getSupplierSelectionOptionValue(
	options: AppAdvancedDropdownOption[],
	selectedValue: string,
) {
	return (
		options.find((option) => option.name === selectedValue)?.value ??
		(selectedValue ? `custom:${selectedValue}` : "")
	);
}

export function getSupplierNameFromOptionValue(
	options: AppAdvancedDropdownOption[],
	optionValue: string,
) {
	return options.find((option) => option.value === optionValue)?.name ?? "";
}

export function getVisibleSupplierFields(row: CanvassFormItem) {
	const visibleSupplierCount = Math.min(
		SupplierQuotationFields.length,
		Math.max(1, Math.trunc(Number(row.supplierCount) || 1)),
	);

	return SupplierQuotationFields.slice(0, visibleSupplierCount);
}

export function updateSelectedSupplierValue(
	currentValues: string[],
	index: number,
	nextValue: string,
) {
	const nextValues = [...currentValues];
	nextValues[index] = nextValue.trim();

	return nextValues.join(", ");
}

export function splitSelectedSupplierSlots(value: string, slotCount: number) {
	const values = String(value ?? "")
		.split(",")
		.map((supplier) => supplier.trim());

	while (values.length < slotCount) {
		values.push("");
	}

	return values.slice(0, slotCount);
}

export function createRemoveSupplierUpdates(
	row: CanvassFormItem,
	removeIndex: number,
	visibleSupplierCount: number,
): Partial<CanvassFormItem> {
	const updates: Partial<CanvassFormItem> = {
		supplierCount: Math.max(1, visibleSupplierCount - 1),
	};

	for (let index = removeIndex; index <= SupplierQuotationFields.length; index += 1) {
		const current = SupplierQuotationFields[index - 1];
		const next = SupplierQuotationFields[index];

		updates[current.code] = next ? String(row[next.code] ?? "") : "";
		updates[current.name] = next ? String(row[next.name] ?? "") : "";
		updates[current.cost] = next ? Number(row[next.cost]) || 0 : 0;
		updates[current.vatExclusive] = next
			? formatMoneyNumberInput(String(row[next.vatExclusive] ?? ""))
			: "0.00";
		updates[current.vatInclusive] = next
			? formatMoneyNumberInput(String(row[next.vatInclusive] ?? ""))
			: "0.00";
	}

	const selectedSupplierSlots = splitSelectedSupplierSlots(
		row.selectedSupplier,
		visibleSupplierCount,
	);
	selectedSupplierSlots.splice(removeIndex - 1, 1);
	updates.selectedSupplier = selectedSupplierSlots.join(", ");

	return updates;
}
