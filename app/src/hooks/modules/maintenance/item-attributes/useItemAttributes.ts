"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import {
	createItemAttribute,
	fetchItemAttributes,
	updateItemAttribute,
} from "@/app/src/services/modules/maintenance/item-attributes/ItemAttributesApi";
import { ItemAttributesQueryKeys } from "@/app/src/services/modules/maintenance/item-attributes/ItemAttributesQueryKeys";
import type {
	ItemAttributeFormValues,
	ItemAttributeRecord,
	ItemAttributesPermissions,
	ItemAttributesStatistics,
} from "@/app/src/types/modules/maintenance/item-attributes/ItemAttributesTypes";

type ItemAttributesStoreState = {
	attributes: ItemAttributeRecord[];
	addAttribute: (
		values: ItemAttributeFormValues,
	) => Promise<ItemAttributeRecord>;
	updateAttribute: (
		attribute: ItemAttributeRecord,
	) => Promise<ItemAttributeRecord>;
	permissions: ItemAttributesPermissions;
	statistics: ItemAttributesStatistics;
	isLoading: boolean;
	isLoadError: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	loadErrorMessage: string | null;
	isMutating: boolean;
	refreshAttributes: () => void;
};

const EmptyItemAttributesPermissions: ItemAttributesPermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canExport: false,
	canImport: false,
};

const ReservedRoleItemAttributesPermissions: ItemAttributesPermissions = {
	canView: true,
	canCreate: true,
	canUpdate: true,
	canExport: true,
	canImport: true,
};

const EmptyItemAttributesStatistics: ItemAttributesStatistics = {
	totalAttributes: 0,
	activeAttributes: 0,
	inactiveAttributes: 0,
	totalValues: 0,
	activeValues: 0,
	inactiveValues: 0,
};

export function useItemAttributesStore<TSelected = ItemAttributesStoreState>(
	selector?: (state: ItemAttributesStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const attributesQuery = useQuery({
		queryKey: ItemAttributesQueryKeys.attributes(),
		queryFn: fetchItemAttributes,
		retry: false,
	});
	const refreshAttributes = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: ItemAttributesQueryKeys.all(),
		});
	}, [queryClient]);

	useEffect(() => {
		if (!attributesQuery.isError) {
			return;
		}

		toast.error(
			attributesQuery.error instanceof Error
				? attributesQuery.error.message
				: "Could not load item attributes.",
		);
	}, [attributesQuery.error, attributesQuery.isError]);

	const addAttributeMutation = useMutation({
		mutationFn: createItemAttribute,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ItemAttributesQueryKeys.all(),
			});
			toast.success("Item attribute created successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create item attribute. Please try again.",
			);
		},
	});

	const updateAttributeMutation = useMutation({
		mutationFn: updateItemAttribute,
		onSuccess: (_, updatedAttribute) => {
			const previousAttribute = attributesQuery.data?.attributes.find(
				(attribute) => attribute.id === updatedAttribute.id,
			);
			const didStatusChange =
				previousAttribute &&
				previousAttribute.status !== updatedAttribute.status;

			void queryClient.invalidateQueries({
				queryKey: ItemAttributesQueryKeys.all(),
			});
			toast.success(
				didStatusChange
					? `Item attribute ${updatedAttribute.status === "Active" ? "activated" : "deactivated"} successfully.`
					: "Item attribute updated successfully.",
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update item attribute. Please try again.",
			);
		},
	});

	const state = useMemo<ItemAttributesStoreState>(() => {
		const effectiveRole = ResolveAuthProfileEffectiveRole(
			authProfileQuery.data,
		);
		const hasReservedRoleAccess =
			effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";

		return {
			addAttribute: (values) => addAttributeMutation.mutateAsync(values),
			attributes: attributesQuery.data?.attributes ?? [],
			isLoading: attributesQuery.isLoading,
			isLoadError: attributesQuery.isError,
			isMutating:
				addAttributeMutation.isPending || updateAttributeMutation.isPending,
			isRefreshing:
				attributesQuery.isFetching && !attributesQuery.isLoading,
			lastSyncedAt: attributesQuery.dataUpdatedAt,
			loadErrorMessage:
				attributesQuery.error instanceof Error
					? attributesQuery.error.message
					: attributesQuery.isError
						? "Could not load item attributes."
						: null,
			permissions: hasReservedRoleAccess
				? ReservedRoleItemAttributesPermissions
				: (attributesQuery.data?.permissions ??
					EmptyItemAttributesPermissions),
			refreshAttributes,
			statistics:
				attributesQuery.data?.statistics ?? EmptyItemAttributesStatistics,
			updateAttribute: (attribute) =>
				updateAttributeMutation.mutateAsync(attribute),
		};
	}, [
		addAttributeMutation,
		attributesQuery.data,
		attributesQuery.dataUpdatedAt,
		attributesQuery.error,
		attributesQuery.isFetching,
		attributesQuery.isError,
		attributesQuery.isLoading,
		authProfileQuery.data,
		refreshAttributes,
		updateAttributeMutation,
	]);

	return selector ? selector(state) : (state as TSelected);
}
