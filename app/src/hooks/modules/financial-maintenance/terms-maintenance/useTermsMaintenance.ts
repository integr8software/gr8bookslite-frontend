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
} from "@/app/src/services/modules/financial-maintenance/terms-maintenance/TermsMaintenanceApi";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import { TermsMaintenanceQueryKeys } from "@/app/src/services/modules/financial-maintenance/terms-maintenance/TermsMaintenanceQueryKeys";
import type {
	TermsMaintenance,
	TermsMaintenanceFormValues,
	TermsMaintenancePermissions,
	TermsMaintenanceStatistics,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";

type TermsMaintenanceStoreState = {
	terms: TermsMaintenance[];
	addTerm: (term: TermsMaintenanceFormValues) => Promise<TermsMaintenance>;
	addTerms: (terms: TermsMaintenance[]) => Promise<TermsMaintenance[]>;
	updateTerm: (term: TermsMaintenance) => Promise<TermsMaintenance>;
	permissions: TermsMaintenancePermissions;
	statistics: TermsMaintenanceStatistics;
	deleteTerm: (termId: string) => void;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
	refreshTerms: () => void;
};

const EmptyTermPermissions: TermsMaintenancePermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canExport: false,
	canImport: false,
};

const ReservedRoleTermPermissions: TermsMaintenancePermissions = {
	canView: true,
	canCreate: true,
	canUpdate: true,
	canExport: true,
	canImport: true,
};

const EmptyTermStatistics: TermsMaintenanceStatistics = {
	totalTerms: 0,
	activeTerms: 0,
	inactiveTerms: 0,
	dayTerms: 0,
	monthTerms: 0,
	yearTerms: 0,
};

export function useTermsMaintenanceStore<TSelected = TermsMaintenanceStoreState>(
	selector?: (state: TermsMaintenanceStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const termsQuery = useQuery({
		queryKey: TermsMaintenanceQueryKeys.terms(),
		queryFn: fetchTerms,
		retry: false,
	});
	const refreshTerms = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: TermsMaintenanceQueryKeys.all(),
		});
	}, [queryClient]);

	const addTermMutation = useMutation({
		mutationFn: createTerm,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: TermsMaintenanceQueryKeys.all(),
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
				queryKey: TermsMaintenanceQueryKeys.all(),
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
				queryKey: TermsMaintenanceQueryKeys.all(),
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
				TermsMaintenanceQueryKeys.terms(),
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

	const state = useMemo<TermsMaintenanceStoreState>(
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
				lastSyncedAt: termsQuery.dataUpdatedAt,
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
			termsQuery.dataUpdatedAt,
			termsQuery.isFetching,
			termsQuery.isLoading,
			updateTermMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
