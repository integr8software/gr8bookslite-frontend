"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MockSalesJournals } from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import { SalesJournalQueryKeys } from "@/app/src/services/modules/sales/sales-journal/SalesJournalQueryKeys";
import type {
	SalesJournalRecord,
	SalesJournalStatus,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";

type SalesJournalStoreState = {
	records: SalesJournalRecord[];
	addRecord: (record: SalesJournalRecord) => void;
	updateRecord: (record: SalesJournalRecord) => void;
	updateRecordStatus: (
		record: SalesJournalRecord,
		status: SalesJournalStatus,
	) => void;
	deleteRecord: (recordId: string) => void;
	isLoading: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
};

export function useSalesJournalStore<TSelected = SalesJournalStoreState>(
	selector?: (state: SalesJournalStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const recordsQuery = useQuery({
		queryKey: SalesJournalQueryKeys.records(),
		queryFn: async () => MockSalesJournals,
		initialData: MockSalesJournals,
	});

	function updateCachedRecords(
		updater: (records: SalesJournalRecord[]) => SalesJournalRecord[],
	) {
		queryClient.setQueryData<SalesJournalRecord[]>(
			SalesJournalQueryKeys.records(),
			(currentRecords = MockSalesJournals) => updater(currentRecords),
		);
	}

	const addRecordMutation = useMutation({
		mutationFn: async (record: SalesJournalRecord) => record,
		onSuccess: (record) => {
			updateCachedRecords((records) => [...records, record]);
			toast.success("Sales journal saved.");
		},
		onError: () => {
			toast.error("Could not save sales journal. Please try again.");
		},
	});

	const updateRecordMutation = useMutation({
		mutationFn: async (record: SalesJournalRecord) => record,
		onSuccess: (record) => {
			updateCachedRecords((records) =>
				records.map((currentRecord) =>
					currentRecord.id === record.id ? record : currentRecord,
				),
			);
			toast.success("Sales journal updated.");
		},
		onError: () => {
			toast.error("Could not update sales journal. Please try again.");
		},
	});

	const deleteRecordMutation = useMutation({
		mutationFn: async (recordId: string) => recordId,
		onSuccess: (recordId) => {
			updateCachedRecords((records) =>
				records.filter((record) => record.id !== recordId),
			);
			toast.success("Sales journal deleted.");
		},
		onError: () => {
			toast.error("Could not delete sales journal. Please try again.");
		},
	});

	const state = useMemo<SalesJournalStoreState>(
		() => ({
			records: recordsQuery.data,
			addRecord: (record) => addRecordMutation.mutate(record),
			updateRecord: (record) => updateRecordMutation.mutate(record),
			updateRecordStatus: (record, status) =>
				updateRecordMutation.mutate({ ...record, status }),
			deleteRecord: (recordId) => deleteRecordMutation.mutate(recordId),
			isLoading: recordsQuery.isLoading,
			lastSyncedAt: recordsQuery.dataUpdatedAt,
			isMutating:
				addRecordMutation.isPending ||
				updateRecordMutation.isPending ||
				deleteRecordMutation.isPending,
		}),
		[
			addRecordMutation,
			deleteRecordMutation,
			recordsQuery.data,
			recordsQuery.dataUpdatedAt,
			recordsQuery.isLoading,
			updateRecordMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}
