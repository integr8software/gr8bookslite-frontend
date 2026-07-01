"use client";

import { useCallback, useMemo, useState } from "react";
import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnOrderState,
	type PaginationState,
	type SortingState,
	type VisibilityState,
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
import { GetPartyManagementRecordsPage } from "@/app/src/services/modules/maintenance/party-management/PartyManagementApi";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/maintenance/party-management/PartyManagementQueryKeys";
import type {
	PartyClassification,
	PartyInformationStatus,
	PartyInformationRecord,
	PartyInformationTableColumnKey,
	PartyInformationTableRecord,
	PartyManagementListQuery,
	PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

type PartyManagementStoreState = {
	isLoading: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
	isRefreshing: boolean;
	records: PartyInformationRecord[];
	addRecord: (record: PartyInformationRecord) => void;
	refreshRecords: () => void;
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
	const refreshRecords = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: PartyManagementQueryKeys.all(),
		});
	}, [queryClient]);
	const updateRecord = useCallback(
		(record: PartyInformationRecord) => mutateUpdateRecord(record),
		[mutateUpdateRecord],
	);

	const state = useMemo<PartyManagementStoreState>(
		() => ({
			addRecord,
			isLoading: recordsQuery.isLoading,
			lastSyncedAt: recordsQuery.dataUpdatedAt,
			isMutating: isAddingRecord || isUpdatingRecord,
			isRefreshing: recordsQuery.isFetching && !recordsQuery.isLoading,
			records: recordsQuery.data,
			refreshRecords,
			updateRecord,
		}),
		[
			addRecord,
			isAddingRecord,
			isUpdatingRecord,
			recordsQuery.data,
			recordsQuery.dataUpdatedAt,
			recordsQuery.isFetching,
			recordsQuery.isLoading,
			refreshRecords,
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
	const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
		PartyManagementTableColumns.map((column) =>
			"key" in column ? column.key : "actions",
		),
	);
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>({});
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
	const queryParams = useMemo<PartyManagementListQuery>(
		() => ({
			classification: classificationFilter,
			pageIndex: pagination.pageIndex,
			pageSize: pagination.pageSize,
			partyType: partyTypeFilter,
			query,
			sort: getPartyManagementListSort(sorting),
			status: statusFilter,
		}),
		[
			classificationFilter,
			pagination.pageIndex,
			pagination.pageSize,
			partyTypeFilter,
			query,
			sorting,
			statusFilter,
		],
	);
	const hasActiveFilters =
		query.trim().length > 0 ||
		classificationFilter !== "All" ||
		partyTypeFilter !== "All" ||
		statusFilter !== "All";
	const recordsVersion = useMemo(
		() =>
			records
				.map((record) => `${record.id}:${record.updatedAt}:${record.status}`)
				.join("|"),
		[records],
	);
	const pageQuery = useQuery({
		queryKey: PartyManagementQueryKeys.list(queryParams, recordsVersion),
		queryFn: () =>
			GetPartyManagementRecordsPage({
				query: queryParams,
				records,
			}),
		placeholderData: (previousData) => previousData,
	});
	const pagedRecords = pageQuery.data ?? {
		records: [],
		totalRows: 0,
	};
	const tableData = useMemo<PartyInformationTableRecord[]>(
		() =>
			pagedRecords.records.map((record) => ({
				...record,
				addressLabel: formatPartyAddress(record.address),
				name: getPartyDisplayName(record),
				partyTypesLabel: record.partyTypes.join(", "),
			})),
		[pagedRecords.records],
	);
	const exportAllRows = useMemo<PartyInformationTableRecord[]>(
		() => records.map(createPartyInformationTableRecord),
		[records],
	);
	const exportFilteredRows = useMemo<PartyInformationTableRecord[]>(
		() =>
			sortPartyManagementRecords(
				filterPartyManagementRecords(records, queryParams),
				queryParams,
			).map(createPartyInformationTableRecord),
		[queryParams, records],
	);
	const columns = useMemo<ColumnDef<PartyInformationTableRecord>[]>(
		() =>
			PartyManagementTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className, label: column.label },
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
		data: tableData,
		columns,
		manualPagination: true,
		manualSorting: true,
		rowCount: pagedRecords.totalRows,
		state: {
			columnOrder,
			columnVisibility,
			pagination,
			sorting,
		},
		onColumnOrderChange: setColumnOrder,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
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
		exportAllRows,
		exportFilteredRows,
		hasActiveFilters,
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
		totalRows: pagedRecords.totalRows,
	};
}

function createPartyInformationTableRecord(
	record: PartyInformationRecord,
): PartyInformationTableRecord {
	return {
		...record,
		addressLabel: formatPartyAddress(record.address),
		name: getPartyDisplayName(record),
		partyTypesLabel: record.partyTypes.join(", "),
	};
}

function filterPartyManagementRecords(
	records: PartyInformationRecord[],
	query: PartyManagementListQuery,
) {
	const normalizedQuery = query.query.trim().toLowerCase();

	return records.filter((record) => {
		const name = getPartyDisplayName(record).toLowerCase();
		const address = formatPartyAddress(record.address).toLowerCase();

		return (
			(query.classification === "All" ||
				record.classification === query.classification) &&
			(query.partyType === "All" || record.partyTypes.includes(query.partyType)) &&
			(query.status === "All" || record.status === query.status) &&
			(!normalizedQuery ||
				name.includes(normalizedQuery) ||
				address.includes(normalizedQuery))
		);
	});
}

function sortPartyManagementRecords(
	records: PartyInformationRecord[],
	query: PartyManagementListQuery,
) {
	const sort = query.sort;

	if (!sort || sort.id === "actions") {
		return records;
	}

	return [...records].sort((leftRecord, rightRecord) => {
		const leftValue = getSortablePartyManagementValue(leftRecord, sort.id);
		const rightValue = getSortablePartyManagementValue(rightRecord, sort.id);
		const comparison = leftValue.localeCompare(rightValue, undefined, {
			numeric: true,
			sensitivity: "base",
		});

		return sort.desc ? -comparison : comparison;
	});
}

function getSortablePartyManagementValue(
	record: PartyInformationRecord,
	sortId: NonNullable<PartyManagementListQuery["sort"]>["id"],
) {
	switch (sortId) {
		case "addressLabel":
			return formatPartyAddress(record.address);
		case "classification":
			return record.classification;
		case "name":
			return getPartyDisplayName(record);
		case "partyTypesLabel":
			return record.partyTypes.join(", ");
		case "status":
			return record.status;
		default:
			return "";
	}
}

function getPartyManagementListSort(
	sorting: SortingState,
): PartyManagementListQuery["sort"] {
	const [sort] = sorting;

	if (!sort) {
		return undefined;
	}

	return {
		desc: sort.desc,
		id: sort.id as NonNullable<PartyManagementListQuery["sort"]>["id"],
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
		meta: { className, label: header },
	};
}
