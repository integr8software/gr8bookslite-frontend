"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import {
	createItemVariation,
	fetchItemVariations,
	updateItemVariation,
} from "@/app/src/services/modules/item-management/item-variations/ItemVariationsApi";
import { ItemVariationsQueryKeys } from "@/app/src/services/modules/item-management/item-variations/ItemVariationsQueryKeys";
import type {
	ItemVariationFormValues,
	ItemVariationRecord,
	ItemVariationsPermissions,
	ItemVariationsStatistics,
} from "@/app/src/types/modules/item-management/item-variations/ItemVariationsTypes";

type ItemVariationsStoreState = {
	variations: ItemVariationRecord[];
	addVariation: (
		values: ItemVariationFormValues,
	) => Promise<ItemVariationRecord>;
	updateVariation: (
		variation: ItemVariationRecord,
	) => Promise<ItemVariationRecord>;
	permissions: ItemVariationsPermissions;
	statistics: ItemVariationsStatistics;
	isLoading: boolean;
	isLoadError: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	loadErrorMessage: string | null;
	isMutating: boolean;
	refreshVariations: () => void;
};

const EmptyItemVariationsPermissions: ItemVariationsPermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canExport: false,
	canImport: false,
};

const ReservedRoleItemVariationsPermissions: ItemVariationsPermissions = {
	canView: true,
	canCreate: true,
	canUpdate: true,
	canExport: true,
	canImport: true,
};

const EmptyItemVariationsStatistics: ItemVariationsStatistics = {
	totalVariations: 0,
	activeVariations: 0,
	inactiveVariations: 0,
	totalValues: 0,
	activeValues: 0,
	inactiveValues: 0,
};

export function useItemVariationsStore<TSelected = ItemVariationsStoreState>(
	selector?: (state: ItemVariationsStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const variationsQuery = useQuery({
		queryKey: ItemVariationsQueryKeys.variations(),
		queryFn: fetchItemVariations,
		retry: false,
	});
	const refreshVariations = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: ItemVariationsQueryKeys.all(),
		});
	}, [queryClient]);

	useEffect(() => {
		if (!variationsQuery.isError) {
			return;
		}

		toast.error(
			variationsQuery.error instanceof Error
				? variationsQuery.error.message
				: "Could not load item variations.",
		);
	}, [variationsQuery.error, variationsQuery.isError]);

	const addVariationMutation = useMutation({
		mutationFn: createItemVariation,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ItemVariationsQueryKeys.all(),
			});
			toast.success("Item variation created successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create item variation. Please try again.",
			);
		},
	});

	const updateVariationMutation = useMutation({
		mutationFn: updateItemVariation,
		onSuccess: (_, updatedVariation) => {
			const previousVariation = variationsQuery.data?.variations.find(
				(variation) => variation.id === updatedVariation.id,
			);
			const didStatusChange =
				previousVariation &&
				previousVariation.status !== updatedVariation.status;

			void queryClient.invalidateQueries({
				queryKey: ItemVariationsQueryKeys.all(),
			});
			toast.success(
				didStatusChange
					? `Item variation ${updatedVariation.status === "Active" ? "activated" : "deactivated"} successfully.`
					: "Item variation updated successfully.",
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update item variation. Please try again.",
			);
		},
	});

	const state = useMemo<ItemVariationsStoreState>(() => {
		const effectiveRole = ResolveAuthProfileEffectiveRole(
			authProfileQuery.data,
		);
		const hasReservedRoleAccess =
			effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";

		return {
			addVariation: (values) => addVariationMutation.mutateAsync(values),
			variations: variationsQuery.data?.variations ?? [],
			isLoading: variationsQuery.isLoading,
			isLoadError: variationsQuery.isError,
			isMutating:
				addVariationMutation.isPending || updateVariationMutation.isPending,
			isRefreshing:
				variationsQuery.isFetching && !variationsQuery.isLoading,
			lastSyncedAt: variationsQuery.dataUpdatedAt,
			loadErrorMessage:
				variationsQuery.error instanceof Error
					? variationsQuery.error.message
					: variationsQuery.isError
						? "Could not load item variations."
						: null,
			permissions: hasReservedRoleAccess
				? ReservedRoleItemVariationsPermissions
				: (variationsQuery.data?.permissions ??
					EmptyItemVariationsPermissions),
			refreshVariations,
			statistics:
				variationsQuery.data?.statistics ?? EmptyItemVariationsStatistics,
			updateVariation: (variation) =>
				updateVariationMutation.mutateAsync(variation),
		};
	}, [
		addVariationMutation,
		variationsQuery.data,
		variationsQuery.dataUpdatedAt,
		variationsQuery.error,
		variationsQuery.isFetching,
		variationsQuery.isError,
		variationsQuery.isLoading,
		authProfileQuery.data,
		refreshVariations,
		updateVariationMutation,
	]);

	return selector ? selector(state) : (state as TSelected);
}
