"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockTermManagements } from "@/app/src/data/modules/maintenance/financial-management/term-management/TermManagementData";
import { TermManagementQueryKeys } from "@/app/src/services/modules/maintenance/financial-management/term-management/TermManagementQueryKeys";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

type TermManagementStoreState = {
	terms: TermManagement[];
	addTerm: (term: TermManagement) => void;
	updateTerm: (term: TermManagement) => void;
	deleteTerm: (termId: string) => void;
	isLoading: boolean;
	isMutating: boolean;
};

export function useTermManagementStore<TSelected = TermManagementStoreState>(
	selector?: (state: TermManagementStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const termsQuery = useQuery({
		queryKey: TermManagementQueryKeys.terms(),
		queryFn: async () => MockTermManagements,
		initialData: MockTermManagements,
	});

	function updateCachedTerms(
		updater: (terms: TermManagement[]) => TermManagement[],
	) {
		queryClient.setQueryData<TermManagement[]>(
			TermManagementQueryKeys.terms(),
			(currentTerms = MockTermManagements) => updater(currentTerms),
		);
	}

	const addTermMutation = useMutation({
		mutationFn: async (term: TermManagement) => term,
		onSuccess: (term) => {
			updateCachedTerms((terms) => [...terms, term]);
			toast.success("Term definition created.");
		},
		onError: () => {
			toast.error("Could not create term definition. Please try again.");
		},
	});

	const updateTermMutation = useMutation({
		mutationFn: async (term: TermManagement) => term,
		onSuccess: (term) => {
			updateCachedTerms((terms) =>
				terms.map((currentTerm) =>
					currentTerm.id === term.id ? term : currentTerm,
				),
			);
			toast.success("Term definition updated.");
		},
		onError: () => {
			toast.error("Could not update term definition. Please try again.");
		},
	});

	const deleteTermMutation = useMutation({
		mutationFn: async (termId: string) => termId,
		onSuccess: (termId) => {
			updateCachedTerms((terms) =>
				terms.filter((term) => term.id !== termId),
			);
			toast.success("Term definition deleted.");
		},
		onError: () => {
			toast.error("Could not delete term definition. Please try again.");
		},
	});

	const state = useMemo<TermManagementStoreState>(
		() => ({
			terms: termsQuery.data,
			addTerm: (term) => addTermMutation.mutate(term),
			updateTerm: (term) => updateTermMutation.mutate(term),
			deleteTerm: (termId) => deleteTermMutation.mutate(termId),
			isLoading: termsQuery.isLoading,
			isMutating:
				addTermMutation.isPending ||
				updateTermMutation.isPending ||
				deleteTermMutation.isPending,
		}),
		[
			addTermMutation,
			deleteTermMutation,
			termsQuery.data,
			termsQuery.isLoading,
			updateTermMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
