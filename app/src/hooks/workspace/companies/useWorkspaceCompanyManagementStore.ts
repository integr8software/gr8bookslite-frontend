"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	EmptyWorkspaceCompanyBranches,
	EmptyWorkspaceCompanies,
	EmptyWorkspaceCompanyUsers,
	type WorkspaceCompanyManagementStoreState,
} from "@/app/src/hooks/workspace/companies/WorkspaceCompanyManagementTypes";
import { BillingQueryKeys } from "@/app/src/services/billing/BillingQueryKeys";
import {
	CreateWorkspaceCompany,
	DeactivateWorkspaceCompany,
	GetWorkspaceCompanies,
	UpdateWorkspaceCompany,
} from "@/app/src/services/workspace/companies/WorkspaceCompanyApi";
import { WorkspaceCompanyQueryKeys } from "@/app/src/services/workspace/companies/WorkspaceCompanyQueryKeys";
import type {
	WorkspaceCompanyFormValues,
	WorkspaceCompanyRecord,
	WorkspaceCompanyUserRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

export function useWorkspaceCompanyManagementStore<
	TSelected = WorkspaceCompanyManagementStoreState,
>(selector?: (state: WorkspaceCompanyManagementStoreState) => TSelected) {
	const queryClient = useQueryClient();
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const accessToken = storedAccessToken;
	const companiesQuery = useQuery({
		queryKey: WorkspaceCompanyQueryKeys.companies(),
		queryFn: async () => GetWorkspaceCompanies(accessToken),
	});
	const usersQuery = useQuery({
		queryKey: WorkspaceCompanyQueryKeys.users(),
		queryFn: async () => EmptyWorkspaceCompanyUsers,
		initialData: EmptyWorkspaceCompanyUsers,
	});
	const branchesQuery = useQuery({
		queryKey: WorkspaceCompanyQueryKeys.branches(),
		queryFn: async () => EmptyWorkspaceCompanyBranches,
		initialData: EmptyWorkspaceCompanyBranches,
	});

	function setCompanies(
		updater: (companies: WorkspaceCompanyRecord[]) => WorkspaceCompanyRecord[],
	) {
		queryClient.setQueryData<WorkspaceCompanyRecord[]>(
			WorkspaceCompanyQueryKeys.companies(),
			(current = EmptyWorkspaceCompanies) => updater(current),
		);
	}

	function setCompanyUsers(
		updater: (
			users: WorkspaceCompanyUserRecord[],
		) => WorkspaceCompanyUserRecord[],
	) {
		queryClient.setQueryData<WorkspaceCompanyUserRecord[]>(
			WorkspaceCompanyQueryKeys.users(),
			(current = EmptyWorkspaceCompanyUsers) => updater(current),
		);
	}

	const addCompanyMutation = useMutation({
		mutationFn: async (values: WorkspaceCompanyFormValues) =>
			CreateWorkspaceCompany(accessToken, values),
		onSuccess: (company) => {
			setCompanies((companies) => [company, ...companies]);
			void queryClient.invalidateQueries({
				queryKey: WorkspaceCompanyQueryKeys.companies(),
			});
			void queryClient.invalidateQueries({
				queryKey: BillingQueryKeys.paymentMethods(),
			});
			toast.success("Company created.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create company. Please try again.",
			);
		},
	});

	const updateCompanyMutation = useMutation({
		mutationFn: async ({
			companyId,
			values,
		}: {
			companyId: string;
			values: WorkspaceCompanyFormValues;
		}) => {
			if (!accessToken) {
				throw new Error("Sign in again before updating this company.");
			}

			return UpdateWorkspaceCompany(accessToken, companyId, values);
		},
		onSuccess: (company) => {
			setCompanies((companies) =>
				companies.map((current) =>
					current.id === company.id ? company : current,
				),
			);
			queryClient.setQueryData(
				WorkspaceCompanyQueryKeys.company(company.id),
				company,
			);
			void queryClient.invalidateQueries({
				queryKey: WorkspaceCompanyQueryKeys.companies(),
			});
			toast.success("Company updated.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update company. Please try again.",
			);
		},
	});

	const deleteCompanyMutation = useMutation({
		mutationFn: async (companyId: string) => {
			if (!accessToken) {
				throw new Error("Sign in again before deleting this company.");
			}

			return DeactivateWorkspaceCompany(accessToken, companyId);
		},
		onSuccess: (company) => {
			setCompanies((companies) =>
				companies.map((current) =>
					current.id === company.id ? company : current,
				),
			);
			queryClient.setQueryData(
				WorkspaceCompanyQueryKeys.company(company.id),
				company,
			);
			void queryClient.invalidateQueries({
				queryKey: WorkspaceCompanyQueryKeys.companies(),
			});
			toast.success("Company deleted.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not delete company. Please try again.",
			);
		},
	});

	const addCompanyUserMutation = useMutation({
		mutationFn: async (user: WorkspaceCompanyUserRecord) => user,
		onSuccess: (user) => {
			setCompanyUsers((users) => [...users, user]);
			toast.success("Company user created.");
		},
		onError: () => {
			toast.error("Could not create company user. Please try again.");
		},
	});

	const updateCompanyUserMutation = useMutation({
		mutationFn: async (user: WorkspaceCompanyUserRecord) => user,
		onSuccess: (user) => {
			setCompanyUsers((users) =>
				users.map((current) => (current.id === user.id ? user : current)),
			);
			toast.success("Company user updated.");
		},
		onError: () => {
			toast.error("Could not update company user. Please try again.");
		},
	});

	const state = useMemo<WorkspaceCompanyManagementStoreState>(
		() => ({
			addCompany: (values) => addCompanyMutation.mutateAsync(values),
			addCompanyUser: (user) => addCompanyUserMutation.mutate(user),
			branches: branchesQuery.data ?? EmptyWorkspaceCompanyBranches,
			companies: companiesQuery.data ?? EmptyWorkspaceCompanies,
			deleteCompany: (companyId) =>
				deleteCompanyMutation.mutateAsync(companyId),
			isLoading:
				branchesQuery.isLoading ||
				companiesQuery.isLoading ||
				usersQuery.isLoading,
			isMutating:
				addCompanyMutation.isPending ||
				addCompanyUserMutation.isPending ||
				deleteCompanyMutation.isPending ||
				updateCompanyMutation.isPending ||
				updateCompanyUserMutation.isPending,
			updateCompany: (companyId, values) =>
				updateCompanyMutation.mutateAsync({ companyId, values }),
			updateCompanyUser: (user) => updateCompanyUserMutation.mutate(user),
			users: usersQuery.data ?? EmptyWorkspaceCompanyUsers,
		}),
		[
			addCompanyMutation,
			addCompanyUserMutation,
			branchesQuery.data,
			branchesQuery.isLoading,
			companiesQuery.data,
			companiesQuery.isLoading,
			deleteCompanyMutation,
			updateCompanyMutation,
			updateCompanyUserMutation,
			usersQuery.data,
			usersQuery.isLoading,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
