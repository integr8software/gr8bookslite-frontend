"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import {
	createDefaultAccount,
	fetchDefaultAccounts,
	updateDefaultAccount,
	updateDefaultAccountStatus,
} from "@/app/src/services/modules/maintenance/default-account/DefaultAccountApi";
import { DefaultAccountQueryKeys } from "@/app/src/services/modules/maintenance/default-account/DefaultAccountQueryKeys";
import type {
	DefaultAccount,
	DefaultAccountFormValues,
	DefaultAccountPermissions,
	DefaultAccountStatistics,
} from "@/app/src/types/modules/maintenance/default-account/DefaultAccountTypes";

type DefaultAccountStoreState = {
	defaultAccounts: DefaultAccount[];
	addDefaultAccount: (
		account: DefaultAccountFormValues,
	) => Promise<DefaultAccount>;
	updateDefaultAccount: (account: DefaultAccount) => Promise<DefaultAccount>;
	updateDefaultAccountStatus: (
		account: DefaultAccount,
	) => Promise<DefaultAccount>;
	permissions: DefaultAccountPermissions;
	statistics: DefaultAccountStatistics;
	refreshDefaultAccounts: () => void;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
};

const EmptyPermissions: DefaultAccountPermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canDelete: false,
	canExport: false,
};

const ReservedRolePermissions: DefaultAccountPermissions = {
	canView: true,
	canCreate: true,
	canUpdate: true,
	canDelete: false,
	canExport: true,
};

const EmptyStatistics: DefaultAccountStatistics = {
	totalDefaultAccounts: 0,
	activeDefaultAccounts: 0,
	inactiveDefaultAccounts: 0,
	expenseDefaultAccounts: 0,
	collectionDefaultAccounts: 0,
	fixedAssetDefaultAccounts: 0,
};

export function useDefaultAccountStore<TSelected = DefaultAccountStoreState>(
	selector?: (state: DefaultAccountStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const companyId = authProfileQuery.data?.activeCompanyId ?? null;
	const defaultAccountsQuery = useQuery({
		queryKey: DefaultAccountQueryKeys.list(companyId),
		queryFn: fetchDefaultAccounts,
		enabled: Boolean(companyId),
	});
	const refreshDefaultAccounts = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: DefaultAccountQueryKeys.all(companyId),
		});
	}, [companyId, queryClient]);
	const addDefaultAccountMutation = useMutation({
		mutationFn: createDefaultAccount,
		onSuccess: () => {
			refreshDefaultAccounts();
			toast.success("Default account created successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create default account. Please try again.",
			);
		},
	});
	const updateDefaultAccountMutation = useMutation({
		mutationFn: updateDefaultAccount,
		onSuccess: () => {
			refreshDefaultAccounts();
			toast.success("Default account updated successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update default account. Please try again.",
			);
		},
	});
	const updateDefaultAccountStatusMutation = useMutation({
		mutationFn: updateDefaultAccountStatus,
		onSuccess: (_, account) => {
			refreshDefaultAccounts();
			toast.success(
				`Default account ${account.status === "Active" ? "activated" : "inactivated"} successfully.`,
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update default account status. Please try again.",
			);
		},
	});
	const state = useMemo<DefaultAccountStoreState>(() => {
		const effectiveRole = ResolveAuthProfileEffectiveRole(authProfileQuery.data);
		const hasReservedRoleAccess =
			effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";

		return {
			defaultAccounts: defaultAccountsQuery.data?.defaultAccounts ?? [],
			permissions: hasReservedRoleAccess
				? ReservedRolePermissions
				: (defaultAccountsQuery.data?.permissions ?? EmptyPermissions),
			statistics: defaultAccountsQuery.data?.statistics ?? EmptyStatistics,
			addDefaultAccount: (account) =>
				addDefaultAccountMutation.mutateAsync(account),
			updateDefaultAccount: (account) =>
				updateDefaultAccountMutation.mutateAsync(account),
			updateDefaultAccountStatus: (account) =>
				updateDefaultAccountStatusMutation.mutateAsync(account),
			refreshDefaultAccounts,
			isLoading: defaultAccountsQuery.isLoading,
			isRefreshing:
				defaultAccountsQuery.isFetching && !defaultAccountsQuery.isLoading,
			lastSyncedAt: defaultAccountsQuery.dataUpdatedAt,
			isMutating:
				addDefaultAccountMutation.isPending ||
				updateDefaultAccountMutation.isPending ||
				updateDefaultAccountStatusMutation.isPending,
		};
	}, [
		addDefaultAccountMutation,
		authProfileQuery.data,
		defaultAccountsQuery.data,
		defaultAccountsQuery.dataUpdatedAt,
		defaultAccountsQuery.isFetching,
		defaultAccountsQuery.isLoading,
		refreshDefaultAccounts,
		updateDefaultAccountMutation,
		updateDefaultAccountStatusMutation,
	]);

	return selector ? selector(state) : (state as TSelected);
}
