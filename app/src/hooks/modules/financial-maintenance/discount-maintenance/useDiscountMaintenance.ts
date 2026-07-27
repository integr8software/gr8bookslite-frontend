"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import {
	createDiscount,
	fetchDiscounts,
	importDiscounts,
	updateDiscount,
} from "@/app/src/services/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceApi";
import { DiscountMaintenanceQueryKeys } from "@/app/src/services/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceQueryKeys";
import type {
	Discount,
	DiscountMaintenanceFormValues,
	DiscountMaintenanceListResponse,
	DiscountMaintenancePermissions,
	DiscountMaintenanceStatistics,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";

type DiscountStoreState = {
	discounts: Discount[];
	addDiscount: (discount: DiscountMaintenanceFormValues | Discount) => Promise<Discount>;
	addDiscounts: (discounts: Discount[]) => Promise<Discount[]>;
	updateDiscount: (discount: Discount) => Promise<Discount>;
	permissions: DiscountMaintenancePermissions;
	statistics: DiscountMaintenanceStatistics;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
	refreshDiscounts: () => void;
};

const ReservedRoleDiscountPermissions: DiscountMaintenancePermissions = {
	canView: true,
	canCreate: true,
	canUpdate: true,
	canExport: true,
	canImport: true,
};

const EmptyDiscountPermissions: DiscountMaintenancePermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canExport: false,
	canImport: false,
};

const EmptyDiscountStatistics: DiscountMaintenanceStatistics = {
	totalDiscounts: 0,
	activeDiscounts: 0,
	inactiveDiscounts: 0,
	purchaseDiscounts: 0,
	salesDiscounts: 0,
	percentageDiscounts: 0,
};

export function useDiscountMaintenanceStore<TSelected = DiscountStoreState>(
	selector?: (state: DiscountStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const discountsQuery = useQuery({
		queryKey: DiscountMaintenanceQueryKeys.discounts(),
		queryFn: fetchDiscounts,
		retry: false,
	});
	const refreshDiscounts = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: DiscountMaintenanceQueryKeys.all(),
		});
	}, [queryClient]);

	const addDiscountMutation = useMutation({
		mutationFn: createDiscount,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: DiscountMaintenanceQueryKeys.all(),
			});
			toast.success("Discount created successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create discount. Please try again.",
			);
		},
	});
	const addDiscountsMutation = useMutation({
		mutationFn: importDiscounts,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: DiscountMaintenanceQueryKeys.all(),
			});
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not import discounts. Please try again.",
			);
		},
	});

	const updateDiscountMutation = useMutation({
		mutationFn: updateDiscount,
		onSuccess: (_, updatedDiscount) => {
			const previousDiscount = discountsQuery.data?.discounts.find(
				(discount) => discount.id === updatedDiscount.id,
			);
			const didStatusChange =
				previousDiscount && previousDiscount.status !== updatedDiscount.status;

			void queryClient.invalidateQueries({
				queryKey: DiscountMaintenanceQueryKeys.all(),
			});
			toast.success(
				didStatusChange
					? `Discount ${updatedDiscount.status === "Active" ? "activated" : "deactivated"} successfully.`
					: "Discount updated successfully.",
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update discount. Please try again.",
			);
		},
	});

	const state = useMemo<DiscountStoreState>(
		() => {
			const effectiveRole = ResolveAuthProfileEffectiveRole(
				authProfileQuery.data,
			);
			const hasReservedRoleAccess =
				effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
			const data = discountsQuery.data as DiscountMaintenanceListResponse | undefined;

			return {
				discounts: data?.discounts ?? [],
				permissions: hasReservedRoleAccess
					? ReservedRoleDiscountPermissions
					: (data?.permissions ?? EmptyDiscountPermissions),
				statistics: data?.statistics ?? EmptyDiscountStatistics,
				addDiscount: (discount) => addDiscountMutation.mutateAsync(discount),
				addDiscounts: (discounts) => addDiscountsMutation.mutateAsync(discounts),
				updateDiscount: (discount) => updateDiscountMutation.mutateAsync(discount),
				isLoading: discountsQuery.isLoading,
				isRefreshing: discountsQuery.isFetching && !discountsQuery.isLoading,
				lastSyncedAt: discountsQuery.dataUpdatedAt,
				isMutating:
					addDiscountMutation.isPending ||
					addDiscountsMutation.isPending ||
					updateDiscountMutation.isPending,
				refreshDiscounts,
			};
		},
		[
			addDiscountMutation,
			addDiscountsMutation,
			authProfileQuery.data,
			discountsQuery.dataUpdatedAt,
			discountsQuery.data,
			discountsQuery.isFetching,
			discountsQuery.isLoading,
			refreshDiscounts,
			updateDiscountMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
