"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";
import {
	GetUserSidebarCustomization,
	SaveUserSidebarCustomization,
	type UserSidebarApiItem,
} from "@/app/src/services/company/user-sidebar/UserSidebarApi";
import { UserSidebarQueryKeys } from "@/app/src/services/company/user-sidebar/UserSidebarQueryKeys";

type UseUserSidebarCustomizationOptions = {
	fallbackItems: UserSidebarApiItem[];
	onSaved: () => void;
};

export function useUserSidebarCustomization({
	fallbackItems,
	onSaved,
}: UseUserSidebarCustomizationOptions) {
	const companyId = useAppStore((state) => state.activeCompanyId);
	const branchUnitId = useAppStore((state) => state.activeBranchId);
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const targetUserId = authProfileQuery.data?.user.id;
	const queryClient = useQueryClient();
	const queryKey = UserSidebarQueryKeys.customization(
		companyId,
		branchUnitId,
		targetUserId,
	);
	const hasCustomizationScope = Boolean(
		companyId && branchUnitId && targetUserId,
	);
	const customizationQuery = useQuery({
		queryKey,
		queryFn: () => {
			if (!companyId || !branchUnitId || !targetUserId) {
				throw new Error("Sidebar customization scope is unavailable.");
			}

			return GetUserSidebarCustomization(companyId, {
				branchUnitId,
				userId: targetUserId,
			});
		},
		enabled: hasCustomizationScope,
	});
	const saveMutation = useMutation({
		mutationFn: async (items: UserSidebarApiItem[]) => {
			if (!companyId || !branchUnitId || !targetUserId) {
				throw new Error("Sidebar customization scope is unavailable.");
			}

			const customization =
				customizationQuery.data ?? (await customizationQuery.refetch()).data;

			if (!customization) {
				throw new Error("Sidebar version is unavailable.");
			}

			return SaveUserSidebarCustomization(
				companyId,
				{ branchUnitId, userId: targetUserId },
				{
					version: customization.version,
					items,
					applyScope: "CURRENT_BRANCH",
				},
			);
		},
		onSuccess: (data) => {
			queryClient.setQueryData(queryKey, data);
			queryClient.invalidateQueries({ queryKey: AuthQueryKeys.profiles() });
			toast.success("Sidebar saved");
			onSaved();
		},
		onError: () => toast.error("Could not save sidebar changes."),
	});

	return {
		sourceItems: customizationQuery.data?.items ?? fallbackItems,
		isLoading:
			hasCustomizationScope &&
			customizationQuery.isPending &&
			fallbackItems.length === 0,
		isSaving: saveMutation.isPending,
		saveItems: saveMutation.mutate,
	};
}
