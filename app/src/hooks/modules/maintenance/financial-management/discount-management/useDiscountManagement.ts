"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MockDiscounts } from "@/app/src/data/modules/maintenance/financial-management/discount-management/DiscountManagementData";
import type { Discount } from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";

const DiscountQueryKeys = {
	discounts: () => ["discounts"],
};

type DiscountStoreState = {
	discounts: Discount[];
	addDiscount: (discount: Discount) => void;
	updateDiscount: (discount: Discount) => void;
	deleteDiscount: (id: string) => void;
	isLoading: boolean;
	isMutating: boolean;
};

export function useDiscountManagementStore<TSelected = DiscountStoreState>(
	selector?: (state: DiscountStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const discountsQuery = useQuery({
		queryKey: DiscountQueryKeys.discounts(),
		queryFn: async () => MockDiscounts,
		initialData: MockDiscounts,
	});

	function updateCachedDiscounts(
		updater: (discounts: Discount[]) => Discount[],
	) {
		queryClient.setQueryData<Discount[]>(
			DiscountQueryKeys.discounts(),
			(current = MockDiscounts) => updater(current),
		);
	}

	const addDiscountMutation = useMutation({
		mutationFn: async (discount: Discount) => discount,
		onSuccess: (discount) => {
			updateCachedDiscounts((discounts) => [...discounts, discount]);
		},
	});

	const updateDiscountMutation = useMutation({
		mutationFn: async (discount: Discount) => discount,
		onSuccess: (discount) => {
			updateCachedDiscounts((discounts) =>
				discounts.map((currentDiscount) =>
					currentDiscount.id === discount.id ? discount : currentDiscount,
				),
			);
		},
	});

	const deleteDiscountMutation = useMutation({
		mutationFn: async (id: string) => id,
		onSuccess: (id) => {
			updateCachedDiscounts((discounts) =>
				discounts.filter((discount) => discount.id !== id),
			);
		},
	});

	const state = useMemo<DiscountStoreState>(
		() => ({
			discounts: discountsQuery.data,
			addDiscount: (discount) => addDiscountMutation.mutate(discount),
			updateDiscount: (discount) => updateDiscountMutation.mutate(discount),
			deleteDiscount: (id) => deleteDiscountMutation.mutate(id),
			isLoading: discountsQuery.isLoading,
			isMutating:
				addDiscountMutation.isPending ||
				updateDiscountMutation.isPending ||
				deleteDiscountMutation.isPending,
		}),
		[
			addDiscountMutation,
			deleteDiscountMutation,
			discountsQuery.data,
			discountsQuery.isLoading,
			updateDiscountMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
