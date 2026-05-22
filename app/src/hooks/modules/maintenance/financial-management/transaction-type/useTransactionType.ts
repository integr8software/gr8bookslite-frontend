"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockTransactionTypes } from "@/app/src/data/modules/maintenance/financial-management/transaction-type/TransactionTypeData";
import { TransactionTypeQueryKeys } from "@/app/src/services/modules/maintenance/financial-management/transaction-type/TransactionTypeQueryKeys";
import type { TransactionType } from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

type TransactionTypeStoreState = {
	transactionTypes: TransactionType[];
	addTransactionType: (transactionType: TransactionType) => void;
	updateTransactionType: (transactionType: TransactionType) => void;
	deleteTransactionType: (transactionTypeId: string) => void;
	isLoading: boolean;
	isMutating: boolean;
};

export function useTransactionTypeStore<
	TSelected = TransactionTypeStoreState,
>(selector?: (state: TransactionTypeStoreState) => TSelected) {
	const queryClient = useQueryClient();
	const transactionTypesQuery = useQuery({
		queryKey: TransactionTypeQueryKeys.transactionTypes(),
		queryFn: async () => MockTransactionTypes,
		initialData: MockTransactionTypes,
	});

	function updateCachedTransactionTypes(
		updater: (transactionTypes: TransactionType[]) => TransactionType[],
	) {
		queryClient.setQueryData<TransactionType[]>(
			TransactionTypeQueryKeys.transactionTypes(),
			(currentTransactionTypes = MockTransactionTypes) =>
				updater(currentTransactionTypes),
		);
	}

	const addTransactionTypeMutation = useMutation({
		mutationFn: async (transactionType: TransactionType) => transactionType,
		onSuccess: (transactionType) => {
			updateCachedTransactionTypes((transactionTypes) => [
				...transactionTypes,
				transactionType,
			]);
			toast.success("Transaction type created.");
		},
		onError: () => {
			toast.error("Could not create transaction type. Please try again.");
		},
	});

	const updateTransactionTypeMutation = useMutation({
		mutationFn: async (transactionType: TransactionType) => transactionType,
		onSuccess: (transactionType) => {
			updateCachedTransactionTypes((transactionTypes) =>
				transactionTypes.map((current) =>
					current.id === transactionType.id ? transactionType : current,
				),
			);
			toast.success("Transaction type updated.");
		},
		onError: () => {
			toast.error("Could not update transaction type. Please try again.");
		},
	});

	const deleteTransactionTypeMutation = useMutation({
		mutationFn: async (transactionTypeId: string) => transactionTypeId,
		onSuccess: (transactionTypeId) => {
			updateCachedTransactionTypes((transactionTypes) =>
				transactionTypes.filter((transactionType) => transactionType.id !== transactionTypeId),
			);
			toast.success("Transaction type deleted.");
		},
		onError: () => {
			toast.error("Could not delete transaction type. Please try again.");
		},
	});

	const state = useMemo<TransactionTypeStoreState>(
		() => ({
			transactionTypes: transactionTypesQuery.data,
			addTransactionType: (transactionType) =>
				addTransactionTypeMutation.mutate(transactionType),
			updateTransactionType: (transactionType) =>
				updateTransactionTypeMutation.mutate(transactionType),
			deleteTransactionType: (transactionTypeId) =>
				deleteTransactionTypeMutation.mutate(transactionTypeId),
			isLoading: transactionTypesQuery.isLoading,
			isMutating:
				addTransactionTypeMutation.isPending ||
				updateTransactionTypeMutation.isPending ||
				deleteTransactionTypeMutation.isPending,
		}),
		[
			addTransactionTypeMutation,
			deleteTransactionTypeMutation,
			transactionTypesQuery.data,
			transactionTypesQuery.isLoading,
			updateTransactionTypeMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
