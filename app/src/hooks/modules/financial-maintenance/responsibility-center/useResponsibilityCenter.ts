"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import {
	createResponsibilityCenter,
	fetchResponsibilityCenterClassifications,
	fetchResponsibilityCenterTypes,
	fetchResponsibilityCenters,
	updateResponsibilityCenter,
	updateResponsibilityCenterStatus,
} from "@/app/src/services/modules/financial-maintenance/responsibility-center/ResponsibilityCenterApi";
import { ResponsibilityCenterQueryKeys } from "@/app/src/services/modules/financial-maintenance/responsibility-center/ResponsibilityCenterQueryKeys";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterClassification,
	ResponsibilityCenterPermissions,
	ResponsibilityCenterStatistics,
	ResponsibilityCenterTypeOption,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";

type ResponsibilityCenterStoreState = {
	centers: ResponsibilityCenter[];
	classifications: ResponsibilityCenterClassification[];
	types: ResponsibilityCenterTypeOption[];
	addCenter: (center: ResponsibilityCenter) => Promise<ResponsibilityCenter>;
	updateCenter: (center: ResponsibilityCenter) => Promise<ResponsibilityCenter>;
	updateCenterStatus: (center: ResponsibilityCenter) => Promise<ResponsibilityCenter>;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
	permissions: ResponsibilityCenterPermissions;
	refreshCenters: () => void;
	statistics: ResponsibilityCenterStatistics;
};

const EmptyResponsibilityCenters: ResponsibilityCenter[] = [];
const EmptyResponsibilityCenterClassifications: ResponsibilityCenterClassification[] =
	[];
const EmptyResponsibilityCenterTypes: ResponsibilityCenterTypeOption[] = [];
const EmptyResponsibilityCenterPermissions: ResponsibilityCenterPermissions = {
	canCreate: false,
	canExport: false,
	canUpdate: false,
	canView: false,
};
const ReservedRoleResponsibilityCenterPermissions: ResponsibilityCenterPermissions = {
	canCreate: true,
	canExport: true,
	canUpdate: true,
	canView: true,
};

export function useResponsibilityCenterStore<
	TSelected = ResponsibilityCenterStoreState,
>(selector?: (state: ResponsibilityCenterStoreState) => TSelected) {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const centersQuery = useQuery({
		queryKey: ResponsibilityCenterQueryKeys.centers(),
		queryFn: fetchResponsibilityCenters,
		retry: false,
	});
	const classificationsQuery = useQuery({
		queryKey: ResponsibilityCenterQueryKeys.classifications(),
		queryFn: fetchResponsibilityCenterClassifications,
		retry: false,
	});
	const typesQuery = useQuery({
		queryKey: ResponsibilityCenterQueryKeys.types(),
		queryFn: () => fetchResponsibilityCenterTypes(),
		retry: false,
	});
	const centers = centersQuery.data?.centers ?? EmptyResponsibilityCenters;
	const classifications =
		classificationsQuery.data ?? EmptyResponsibilityCenterClassifications;
	const types = typesQuery.data ?? EmptyResponsibilityCenterTypes;
	const dataUpdatedAt = centersQuery.dataUpdatedAt;
	const isFetching = centersQuery.isFetching;
	const isLoading = centersQuery.isLoading;
	const statistics = centersQuery.data?.statistics ?? createEmptyStatistics();
	const refreshCenters = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: ResponsibilityCenterQueryKeys.all(),
		});
	}, [queryClient]);

	function updateCachedCenters(
		updater: (centers: ResponsibilityCenter[]) => ResponsibilityCenter[],
	) {
		queryClient.setQueryData(
			ResponsibilityCenterQueryKeys.centers(),
			(
				current:
					| {
							centers: ResponsibilityCenter[];
							statistics: ResponsibilityCenterStatistics;
							permissions: ResponsibilityCenterPermissions;
					  }
					| undefined,
			) => {
				const currentData = current ?? {
					centers: [],
					statistics: createEmptyStatistics(),
					permissions: createDefaultPermissions(),
				};

				return {
					...currentData,
					centers: updater(currentData.centers),
				};
			},
		);
	}

	const addCenterMutation = useMutation({
		mutationFn: createResponsibilityCenter,
		onSuccess: (center) => {
			updateCachedCenters((centers) => [...centers, center]);
			void queryClient.invalidateQueries({
				queryKey: ResponsibilityCenterQueryKeys.all(),
			});
			toast.success("Responsibility center created.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create responsibility center. Please try again.",
			);
		},
	});

	const updateCenterMutation = useMutation({
		mutationFn: updateResponsibilityCenter,
		onSuccess: (center) => {
			updateCachedCenters((centers) =>
				centers.map((currentCenter) =>
					currentCenter.id === center.id ? center : currentCenter,
				),
			);
			void queryClient.invalidateQueries({
				queryKey: ResponsibilityCenterQueryKeys.all(),
			});
			toast.success("Responsibility center updated.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update responsibility center. Please try again.",
			);
		},
	});

	const updateCenterStatusMutation = useMutation({
		mutationFn: updateResponsibilityCenterStatus,
		onSuccess: (center) => {
			updateCachedCenters((centers) =>
				centers.map((currentCenter) =>
					currentCenter.id === center.id ? center : currentCenter,
				),
			);
			void queryClient.invalidateQueries({
				queryKey: ResponsibilityCenterQueryKeys.all(),
			});
			toast.success("Responsibility center status updated.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update responsibility center status. Please try again.",
			);
		},
	});

	const state = useMemo<ResponsibilityCenterStoreState>(
		() => {
			const effectiveRole = ResolveAuthProfileEffectiveRole(
				authProfileQuery.data,
			);
			const hasReservedRoleAccess =
				effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";

			return {
				centers,
				classifications,
				types,
				addCenter: (center) => addCenterMutation.mutateAsync(center),
				updateCenter: (center) => updateCenterMutation.mutateAsync(center),
				updateCenterStatus: (center) =>
					updateCenterStatusMutation.mutateAsync(center),
				isLoading,
				isRefreshing: isFetching && !isLoading,
				lastSyncedAt: dataUpdatedAt,
				isMutating:
					addCenterMutation.isPending ||
					updateCenterMutation.isPending ||
					updateCenterStatusMutation.isPending,
				permissions: hasReservedRoleAccess
					? ReservedRoleResponsibilityCenterPermissions
					: (centersQuery.data?.permissions ??
						EmptyResponsibilityCenterPermissions),
				refreshCenters,
				statistics,
			};
		},
		[
			addCenterMutation,
			authProfileQuery.data,
			centers,
			classifications,
			centersQuery.data?.permissions,
			dataUpdatedAt,
			isFetching,
			isLoading,
			refreshCenters,
			statistics,
			types,
			updateCenterMutation,
			updateCenterStatusMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}

function createEmptyStatistics(): ResponsibilityCenterStatistics {
	return {
		totalCenters: 0,
		activeCenters: 0,
		inactiveCenters: 0,
		departmentCenters: 0,
		branchCenters: 0,
		projectCenters: 0,
	};
}

function createDefaultPermissions(): ResponsibilityCenterPermissions {
	return EmptyResponsibilityCenterPermissions;
}
