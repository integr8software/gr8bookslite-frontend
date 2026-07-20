import type { ItemRecord } from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import type {
	ItemBundleFormValues,
	ItemBundleLine,
	ItemBundleListRecord,
	ItemBundleRecord,
} from "@/app/src/types/modules/maintenance/item-bundles/ItemBundlesTypes";

export const MockItemBundles: ItemBundleRecord[] = [
	{
		id: "bundle-office-starter",
		code: "BND-2001",
		name: "Starter Office Bundle",
		bundlePrice: 1750,
		status: "Active",
		lines: [
			{ id: "line-paper", itemId: "item-paper-a4", quantity: 5 },
			{ id: "line-roll", itemId: "item-thermal-roll", quantity: 10 },
		],
	},
	{
		id: "bundle-pos-kit",
		code: "BND-2002",
		name: "POS Counter Kit",
		bundlePrice: 1850,
		status: "Active",
		lines: [
			{ id: "line-pos-roll", itemId: "item-thermal-roll", quantity: 20 },
			{ id: "line-pos-bundle", itemId: "item-starter-bundle", quantity: 1 },
		],
	},
	{
		id: "bundle-onboarding-archive",
		code: "BND-2003",
		name: "Archived Onboarding Kit",
		bundlePrice: 950,
		status: "Inactive",
		lines: [
			{ id: "line-archive-paper", itemId: "item-paper-a4", quantity: 2 },
			{ id: "line-archive-bundle", itemId: "item-starter-bundle", quantity: 1 },
		],
	},
];

export const ItemBundleInitialFormValues: ItemBundleFormValues = {
	bundlePrice: 0,
	code: "",
	lines: [createItemBundleLine()],
	name: "",
	status: "Active",
};

export function createItemBundleLine(item?: ItemRecord): ItemBundleLine {
	return {
		id: `bundle-line-${Date.now()}-${Math.random().toString(16).slice(2)}`,
		itemId: item?.id ?? "",
		quantity: 1,
	};
}

export function createItemBundleFormValues(
	bundle: ItemBundleRecord,
): ItemBundleFormValues {
	return {
		bundlePrice: bundle.bundlePrice,
		code: bundle.code,
		lines: bundle.lines,
		name: bundle.name,
		status: bundle.status,
	};
}

export function createItemBundlePayload(
	values: ItemBundleFormValues,
	existingId?: string,
): ItemBundleRecord {
	return {
		bundlePrice: values.bundlePrice,
		code: values.code.trim(),
		id: existingId ?? `bundle-${Date.now()}`,
		lines: values.lines.map((line) => ({
			id: line.id,
			itemId: line.itemId,
			quantity: line.quantity,
		})),
		name: values.name.trim(),
		status: values.status,
	};
}

export function createItemBundleListRecords({
	bundles,
	items,
}: {
	bundles: ItemBundleRecord[];
	items: ItemRecord[];
}): ItemBundleListRecord[] {
	return bundles.map((bundle) => {
		const components = bundle.lines.map((line) => {
			const item = items.find((currentItem) => currentItem.id === line.itemId);

			return {
				cost: item?.costPrice ?? 0,
				item: item?.name ?? "Unknown item",
				quantity: line.quantity,
				sellingPrice: item?.sellingPrice ?? 0,
			};
		});
		const originalSelling = getComponentSellingTotal(components);

		return {
			...bundle,
			bundleItem: bundle.name,
			components,
			originalSelling,
			savings: Math.max(originalSelling - bundle.bundlePrice, 0),
			totalCost: components.reduce(
				(total, component) => total + component.cost * component.quantity,
				0,
			),
		};
	});
}

export function calculateItemBundleTotals(
	lines: ItemBundleLine[],
	items: ItemRecord[],
	bundlePrice: number,
) {
	const totals = lines.reduce(
		(currentTotals, line) => {
			const item = items.find((currentItem) => currentItem.id === line.itemId);

			return {
				originalCost:
					currentTotals.originalCost + line.quantity * (item?.costPrice ?? 0),
				originalSelling:
					currentTotals.originalSelling +
					line.quantity * (item?.sellingPrice ?? 0),
			};
		},
		{ originalCost: 0, originalSelling: 0 },
	);

	return { ...totals, bundleTotal: bundlePrice };
}

export function formatItemBundleComponents(
	components: ItemBundleListRecord["components"],
) {
	return components
		.map((component) => `${component.item} x${component.quantity}`)
		.join(", ");
}

function getComponentSellingTotal(
	components: ItemBundleListRecord["components"],
) {
	return components.reduce(
		(total, component) => total + component.sellingPrice * component.quantity,
		0,
	);
}
