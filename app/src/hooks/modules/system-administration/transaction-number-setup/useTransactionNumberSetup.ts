"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	GetTransactionNumberSetupBootstrap,
	UpdateTransactionNumberSetup,
} from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberSetupApi";
import { TransactionNumberSetupQueryKeys } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberSetupQueryKeys";
import type { TransactionNumberSetupRecord } from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

type TransactionNumberSetupState = {
	isLoading: boolean;
	isMutating: boolean;
	setups: TransactionNumberSetupRecord[];
	updateSetup: (setup: TransactionNumberSetupRecord) => void;
};

const EmptySetups: TransactionNumberSetupRecord[] = [];

export function useTransactionNumberSetupStore<
	TSelected = TransactionNumberSetupState,
>(selector?: (state: TransactionNumberSetupState) => TSelected) {
	const queryClient = useQueryClient();
	const setupsQuery = useQuery({
		queryKey: TransactionNumberSetupQueryKeys.setups(),
		queryFn: async () => {
			const bootstrap = await GetTransactionNumberSetupBootstrap();

			return bootstrap.setups;
		},
		placeholderData: EmptySetups,
	});
	const setups = setupsQuery.data ?? EmptySetups;

	function setSetups(
		updater: (
			setups: TransactionNumberSetupRecord[],
		) => TransactionNumberSetupRecord[],
	) {
		queryClient.setQueryData<TransactionNumberSetupRecord[]>(
			TransactionNumberSetupQueryKeys.setups(),
			(current = EmptySetups) => updater(current),
		);
	}

	const updateSetupMutation = useMutation({
		mutationFn: UpdateTransactionNumberSetup,
		onSuccess: (setup) => {
			setSetups((setups) =>
				setups.some((current) => current.id === setup.id)
					? setups.map((current) =>
							current.id === setup.id ? setup : current,
						)
					: [...setups, setup],
			);
			toast.success("Transaction numbering setup updated.");
		},
		onError: () => {
			toast.error("Could not update the numbering setup.");
		},
	});
	const state = useMemo<TransactionNumberSetupState>(
		() => ({
			isLoading: setupsQuery.isLoading,
			isMutating: updateSetupMutation.isPending,
			setups,
			updateSetup: (setup) => updateSetupMutation.mutate(setup),
		}),
		[
			setups,
			setupsQuery.isLoading,
			updateSetupMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
