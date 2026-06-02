"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	TransactionNumberSetups,
	TransactionNumberUsageLogs,
} from "@/app/src/data/modules/system-administration/transaction-number-setup/TransactionNumberSetupData";
import { generateNextTransactionNumber } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberGenerationService";
import { TransactionNumberSetupQueryKeys } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberSetupQueryKeys";
import type {
	TransactionNumberSetupRecord,
	TransactionNumberUsageLog,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

type TransactionNumberSetupState = {
	addSetup: (setup: TransactionNumberSetupRecord) => void;
	deleteSetup: (setupId: string) => void;
	generateNextNumber: (setupId: string) => void;
	isLoading: boolean;
	isMutating: boolean;
	setups: TransactionNumberSetupRecord[];
	updateSetup: (setup: TransactionNumberSetupRecord) => void;
	usageLogs: TransactionNumberUsageLog[];
};

export function useTransactionNumberSetupStore<
	TSelected = TransactionNumberSetupState,
>(selector?: (state: TransactionNumberSetupState) => TSelected) {
	const queryClient = useQueryClient();
	const setupsQuery = useQuery({
		queryKey: TransactionNumberSetupQueryKeys.setups(),
		queryFn: async () => TransactionNumberSetups,
		initialData: TransactionNumberSetups,
	});
	const usageLogsQuery = useQuery({
		queryKey: TransactionNumberSetupQueryKeys.usageLogs(),
		queryFn: async () => TransactionNumberUsageLogs,
		initialData: TransactionNumberUsageLogs,
	});

	function setSetups(
		updater: (
			setups: TransactionNumberSetupRecord[],
		) => TransactionNumberSetupRecord[],
	) {
		queryClient.setQueryData<TransactionNumberSetupRecord[]>(
			TransactionNumberSetupQueryKeys.setups(),
			(current = TransactionNumberSetups) => updater(current),
		);
	}

	function setUsageLogs(
		updater: (
			usageLogs: TransactionNumberUsageLog[],
		) => TransactionNumberUsageLog[],
	) {
		queryClient.setQueryData<TransactionNumberUsageLog[]>(
			TransactionNumberSetupQueryKeys.usageLogs(),
			(current = TransactionNumberUsageLogs) => updater(current),
		);
	}

	const addSetupMutation = useMutation({
		mutationFn: async (setup: TransactionNumberSetupRecord) => setup,
		onSuccess: (setup) => {
			setSetups((setups) => [...setups, setup]);
			toast.success("Transaction numbering setup created.");
		},
		onError: () => {
			toast.error("Could not create the numbering setup.");
		},
	});
	const updateSetupMutation = useMutation({
		mutationFn: async (setup: TransactionNumberSetupRecord) => setup,
		onSuccess: (setup) => {
			setSetups((setups) =>
				setups.map((current) => (current.id === setup.id ? setup : current)),
			);
			toast.success("Transaction numbering setup updated.");
		},
		onError: () => {
			toast.error("Could not update the numbering setup.");
		},
	});
	const deleteSetupMutation = useMutation({
		mutationFn: async (setupId: string) => setupId,
		onSuccess: (setupId) => {
			setSetups((setups) =>
				setups.map((setup) =>
					setup.id === setupId ? { ...setup, status: "Inactive" } : setup,
				),
			);
			toast.success("Transaction numbering setup set as inactive.");
		},
		onError: () => {
			toast.error("Could not update the setup status.");
		},
	});
	const generateNumberMutation = useMutation({
		mutationFn: async (setupId: string) => {
			const setups =
				queryClient.getQueryData<TransactionNumberSetupRecord[]>(
					TransactionNumberSetupQueryKeys.setups(),
				) ?? TransactionNumberSetups;
			const usageLogs =
				queryClient.getQueryData<TransactionNumberUsageLog[]>(
					TransactionNumberSetupQueryKeys.usageLogs(),
				) ?? TransactionNumberUsageLogs;
			const setup = setups.find((current) => current.id === setupId);

			if (!setup || setup.status !== "Active") {
				throw new Error("Setup is not available for generation.");
			}

			return generateNextTransactionNumber({
				setup,
				issuedNumbers: usageLogs,
			});
		},
		onSuccess: (generated) => {
			setSetups((setups) =>
				setups.map((setup) =>
					setup.id === generated.record.id ? generated.record : setup,
				),
			);
			setUsageLogs((usageLogs) => [...usageLogs, generated.usageLog]);
			toast.success(`Generated ${generated.transactionNumber}.`);
		},
		onError: () => {
			toast.error("Could not generate the next transaction number.");
		},
	});
	const state = useMemo<TransactionNumberSetupState>(
		() => ({
			addSetup: (setup) => addSetupMutation.mutate(setup),
			deleteSetup: (setupId) => deleteSetupMutation.mutate(setupId),
			generateNextNumber: (setupId) =>
				generateNumberMutation.mutate(setupId),
			isLoading: setupsQuery.isLoading || usageLogsQuery.isLoading,
			isMutating:
				addSetupMutation.isPending ||
				updateSetupMutation.isPending ||
				deleteSetupMutation.isPending ||
				generateNumberMutation.isPending,
			setups: setupsQuery.data,
			updateSetup: (setup) => updateSetupMutation.mutate(setup),
			usageLogs: usageLogsQuery.data,
		}),
		[
			addSetupMutation,
			deleteSetupMutation,
			generateNumberMutation,
			setupsQuery.data,
			setupsQuery.isLoading,
			updateSetupMutation,
			usageLogsQuery.data,
			usageLogsQuery.isLoading,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
