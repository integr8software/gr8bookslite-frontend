"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	createItemCategory,
	fetchItemCategories,
	updateItemCategory,
} from "@/app/src/services/modules/maintenance/item-category/ItemCategoryApi";
import { ItemCategoryQueryKeys } from "@/app/src/services/modules/maintenance/item-category/ItemCategoryQueryKeys";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import type {
	ItemCategoryFormValues,
	ItemCategoryPermissions,
	ItemCategoryStatistics,
	ItemCategoryTableRowData,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-category/ItemCategoryTypes";

type ItemCategoryStoreState = {
	categories: ItemCategoryTableRowData[];
	records: ItemSetupRecord[];
	addCategory: (
		values: ItemCategoryFormValues,
	) => Promise<ItemCategoryTableRowData>;
	updateCategory: (
		id: string,
		values: ItemCategoryFormValues,
	) => Promise<ItemCategoryTableRowData>;
	permissions: ItemCategoryPermissions;
	statistics: ItemCategoryStatistics;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
	refreshCategories: () => void;
};

const EmptyItemCategoryPermissions: ItemCategoryPermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canExport: false,
};

const ReservedRoleItemCategoryPermissions: ItemCategoryPermissions = {
	canView: true,
	canCreate: true,
	canUpdate: true,
	canExport: true,
};

const EmptyItemCategoryStatistics: ItemCategoryStatistics = {
	totalCount: 0,
	activeCount: 0,
	inactiveCount: 0,
	configuredCount: 0,
	inheritedCount: 0,
	subcategoryLockedCount: 0,
};

export function useItemCategoryStore<TSelected = ItemCategoryStoreState>(
	selector?: (state: ItemCategoryStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const categoriesQuery = useQuery({
		queryKey: ItemCategoryQueryKeys.categories(),
		queryFn: fetchItemCategories,
		retry: false,
	});
	const refreshCategories = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: ItemCategoryQueryKeys.all(),
		});
	}, [queryClient]);
	const addCategoryMutation = useMutation({
		mutationFn: createItemCategory,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ItemCategoryQueryKeys.all(),
			});
			toast.success("Item category created successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create item category. Please try again.",
			);
		},
	});
	const updateCategoryMutation = useMutation({
		mutationFn: updateItemCategory,
		onSuccess: (_, payload) => {
			const previousCategory = categoriesQuery.data?.categories.find(
				(category) => category.record.id === payload.id,
			);
			const didStatusChange =
				previousCategory &&
				previousCategory.record.status !== payload.values.status;

			void queryClient.invalidateQueries({
				queryKey: ItemCategoryQueryKeys.all(),
			});
			toast.success(
				didStatusChange
					? `Item category ${payload.values.status === "Active" ? "activated" : "deactivated"} successfully.`
					: "Item category updated successfully.",
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update item category. Please try again.",
			);
		},
	});
	const state = useMemo<ItemCategoryStoreState>(() => {
		const effectiveRole = ResolveAuthProfileEffectiveRole(
			authProfileQuery.data,
		);
		const hasReservedRoleAccess =
			effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";

		return {
			categories: categoriesQuery.data?.categories ?? [],
			records: categoriesQuery.data?.records ?? [],
			permissions: hasReservedRoleAccess
				? ReservedRoleItemCategoryPermissions
				: (categoriesQuery.data?.permissions ?? EmptyItemCategoryPermissions),
			statistics:
				categoriesQuery.data?.statistics ?? EmptyItemCategoryStatistics,
			addCategory: (values) => addCategoryMutation.mutateAsync(values),
			updateCategory: (id, values) =>
				updateCategoryMutation.mutateAsync({ id, values }),
			isLoading: categoriesQuery.isLoading,
			isRefreshing: categoriesQuery.isFetching && !categoriesQuery.isLoading,
			lastSyncedAt: categoriesQuery.dataUpdatedAt,
			isMutating:
				addCategoryMutation.isPending || updateCategoryMutation.isPending,
			refreshCategories,
		};
	}, [
		addCategoryMutation,
		authProfileQuery.data,
		categoriesQuery.data,
		categoriesQuery.dataUpdatedAt,
		categoriesQuery.isFetching,
		categoriesQuery.isLoading,
		refreshCategories,
		updateCategoryMutation,
	]);

	return selector ? selector(state) : (state as TSelected);
}
