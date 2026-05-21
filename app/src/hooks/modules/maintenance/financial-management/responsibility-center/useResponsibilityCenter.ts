"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MockResponsibilityCenters } from "@/app/src/data/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterData";
import { ResponsibilityCenterQueryKeys } from "@/app/src/services/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterQueryKeys";
import type { ResponsibilityCenter } from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

type ResponsibilityCenterStoreState = {
	centers: ResponsibilityCenter[];
	addCenter: (center: ResponsibilityCenter) => void;
	updateCenter: (center: ResponsibilityCenter) => void;
	deleteCenter: (centerId: string) => void;
	isLoading: boolean;
	isMutating: boolean;
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
		},
	});

	const state = useMemo<ResponsibilityCenterStoreState>(
		() => ({
			centers: centersQuery.data,
			addCenter: (center) => addCenterMutation.mutate(center),
			updateCenter: (center) => updateCenterMutation.mutate(center),
			deleteCenter: (centerId) => deleteCenterMutation.mutate(centerId),
			isLoading: centersQuery.isLoading,
			isMutating:
				addCenterMutation.isPending ||
				updateCenterMutation.isPending ||
				deleteCenterMutation.isPending,
		}),
		[
			addCenterMutation,
			centersQuery.data,
			centersQuery.isLoading,
			deleteCenterMutation,
			updateCenterMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
