"use client";

import { useCallback, useMemo, useState } from "react";
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
	PartyInformationStatusOptions,
	PartyManagementTableColumns,
	PartyTypeOptions,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
	PartyInformationInitialRecords,
	getPartyDisplayName,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/maintenance/party-management/PartyManagementQueryKeys";
import type {
	PartyClassification,
	PartyInformationStatus,
	PartyInformationRecord,
	PartyInformationTableColumnKey,
	PartyInformationTableRecord,
	PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

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
		queryFn: async () => PartyInformationInitialRecords,
		initialData: PartyInformationInitialRecords,
	});

	const updateCachedRecords = useCallback(
		(
			updater: (
				records: PartyInformationRecord[],
			) => PartyInformationRecord[],
		) => {
			queryClient.setQueryData<PartyInformationRecord[]>(
				PartyManagementQueryKeys.records(),
				(current = PartyInformationInitialRecords) => updater(current),
			);
		},
		[queryClient],
	);

	const { isPending: isAddingRecord, mutate: mutateAddRecord } = useMutation({
		mutationFn: async (record: PartyInformationRecord) => record,
		onSuccess: (record) => {
			updateCachedRecords((records) => [...records, record]);
			toast.success("Party information created.");
		},
		onError: () => {
			toast.error("Could not create party information. Please try again.");
		},
	});

	const { isPending: isUpdatingRecord, mutate: mutateUpdateRecord } =
		useMutation({
			mutationFn: async (record: PartyInformationRecord) => record,
			onSuccess: (record) => {
				const previousRecord = queryClient
					.getQueryData<PartyInformationRecord[]>(
						PartyManagementQueryKeys.records(),
					)
					?.find((currentRecord) => currentRecord.id === record.id);

				updateCachedRecords((records) =>
					records.map((currentRecord) =>
						currentRecord.id === record.id ? record : currentRecord,
					),
				);
				toast.success(
					previousRecord && previousRecord.status !== record.status
						? `${getPartyDisplayName(record)} has been set as ${record.status.toLowerCase()}.`
						: "Party information updated.",
				);
			},
			onError: () => {
				toast.error("Could not update party information. Please try again.");
			},
		});
	const addRecord = useCallback(
		(record: PartyInformationRecord) => mutateAddRecord(record),
		[mutateAddRecord],
	);
	const updateRecord = useCallback(
		(record: PartyInformationRecord) => mutateUpdateRecord(record),
		[mutateUpdateRecord],
	);

	const state = useMemo<PartyManagementStoreState>(
		() => ({
			addRecord,
			isLoading: recordsQuery.isLoading,
			isMutating: isAddingRecord || isUpdatingRecord,
			records: recordsQuery.data,
			updateRecord,
		}),
		[
			addRecord,
			isAddingRecord,
			isUpdatingRecord,
			recordsQuery.data,
			recordsQuery.isLoading,
			updateRecord,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}

export function usePartyManagementTable(records: PartyInformationRecord[]) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [query, setQueryState] = useState("");
	const [classificationFilter, setClassificationFilterState] = useState<
		PartyClassification | "All"
	>("All");
	const [partyTypeFilter, setPartyTypeFilterState] = useState<
		PartyType | "All"
	>("All");
	const [statusFilter, setStatusFilterState] = useState<
		PartyInformationStatus | "All"
	>("All");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const tableData = useMemo<PartyInformationTableRecord[]>(
		() =>
			records.map((record) => ({
				...record,
				addressLabel: formatPartyAddress(record.address),
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
					record.status,
					record.addressLabel,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(query.toLowerCase()) &&
					(classificationFilter === "All" ||
						record.classification === classificationFilter) &&
					(partyTypeFilter === "All" ||
						record.partyTypes.includes(partyTypeFilter)) &&
					(statusFilter === "All" || record.status === statusFilter)
				);
			}),
		[classificationFilter, partyTypeFilter, query, statusFilter, tableData],
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
	const resetPageIndex = useCallback(() => {
		setPagination((current) => {
			if (current.pageIndex === 0) {
				return current;
			}

			return {
				...current,
				pageIndex: 0,
			};
		});
	}, []);

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

	const resetFilters = useCallback(() => {
		setQueryState("");
		setClassificationFilterState("All");
		setPartyTypeFilterState("All");
		setStatusFilterState("All");
		resetPageIndex();
	}, [resetPageIndex]);

	const setQuery = useCallback((value: string) => {
		setQueryState(value);
		resetPageIndex();
	}, [resetPageIndex]);

	const setClassificationFilter = useCallback(
		(value: PartyClassification | "All") => {
			setClassificationFilterState(value);
			resetPageIndex();
		},
		[resetPageIndex],
	);

	const setPartyTypeFilter = useCallback((value: PartyType | "All") => {
		setPartyTypeFilterState(value);
		resetPageIndex();
	}, [resetPageIndex]);

	const setStatusFilter = useCallback(
		(value: PartyInformationStatus | "All") => {
			setStatusFilterState(value);
			resetPageIndex();
		},
		[resetPageIndex],
	);

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
		setStatusFilter,
		statusFilter,
		statusOptions: PartyInformationStatusOptions,
		table,
	};
}

function formatPartyAddress(address: PartyInformationRecord["address"]) {
	return [
		address.addressLine1,
		address.addressLine2,
		address.barangay,
		address.cityMunicipality,
		address.province,
		address.region,
	]
		.map((part) => part.trim())
		.filter(Boolean)
		.join(", ") || "-";
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
