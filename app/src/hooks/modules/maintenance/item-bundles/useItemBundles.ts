"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockItemBundles } from "@/app/src/data/modules/maintenance/item-bundles/ItemBundlesData";
import { ItemBundlesQueryKeys } from "@/app/src/services/modules/maintenance/item-bundles/ItemBundlesQueryKeys";
import type { ItemBundleRecord } from "@/app/src/types/modules/maintenance/item-bundles/ItemBundlesTypes";

type ItemBundlesStoreState = {
	bundles: ItemBundleRecord[];
	addBundle: (bundle: ItemBundleRecord) => void;
	updateBundle: (bundle: ItemBundleRecord) => void;
	isLoading: boolean;
	isMutating: boolean;
	lastSyncedAt: number;
};

export function useItemBundles<TSelected = ItemBundlesStoreState>(
	selector?: (state: ItemBundlesStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const bundlesQuery = useQuery({
		queryKey: ItemBundlesQueryKeys.list(),
		queryFn: async () => MockItemBundles,
		initialData: MockItemBundles,
		retry: false,
	});

	function updateCachedBundles(
		updater: (bundles: ItemBundleRecord[]) => ItemBundleRecord[],
	) {
		queryClient.setQueryData<ItemBundleRecord[]>(
			ItemBundlesQueryKeys.list(),
			(currentBundles = MockItemBundles) => updater(currentBundles),
		);
	}

	const addBundleMutation = useMutation({
		mutationFn: async (bundle: ItemBundleRecord) => bundle,
		onSuccess: (bundle) => {
			updateCachedBundles((bundles) => [...bundles, bundle]);
			toast.success("Item bundle created.");
		},
	});

	const updateBundleMutation = useMutation({
		mutationFn: async (bundle: ItemBundleRecord) => bundle,
		onSuccess: (bundle) => {
			updateCachedBundles((bundles) =>
				bundles.map((currentBundle) =>
					currentBundle.id === bundle.id ? bundle : currentBundle,
				),
			);
			toast.success("Item bundle updated.");
		},
	});

	const state: ItemBundlesStoreState = {
		bundles: bundlesQuery.data,
		addBundle: (bundle) => addBundleMutation.mutate(bundle),
		updateBundle: (bundle) => updateBundleMutation.mutate(bundle),
		isLoading: bundlesQuery.isLoading,
		isMutating: addBundleMutation.isPending || updateBundleMutation.isPending,
		lastSyncedAt: bundlesQuery.dataUpdatedAt,
	};

	return selector ? selector(state) : (state as TSelected);
}
