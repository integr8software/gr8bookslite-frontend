import { formatCurrency } from "@/app/src/utils/currency.util";
import type { Discount } from "@/app/src/types/modules/financial-maintenance/discount-management/DiscountManagementTypes";
import type { ItemBundleRecord } from "@/app/src/types/modules/item-management/item-bundles/ItemBundlesTypes";
import type { ItemPromotionFormValues, ItemPromotionListRecord, ItemPromotionRecord } from "@/app/src/types/modules/item-management/item-promotions/ItemPromotionsTypes";
import type { ItemRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";

export const MockItemPromotions: ItemPromotionRecord[] = [
	{
		id: "promo-buy-one",
		code: "PROMO-001",
		name: "Buy 1 Take 1 Receipt Roll",
		type: "Buy 1 Take 1",
		itemId: "item-thermal-roll",
		bundleId: "",
		discountId: "d_002",
		freeItemId: "item-thermal-roll",
		value: 0,
		startDate: "2026-06-01",
		endDate: "2026-06-30",
		minimumQuantity: 1,
		status: "Active",
	},
	{
		id: "promo-bundle",
		code: "PROMO-002",
		name: "Starter Bundle Discount",
		type: "Bundle Discount",
		itemId: "item-starter-bundle",
		bundleId: "bundle-office-starter",
		discountId: "d_004",
		freeItemId: "",
		value: 250,
		startDate: "2026-06-01",
		endDate: "2026-07-15",
		minimumQuantity: 1,
		status: "Active",
	},
	{
		id: "promo-vip",
		code: "PROMO-003",
		name: "VIP Paper Discount",
		type: "Percentage Discount",
		itemId: "item-paper-a4",
		bundleId: "",
		discountId: "d_003",
		freeItemId: "",
		value: 10,
		startDate: "2026-05-01",
		endDate: "2026-05-31",
		minimumQuantity: 1,
		status: "Inactive",
	},
];

export const ItemPromotionInitialFormValues: ItemPromotionFormValues = {
	code: `PROMO-${Date.now().toString().slice(-3)}`,
	bundleId: "",
	discountId: "",
	endDate: "",
	freeItemId: "",
	itemId: "",
	minimumQuantity: 1,
	name: "",
	startDate: "",
	status: "Active",
	type: "Percentage Discount",
	value: 0,
};

export function createItemPromotionListRecords({
	bundles,
	discounts,
	items,
	promotions,
}: {
	bundles: ItemBundleRecord[];
	discounts: Discount[];
	items: ItemRecord[];
	promotions: ItemPromotionRecord[];
}): ItemPromotionListRecord[] {
	return promotions.map((promotion) => {
		const item = items.find((currentItem) => currentItem.id === promotion.itemId);
		const bundle = bundles.find((currentBundle) => currentBundle.id === promotion.bundleId);
		const discount = discounts.find((currentDiscount) => currentDiscount.id === promotion.discountId);

		return {
			...promotion,
			discountManagementRule: discount
				? `Linked: ${discount.name}`
				: "No discount rule",
			item: item?.name ?? bundle?.name ?? "No item selected",
			validity:
				promotion.startDate && promotion.endDate
					? `${promotion.startDate} to ${promotion.endDate}`
					: "No date range",
			valueLabel: getItemPromotionValueLabel(promotion),
		};
	});
}

export function createItemPromotionPayload(
	values: ItemPromotionFormValues,
	existingId?: string,
): ItemPromotionRecord {
	return {
		...values,
		id: existingId ?? `promo-${Date.now()}`,
		code: values.code.trim(),
		name: values.name.trim(),
	};
}

export function getItemPromotionEffectivePrice(
	type: ItemPromotionFormValues["type"],
	sellingPrice: number,
	value: number,
) {
	if (type === "Percentage Discount") {
		return Math.max(sellingPrice - sellingPrice * (value / 100), 0);
	}

	if (type === "Fixed Discount" || type === "Bundle Discount") {
		return Math.max(sellingPrice - value, 0);
	}

	return sellingPrice;
}

function getItemPromotionValueLabel(promotion: ItemPromotionRecord) {
	if (promotion.type === "Buy 1 Take 1") {
		return "Free matching item";
	}

	if (promotion.type === "Percentage Discount") {
		return `${promotion.value}%`;
	}

	return formatCurrency(promotion.value);
}
