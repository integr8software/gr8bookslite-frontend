"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { formatCurrency } from "@/app/src/utils/currency.util";
import {
	createItemPromotionPayload,
	getItemPromotionEffectivePrice,
	ItemPromotionInitialFormValues,
} from "@/app/src/data/modules/item-management/item-promotions/ItemPromotionsData";
import { MockItems } from "@/app/src/data/modules/item-management/items/ItemManagementData";
import { ItemPromotionsHref } from "@/app/src/constants/modules/item-management/item-promotions/ItemPromotionsConstants";
import { useDiscountManagementStore } from "@/app/src/hooks/modules/financial-maintenance/discount-management/useDiscountManagement";
import { useItemBundles } from "@/app/src/hooks/modules/item-management/item-bundles/useItemBundles";
import { useItemPromotions } from "@/app/src/hooks/modules/item-management/item-promotions/useItemPromotions";
import type {
	ItemPromotionFormValues,
	ItemPromotionMode,
} from "@/app/src/types/modules/item-management/item-promotions/ItemPromotionsTypes";
import {
	type ItemPromotionFormErrors,
	validateItemPromotionForm,
} from "@/app/src/validations/modules/item-management/item-promotions/ItemPromotionsValidation";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function useItemPromotionsFormPage() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const { bundles } = useItemBundles();
	const { discounts } = useDiscountManagementStore();
	const { addPromotion, promotions, updatePromotion } = useItemPromotions();
	const mode = getItemPromotionMode(pathname);
	const isReadonly = mode === "view";
	const existingPromotion = promotions.find(
		(promotion) => promotion.id === params.recordId,
	);
	const itemOptions = useMemo(
		() =>
			MockItems.filter((item) => item.status === "Active").map<AppAdvancedDropdownOption>(
				(item) => ({
					description: item.code,
					name: item.name,
					value: item.id,
				}),
			),
		[],
	);
	const bundleOptions = useMemo(
		() =>
			bundles
				.filter((bundle) => bundle.status === "Active")
				.map<AppAdvancedDropdownOption>((bundle) => ({
					description: `${bundle.code} | ${formatCurrency(bundle.bundlePrice)}`,
					name: bundle.name,
					value: bundle.id,
				})),
		[bundles],
	);
	const discountOptions = useMemo(
		() =>
			discounts
				.filter((discount) => discount.status === "Active")
				.map<AppAdvancedDropdownOption>((discount) => ({
					description: `${discount.discountType} | ${formatCurrency(discount.amount)} | ${discount.accountTitle ?? "No account"}`,
					name: discount.name,
					value: discount.id,
				})),
		[discounts],
	);
	const [values, setValues] = useState<ItemPromotionFormValues>(() =>
		existingPromotion
			? { ...existingPromotion }
			: ItemPromotionInitialFormValues,
	);
	const [errors, setErrors] = useState<ItemPromotionFormErrors>({});
	const selectedItem = MockItems.find((item) => item.id === values.itemId);
	const freeItem = MockItems.find((item) => item.id === values.freeItemId);
	const selectedDiscount = discounts.find(
		(discount) => discount.id === values.discountId,
	);
	const selectedBundle = bundles.find((bundle) => bundle.id === values.bundleId);
	const sellingPrice = selectedItem?.sellingPrice ?? 0;
	const effectivePrice = getItemPromotionEffectivePrice(
		values.type,
		sellingPrice,
		values.value,
	);

	function updateField<TKey extends keyof ItemPromotionFormValues>(
		field: TKey,
		value: ItemPromotionFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function validateBeforeSubmit() {
		const nextErrors = validateItemPromotionForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return false;
		}

		return true;
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isReadonly) {
			return;
		}

		if (!validateBeforeSubmit()) {
			return;
		}

		const payload = createItemPromotionPayload(values, existingPromotion?.id);

		if (existingPromotion) {
			updatePromotion(payload);
		} else {
			addPromotion(payload);
		}
		router.push(ItemPromotionsHref);
	}

	return {
		bundleOptions,
		effectivePrice,
		errors,
		freeItem,
		handleSubmit,
		isReadonly,
		itemOptions,
		mode,
		selectedBundle,
		selectedDiscount,
		sellingPrice,
		updateField,
		validateBeforeSubmit,
		values,
		discountOptions,
	};
}

function getItemPromotionMode(pathname: string): ItemPromotionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
