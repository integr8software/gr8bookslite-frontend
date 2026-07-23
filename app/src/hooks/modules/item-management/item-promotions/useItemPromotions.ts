"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockItemPromotions } from "@/app/src/data/modules/item-management/item-promotions/ItemPromotionsData";
import { ItemPromotionsQueryKeys } from "@/app/src/services/modules/item-management/item-promotions/ItemPromotionsQueryKeys";
import type { ItemPromotionRecord } from "@/app/src/types/modules/item-management/item-promotions/ItemPromotionsTypes";

type ItemPromotionsStoreState = {
	promotions: ItemPromotionRecord[];
	addPromotion: (promotion: ItemPromotionRecord) => void;
	updatePromotion: (promotion: ItemPromotionRecord) => void;
	isLoading: boolean;
	isMutating: boolean;
	lastSyncedAt: number;
};

export function useItemPromotions<TSelected = ItemPromotionsStoreState>(
	selector?: (state: ItemPromotionsStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const promotionsQuery = useQuery({
		queryKey: ItemPromotionsQueryKeys.list(),
		queryFn: async () => MockItemPromotions,
		initialData: MockItemPromotions,
		retry: false,
	});

	function updateCachedPromotions(
		updater: (promotions: ItemPromotionRecord[]) => ItemPromotionRecord[],
	) {
		queryClient.setQueryData<ItemPromotionRecord[]>(
			ItemPromotionsQueryKeys.list(),
			(currentPromotions = MockItemPromotions) => updater(currentPromotions),
		);
	}

	const addPromotionMutation = useMutation({
		mutationFn: async (promotion: ItemPromotionRecord) => promotion,
		onSuccess: (promotion) => {
			updateCachedPromotions((promotions) => [...promotions, promotion]);
			toast.success("Item promotion created.");
		},
	});

	const updatePromotionMutation = useMutation({
		mutationFn: async (promotion: ItemPromotionRecord) => promotion,
		onSuccess: (promotion) => {
			updateCachedPromotions((promotions) =>
				promotions.map((currentPromotion) =>
					currentPromotion.id === promotion.id ? promotion : currentPromotion,
				),
			);
			toast.success("Item promotion updated.");
		},
	});

	const state: ItemPromotionsStoreState = {
		promotions: promotionsQuery.data,
		addPromotion: (promotion) => addPromotionMutation.mutate(promotion),
		updatePromotion: (promotion) => updatePromotionMutation.mutate(promotion),
		isLoading: promotionsQuery.isLoading,
		isMutating:
			addPromotionMutation.isPending || updatePromotionMutation.isPending,
		lastSyncedAt: promotionsQuery.dataUpdatedAt,
	};

	return selector ? selector(state) : (state as TSelected);
}
