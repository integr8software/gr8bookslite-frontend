"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockResponsibilityCenters } from "@/app/src/data/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterData";
import { ResponsibilityCenterQueryKeys } from "@/app/src/services/modules/maintenance/responsibility-center/ResponsibilityCenterQueryKeys";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterPermissions,
	ResponsibilityCenterStatistics,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";

type ResponsibilityCenterStoreState = {
	centers: ResponsibilityCenter[];
	addCenter: (center: ResponsibilityCenter) => void;
	updateCenter: (center: ResponsibilityCenter) => void;
	deleteCenter: (centerId: string) => void;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
	permissions: ResponsibilityCenterPermissions;
	refreshCenters: () => void;
	statistics: ResponsibilityCenterStatistics;
};

export function useResponsibilityCenterStore<
	TSelected = ResponsibilityCenterStoreState,
>(selector?: (state: ResponsibilityCenterStoreState) => TSelected) {
	const queryClient = useQueryClient();
	const centersQuery = useQuery({
		queryKey: ResponsibilityCenterQueryKeys.centers(),
		queryFn: async () => MockResponsibilityCenters,
		initialData: MockResponsibilityCenters,
	});
	const centers = centersQuery.data;
	const dataUpdatedAt = centersQuery.dataUpdatedAt;
	const isFetching = centersQuery.isFetching;
	const isLoading = centersQuery.isLoading;
	const refetchCenters = centersQuery.refetch;
	const statistics = useMemo<ResponsibilityCenterStatistics>(
		() => ({
			totalCenters: centers.length,
			activeCenters: centers.filter(
				(center) => center.status === "Active",
			).length,
			inactiveCenters: centers.filter(
				(center) => center.status === "Inactive",
			).length,
			departmentCenters: centers.filter(
				(center) => center.category === "Department",
			).length,
			branchCenters: centers.filter(
				(center) => center.category === "Branch",
			).length,
			projectCenters: centers.filter(
				(center) => center.category === "Project",
			).length,
		}),
		[centers],
	);

	function updateCachedCenters(
		updater: (centers: ResponsibilityCenter[]) => ResponsibilityCenter[],
	) {
		queryClient.setQueryData<ResponsibilityCenter[]>(
			ResponsibilityCenterQueryKeys.centers(),
			(currentCenters = MockResponsibilityCenters) => updater(currentCenters),
		);
	}

	const addCenterMutation = useMutation({
		mutationFn: async (center: ResponsibilityCenter) => center,
		onSuccess: (center) => {
			updateCachedCenters((centers) => [...centers, center]);
			toast.success("Responsibility center created.");
		},
		onError: () => {
			toast.error("Could not create responsibility center. Please try again.");
		},
	});

	const updateCenterMutation = useMutation({
		mutationFn: async (center: ResponsibilityCenter) => center,
		onSuccess: (center) => {
			updateCachedCenters((centers) =>
				centers.map((currentCenter) =>
					currentCenter.id === center.id ? center : currentCenter,
				),
			);
			toast.success("Responsibility center updated.");
		},
		onError: () => {
			toast.error("Could not update responsibility center. Please try again.");
		},
	});

	const deleteCenterMutation = useMutation({
		mutationFn: async (centerId: string) => centerId,
		onSuccess: (centerId) => {
			updateCachedCenters((centers) =>
				centers
					.filter((center) => center.id !== centerId)
					.map((center) =>
						center.parentId === centerId
							? { ...center, parentId: undefined }
							: center,
					),
			);
			toast.success("Responsibility center deleted.");
		},
		onError: () => {
			toast.error("Could not delete responsibility center. Please try again.");
		},
	});

	const state = useMemo<ResponsibilityCenterStoreState>(
		() => ({
			centers,
			addCenter: (center) => addCenterMutation.mutate(center),
			updateCenter: (center) => updateCenterMutation.mutate(center),
			deleteCenter: (centerId) => deleteCenterMutation.mutate(centerId),
			isLoading,
			isRefreshing: isFetching && !isLoading,
			lastSyncedAt: dataUpdatedAt,
			isMutating:
				addCenterMutation.isPending ||
				updateCenterMutation.isPending ||
				deleteCenterMutation.isPending,
			permissions: {
				canCreate: true,
				canExport: true,
				canUpdate: true,
				canView: true,
			},
			refreshCenters: () => {
				void refetchCenters();
			},
			statistics,
		}),
		[
			addCenterMutation,
			centers,
			dataUpdatedAt,
			deleteCenterMutation,
			isFetching,
			isLoading,
			refetchCenters,
			statistics,
			updateCenterMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
