"use client";

import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	useWorkspaceCompanyMainLayoutBranches,
} from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyMainLayoutBranches";
import {
	GetBranchUserRoles,
	GetBranchUsers,
	UpdateBranchUserRole,
} from "@/app/src/services/modules/system-administration/user-management/users/BranchUserApi";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";
import { UserListQueryKeys } from "@/app/src/services/modules/system-administration/user-management/users/UserListQueryKeys";
import { UserListHeader } from "@/app/src/ui/modules/system-administration/user-management/users/UserListHeader";
import { UserListTable } from "@/app/src/ui/modules/system-administration/user-management/users/UserListTable";
import { UserListSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/users/UserListSpotlightTutorial";
import type { UserManagementRecord } from "@/app/src/types/modules/user-management/UserManagementTypes";

const BranchUsersContextParam = "workspaceBranchId";
const BranchUsersNameParam = "branchName";
const CompanyUsersNameParam = "companyName";

export function UserListPage() {
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const storedActiveCompanyId = useAppStore((state) => state.activeCompanyId);
	const storedActiveBranchId = useAppStore((state) => state.activeBranchId);
	const storedActiveBranchName = useAppStore((state) => state.activeBranchName);
	const storedActiveCompanyName = useAppStore((state) => state.activeCompanyName);
	const accessToken = storedAccessToken;
	const routedBranchId = searchParams.get(BranchUsersContextParam);
	const fallbackCompanyId = storedActiveCompanyId
		? String(storedActiveCompanyId)
		: "";
	const fallbackBranches = useWorkspaceCompanyMainLayoutBranches({
		company: fallbackCompanyId ? { id: fallbackCompanyId } : undefined,
	});
	const fallbackBranch = fallbackBranches.branches[0];
	const branchId =
		routedBranchId ??
		(storedActiveBranchId ? String(storedActiveBranchId) : null) ??
		fallbackBranch?.id ??
		null;
	const branchName =
		searchParams.get(BranchUsersNameParam) ??
		storedActiveBranchName ??
		fallbackBranch?.name;
	const companyName =
		searchParams.get(CompanyUsersNameParam) ?? storedActiveCompanyName;
	const branchUsersQuery = useQuery({
		enabled: Boolean(accessToken && branchId),
		queryKey: branchId
			? UserListQueryKeys.branchUsers(branchId)
			: UserListQueryKeys.branchUsers(""),
		queryFn: async () => GetBranchUsers(branchId ?? ""),
	});
	const branchRolesQuery = useQuery({
		enabled: Boolean(accessToken && branchId),
		queryKey: branchId
			? UserListQueryKeys.branchRoles(branchId)
			: UserListQueryKeys.branchRoles(""),
		queryFn: async () => GetBranchUserRoles(branchId ?? ""),
	});
	const updateBranchRoleMutation = useMutation({
		mutationFn: async ({
			user,
			userRoleId,
		}: {
			user: UserManagementRecord;
			userRoleId: string;
		}) => {
			if (!branchId) {
				throw new Error("Select a branch before changing user roles.");
			}

			return UpdateBranchUserRole(branchId, user.id, userRoleId);
		},
		onSuccess: (updatedUser) => {
			if (branchId) {
				queryClient.setQueryData<UserManagementRecord[]>(
					UserListQueryKeys.branchUsers(branchId),
					(current = []) =>
						current.map((user) =>
							user.id === updatedUser.id ? updatedUser : user,
						),
				);
			}
			queryClient.invalidateQueries({ queryKey: AuthQueryKeys.profiles() });
			queryClient.invalidateQueries({
				queryKey: ["user-sidebar-customization"],
			});

			toast.success("User role updated.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update user role. Please try again.",
			);
		},
	});
	const description =
		branchName && companyName
			? `Review users and assign roles for ${branchName} in ${companyName}.`
			: "Open this page from a company branch to review assigned users.";
	const users = branchUsersQuery.data ?? [];
	const userRoles = branchRolesQuery.data ?? [];
	const lastSyncedAt = Math.max(
		branchUsersQuery.dataUpdatedAt,
		branchRolesQuery.dataUpdatedAt,
	);
	const isLoading =
		Boolean(branchId) &&
		(branchUsersQuery.isLoading ||
			branchRolesQuery.isLoading ||
			fallbackBranches.isLoading);

	return (
		<section className="grid gap-5">
			<UserListSpotlightTutorial />
			<UserListHeader
				description={description}
				title="Users"
			/>
			<UserListTable
				isLoading={isLoading}
				isRoleUpdating={updateBranchRoleMutation.isPending}
				lastSyncedAt={lastSyncedAt}
				users={users}
				userRoles={userRoles}
				onRoleChange={(user, userRoleId) => {
					updateBranchRoleMutation.mutate({ user, userRoleId });
				}}
			/>
		</section>
	);
}
