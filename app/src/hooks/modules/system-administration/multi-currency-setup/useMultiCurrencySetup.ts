"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockMultiCurrencySetupRecords } from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import type { MultiCurrencySetupRecord } from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

export const MultiCurrencySetupQueryKeys = {
	records: () => ["multi-currency-setup", "records"] as const,
	rates: (baseCurrencyCode: string) =>
		["multi-currency-setup", "rates", baseCurrencyCode] as const,
};

type MultiCurrencySetupStoreState = {
	addRecord: (record: MultiCurrencySetupRecord) => void;
	deleteRecord: (id: string) => void;
	isLoading: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
	records: MultiCurrencySetupRecord[];
	replaceRecords: (records: MultiCurrencySetupRecord[]) => void;
	updateRecord: (record: MultiCurrencySetupRecord) => void;
};

export function useMultiCurrencySetupStore<
	TSelected = MultiCurrencySetupStoreState,
>(selector?: (state: MultiCurrencySetupStoreState) => TSelected) {
	const queryClient = useQueryClient();
	const recordsQuery = useQuery({
		queryKey: MultiCurrencySetupQueryKeys.records(),
		queryFn: async () => MockMultiCurrencySetupRecords,
		initialData: MockMultiCurrencySetupRecords,
	});

	function updateCachedRecords(
		updater: (
			records: MultiCurrencySetupRecord[],
		) => MultiCurrencySetupRecord[],
	) {
		queryClient.setQueryData<MultiCurrencySetupRecord[]>(
			MultiCurrencySetupQueryKeys.records(),
			(current = MockMultiCurrencySetupRecords) => updater(current),
		);
	}

	const addRecordMutation = useMutation({
		mutationFn: async (record: MultiCurrencySetupRecord) => record,
		onSuccess: (record) => {
			updateCachedRecords((records) => [...records, record]);
			toast.success("Currency setup created.");
		},
		onError: () => {
			toast.error("Could not create the currency setup.");
		},
	});

	const updateRecordMutation = useMutation({
		mutationFn: async (record: MultiCurrencySetupRecord) => record,
		onSuccess: (record) => {
			updateCachedRecords((records) =>
				records.map((currentRecord) =>
					currentRecord.id === record.id ? record : currentRecord,
				),
			);
			toast.success("Currency setup updated.");
		},
		onError: () => {
			toast.error("Could not update the currency setup.");
		},
	});

	const deleteRecordMutation = useMutation({
		mutationFn: async (id: string) => id,
		onSuccess: (id) => {
			updateCachedRecords((records) =>
				records.filter((record) => record.id !== id),
			);
			toast.success("Currency setup deleted.");
		},
		onError: () => {
			toast.error("Could not delete the currency setup.");
		},
	});

	const replaceRecordsMutation = useMutation({
		mutationFn: async (records: MultiCurrencySetupRecord[]) => records,
		onSuccess: (records) => {
			queryClient.setQueryData<MultiCurrencySetupRecord[]>(
				MultiCurrencySetupQueryKeys.records(),
				records,
			);
			toast.success("Exchange rates updated.");
		},
		onError: () => {
			toast.error("Could not update exchange rates.");
		},
	});

	const state = useMemo<MultiCurrencySetupStoreState>(
		() => ({
			records: recordsQuery.data,
			addRecord: (record) => addRecordMutation.mutate(record),
			updateRecord: (record) => updateRecordMutation.mutate(record),
			deleteRecord: (id) => deleteRecordMutation.mutate(id),
			replaceRecords: (nextRecords) =>
				replaceRecordsMutation.mutate(nextRecords),
			isLoading: recordsQuery.isLoading,
			lastSyncedAt: recordsQuery.dataUpdatedAt,
			isMutating:
				addRecordMutation.isPending ||
				updateRecordMutation.isPending ||
				deleteRecordMutation.isPending ||
				replaceRecordsMutation.isPending,
		}),
		[
			addRecordMutation,
			deleteRecordMutation,
			replaceRecordsMutation,
			recordsQuery.data,
			recordsQuery.dataUpdatedAt,
			recordsQuery.isLoading,
			updateRecordMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
