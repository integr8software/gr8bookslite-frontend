"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	PartyClassificationOptions,
	PartyManagementTableColumns,
	PartyTypeOptions,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import {
	MockPartyInformationRecords,
	getPartyDisplayName,
} from "@/app/src/data/modules/maintenance/party-management/party-management/PartyManagementData";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/maintenance/party-management/party-management/PartyManagementQueryKeys";
import type {
	PartyClassification,
	PartyInformationRecord,
	PartyInformationTableColumnKey,
	PartyInformationTableRecord,
	PartyType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";

type PartyManagementStoreState = {
	isLoading: boolean;
	isMutating: boolean;
	records: PartyInformationRecord[];
	addRecord: (record: PartyInformationRecord) => void;
	updateRecord: (record: PartyInformationRecord) => void;
};

export function usePartyManagementStore<
	TSelected = PartyManagementStoreState,
>(selector?: (state: PartyManagementStoreState) => TSelected) {
	const queryClient = useQueryClient();
	const recordsQuery = useQuery({
		queryKey: PartyManagementQueryKeys.records(),
		queryFn: async () => MockPartyInformationRecords,
		initialData: MockPartyInformationRecords,
	});

	function updateCachedRecords(
		updater: (records: PartyInformationRecord[]) => PartyInformationRecord[],
	) {
		queryClient.setQueryData<PartyInformationRecord[]>(
			PartyManagementQueryKeys.records(),
			(current = MockPartyInformationRecords) => updater(current),
		);
	}

	const addRecordMutation = useMutation({
		mutationFn: async (record: PartyInformationRecord) => record,
		onSuccess: (record) => {
			updateCachedRecords((records) => [...records, record]);
			toast.success("Party information created.");
		},
		onError: () => {
			toast.error("Could not create party information. Please try again.");
		},
	});

	const updateRecordMutation = useMutation({
		mutationFn: async (record: PartyInformationRecord) => record,
		onSuccess: (record) => {
			updateCachedRecords((records) =>
				records.map((currentRecord) =>
					currentRecord.id === record.id ? record : currentRecord,
				),
			);
			toast.success("Party information updated.");
		},
		onError: () => {
			toast.error("Could not update party information. Please try again.");
		},
	});

	const state = useMemo<PartyManagementStoreState>(
		() => ({
			addRecord: (record) => addRecordMutation.mutate(record),
			isLoading: recordsQuery.isLoading,
			isMutating: addRecordMutation.isPending || updateRecordMutation.isPending,
			records: recordsQuery.data,
			updateRecord: (record) => updateRecordMutation.mutate(record),
		}),
		[
			addRecordMutation,
			recordsQuery.data,
			recordsQuery.isLoading,
			updateRecordMutation,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}

export function usePartyManagementTable(records: PartyInformationRecord[]) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQueryState] = useState("");
	const [classificationFilter, setClassificationFilterState] = useState<
		PartyClassification | "All"
	>("All");
	const [partyTypeFilter, setPartyTypeFilterState] = useState<
		PartyType | "All"
	>("All");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const tableData = useMemo<PartyInformationTableRecord[]>(
		() =>
			records.map((record) => ({
				...record,
				contact: record.email || record.contactNo || "-",
				name: getPartyDisplayName(record),
				partyTypesLabel: record.partyTypes.join(", "),
			})),
		[records],
	);
	const filteredRecords = useMemo(
		() =>
			tableData.filter((record) => {
				const searchable = [
					record.partyCodeNo,
					record.name,
					record.classification,
					record.partyTypesLabel,
					record.atcCode,
					record.email,
					record.contactNo,
					record.tin,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(query.toLowerCase()) &&
					(classificationFilter === "All" ||
						record.classification === classificationFilter) &&
					(partyTypeFilter === "All" ||
						record.partyTypes.includes(partyTypeFilter))
				);
			}),
		[classificationFilter, partyTypeFilter, query, tableData],
	);
	const columns = useMemo<ColumnDef<PartyInformationTableRecord>[]>(
		() =>
			PartyManagementTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createPartyInformationColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredRecords,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	function resetFilters() {
		setQueryState("");
		setClassificationFilterState("All");
		setPartyTypeFilterState("All");
		table.setPageIndex(0);
	}

	function setQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function setClassificationFilter(value: PartyClassification | "All") {
		setClassificationFilterState(value);
		table.setPageIndex(0);
	}

	function setPartyTypeFilter(value: PartyType | "All") {
		setPartyTypeFilterState(value);
		table.setPageIndex(0);
	}

	return {
		classificationFilter,
		classificationOptions: PartyClassificationOptions,
		partyTypeFilter,
		partyTypeOptions: PartyTypeOptions,
		query,
		resetFilters,
		setClassificationFilter,
		setPartyTypeFilter,
		setQuery,
		table,
	};
}

function createPartyInformationColumn(
	key: PartyInformationTableColumnKey,
	header: string,
	className: string,
): ColumnDef<PartyInformationTableRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
