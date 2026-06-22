"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	createTerm,
	fetchTerms,
	importTerms,
	updateTerm,
	type TermManagementPermissions,
	type TermManagementStatistics,
} from "@/app/src/services/modules/maintenance/financial-management/term-management/TermManagementApi";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import { TermManagementQueryKeys } from "@/app/src/services/modules/maintenance/financial-management/term-management/TermManagementQueryKeys";
import type {
	TermManagement,
	TermManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

type TermManagementStoreState = {
	terms: TermManagement[];
	addTerm: (term: TermManagementFormValues) => Promise<TermManagement>;
	addTerms: (terms: TermManagement[]) => Promise<TermManagement[]>;
	updateTerm: (term: TermManagement) => Promise<TermManagement>;
	permissions: TermManagementPermissions;
	statistics: TermManagementStatistics;
	deleteTerm: (termId: string) => void;
	isLoading: boolean;
	isRefreshing: boolean;
	isMutating: boolean;
	refreshTerms: () => void;
};

const EmptyTermPermissions: TermManagementPermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canExport: false,
	canImport: false,
};

const ReservedRoleTermPermissions: TermManagementPermissions = {
	canView: true,
	canCreate: true,
	canUpdate: true,
	canExport: true,
	canImport: true,
};

const EmptyTermStatistics: TermManagementStatistics = {
	totalTerms: 0,
	activeTerms: 0,
	inactiveTerms: 0,
	dayTerms: 0,
	monthTerms: 0,
	yearTerms: 0,
};

export function useTermManagementStore<TSelected = TermManagementStoreState>(
	selector?: (state: TermManagementStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const termsQuery = useQuery({
		queryKey: TermManagementQueryKeys.terms(),
		queryFn: fetchTerms,
	});
	const refreshTerms = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: TermManagementQueryKeys.all(),
		});
	}, [queryClient]);

	const addTermMutation = useMutation({
		mutationFn: createTerm,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: TermManagementQueryKeys.all(),
			});
			toast.success("Term created successfully.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create term definition. Please try again.",
			);
		},
	});
	const addTermsMutation = useMutation({
		mutationFn: importTerms,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: TermManagementQueryKeys.all(),
			});
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not import term definitions. Please try again.",
			);
		},
	});

	const updateTermMutation = useMutation({
		mutationFn: updateTerm,
		onSuccess: (_, updatedTerm) => {
			const previousTerm = termsQuery.data?.terms.find(
				(term) => term.id === updatedTerm.id,
			);
			const didStatusChange =
				previousTerm && previousTerm.status !== updatedTerm.status;

			void queryClient.invalidateQueries({
				queryKey: TermManagementQueryKeys.all(),
			});
			toast.success(
				didStatusChange
					? `Term ${updatedTerm.status === "Active" ? "activated" : "deactivated"} successfully.`
					: "Term updated successfully.",
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update term definition. Please try again.",
			);
		},
	});

	const deleteTermMutation = useMutation({
		mutationFn: async (termId: string) => termId,
		onSuccess: (termId) => {
			queryClient.setQueryData(
				TermManagementQueryKeys.terms(),
				(current: typeof termsQuery.data) =>
					current
						? {
								...current,
								terms: current.terms.filter((term) => term.id !== termId),
							}
						: current,
			);
			toast.success("Term deleted successfully.");
		},
		onError: () => {
			toast.error("Could not delete term definition. Please try again.");
		},
	});

	const state = useMemo<TermManagementStoreState>(
		() => {
			const effectiveRole = ResolveAuthProfileEffectiveRole(
				authProfileQuery.data,
			);
			const hasReservedRoleAccess =
				effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";

			return {
			terms: termsQuery.data?.terms ?? [],
			permissions: hasReservedRoleAccess
				? ReservedRoleTermPermissions
				: (termsQuery.data?.permissions ?? EmptyTermPermissions),
			statistics: termsQuery.data?.statistics ?? EmptyTermStatistics,
			addTerm: (term) => addTermMutation.mutateAsync(term),
			addTerms: (terms) => addTermsMutation.mutateAsync(terms),
			updateTerm: (term) => updateTermMutation.mutateAsync(term),
				deleteTerm: (termId) => deleteTermMutation.mutate(termId),
				isLoading: termsQuery.isLoading,
				isRefreshing: termsQuery.isFetching && !termsQuery.isLoading,
				isMutating:
					addTermMutation.isPending ||
					addTermsMutation.isPending ||
					updateTermMutation.isPending ||
					deleteTermMutation.isPending,
				refreshTerms,
			};
		},
		[
			addTermMutation,
			addTermsMutation,
			authProfileQuery.data,
			deleteTermMutation,
			refreshTerms,
			termsQuery.data,
			termsQuery.isFetching,
			termsQuery.isLoading,
			updateTermMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
