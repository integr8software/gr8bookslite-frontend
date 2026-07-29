"use client";

import { useCallback, useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	PartyManagementDefaultColumnOrder,
	PartyManagementDefaultColumnVisibility,
	PartyManagementDefaultSorting,
	PartyClassificationOptions,
	PartyInformationStatusOptions,
	PartyManagementTableColumns,
	PartyManagementTablePreferencesModuleKey,
	PartyManagementTablePreferencesStorageKey,
	PartyTypeOptions,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import {
	getPartyDisplayName,
} from "@/app/src/data/modules/party-management/PartyManagementData";
import {
	GetPartyManagementRecordsPage,
	createPartyManagementRecord,
	fetchPartyManagementRecords,
	importPartyManagementRecords,
	updatePartyManagementRecord,
} from "@/app/src/services/modules/party-management/PartyManagementApi";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/party-management/PartyManagementQueryKeys";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
	PartyClassification,
	PartyInformationStatus,
	PartyInformationRecord,
	PartyInformationTableColumnKey,
	PartyInformationTableRecord,
	PartyManagementListQuery,
	PartyManagementPermissions,
	PartyManagementStatistics,
	PartyType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";

type PartyManagementStoreState = {
	isLoading: boolean;
	lastSyncedAt: number;
	isMutating: boolean;
	isRefreshing: boolean;
	records: PartyInformationRecord[];
	permissions: PartyManagementPermissions;
	statistics: PartyManagementStatistics;
	addRecord: (record: PartyInformationRecord) => Promise<PartyInformationRecord>;
	addRecords: (
		records: PartyInformationRecord[],
	) => Promise<PartyInformationRecord[]>;
	refreshRecords: () => void;
	updateRecord: (record: PartyInformationRecord) => Promise<PartyInformationRecord>;
};

const EmptyPartyPermissions: PartyManagementPermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canCancel: false,
	canUncancel: false,
	canExport: false,
	canImport: false,
};

const EmptyPartyStatistics: PartyManagementStatistics = {
	activeParties: 0,
	inactiveParties: 0,
	individualParties: 0,
	multiTypeParties: 0,
	nonIndividualParties: 0,
	totalParties: 0,
};

export function usePartyManagementStore<
	TSelected = PartyManagementStoreState,
>(selector?: (state: PartyManagementStoreState) => TSelected) {
	const queryClient = useQueryClient();
	const activeBranchId = useAppStore((state) => state.activeBranchId);
	const recordsQuery = useQuery({
		queryKey: PartyManagementQueryKeys.records(),
		queryFn: fetchPartyManagementRecords,
		retry: false,
	});

	const updateCachedRecords = useCallback(
		(
			updater: (
				records: PartyInformationRecord[],
			) => PartyInformationRecord[],
		) => {
			queryClient.setQueryData<{
				permissions: PartyManagementPermissions;
				records: PartyInformationRecord[];
				statistics: PartyManagementStatistics;
				totalRows: number;
			}>(
				PartyManagementQueryKeys.records(),
				(current) => {
					const currentRecords = current?.records ?? [];
					const nextRecords = updater(currentRecords);

					return {
						permissions: current?.permissions ?? EmptyPartyPermissions,
						records: nextRecords,
						statistics: current?.statistics ?? EmptyPartyStatistics,
						totalRows: nextRecords.length,
					};
				},
			);
		},
		[queryClient],
	);

	const { isPending: isAddingRecord, mutateAsync: mutateAddRecord } = useMutation({
		mutationFn: (record: PartyInformationRecord) =>
			createPartyManagementRecord(record, { branchUnitId: activeBranchId }),
		onSuccess: (record) => {
			updateCachedRecords((records) => [...records, record]);
			void queryClient.invalidateQueries({
				queryKey: PartyManagementQueryKeys.all(),
			});
			toast.success("Party information created.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create party information. Please try again.",
			);
		},
	});
	const { isPending: isAddingRecords, mutateAsync: mutateAddRecords } =
		useMutation({
			mutationFn: (records: PartyInformationRecord[]) =>
				importPartyManagementRecords(records, { branchUnitId: activeBranchId }),
			onSuccess: (records) => {
				updateCachedRecords((currentRecords) => [
					...currentRecords,
					...records,
				]);
				void queryClient.invalidateQueries({
					queryKey: PartyManagementQueryKeys.all(),
				});
			},
			onError: (error) => {
				toast.error(
					error instanceof Error
						? error.message
						: "Could not import party information. Please try again.",
				);
			},
		});

	const { isPending: isUpdatingRecord, mutateAsync: mutateUpdateRecord } =
		useMutation({
			mutationFn: updatePartyManagementRecord,
			onSuccess: (record) => {
				const previousRecord = queryClient
					.getQueryData<{
						records: PartyInformationRecord[];
					}>(
						PartyManagementQueryKeys.records(),
					)
					?.records.find((currentRecord) => currentRecord.id === record.id);

				updateCachedRecords((records) =>
					records.map((currentRecord) =>
						currentRecord.id === record.id ? record : currentRecord,
					),
				);
				void queryClient.invalidateQueries({
					queryKey: PartyManagementQueryKeys.all(),
				});
				toast.success(
					previousRecord && previousRecord.status !== record.status
						? `${getPartyDisplayName(record)} has been set as ${record.status.toLowerCase()}.`
						: "Party information updated.",
				);
			},
			onError: (error) => {
				toast.error(
					error instanceof Error
						? error.message
						: "Could not update party information. Please try again.",
				);
			},
		});
	const addRecord = useCallback(
		(record: PartyInformationRecord) => mutateAddRecord(record),
		[mutateAddRecord],
	);
	const addRecords = useCallback(
		(records: PartyInformationRecord[]) => mutateAddRecords(records),
		[mutateAddRecords],
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
			addRecords,
			isLoading: recordsQuery.isLoading,
			lastSyncedAt: recordsQuery.dataUpdatedAt,
			isMutating: isAddingRecord || isAddingRecords || isUpdatingRecord,
			isRefreshing: recordsQuery.isFetching && !recordsQuery.isLoading,
			permissions: recordsQuery.data?.permissions ?? EmptyPartyPermissions,
			records: recordsQuery.data?.records ?? [],
			statistics: recordsQuery.data?.statistics ?? EmptyPartyStatistics,
			refreshRecords,
			updateRecord,
		}),
		[
			addRecord,
			addRecords,
			isAddingRecord,
			isAddingRecords,
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
	const {
		columnOrder,
		columnVisibility,
		sorting,
		setColumnOrder,
		setColumnVisibility,
		setSorting,
	} = useTablePreferences({
		defaultColumnOrder: PartyManagementDefaultColumnOrder,
		defaultColumnVisibility: PartyManagementDefaultColumnVisibility,
		defaultSorting: PartyManagementDefaultSorting,
		moduleKey: PartyManagementTablePreferencesModuleKey,
		storageKey: PartyManagementTablePreferencesStorageKey,
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
	>("Active");
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
		statusFilter !== "Active";
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
		retry: false,
	});
	const pagedRecords = pageQuery.data ?? {
		records: [],
		totalRows: 0,
	};
	const tableData = useMemo<PartyInformationTableRecord[]>(
		() =>
			pagedRecords.records.map((record) => ({
				...record,
				billingAddressLabel: formatPartyAddress(
					getPartyAddressByRole(record, "billing"),
				),
				homeAddressLabel: formatPartyAddress(
					getPartyAddressByRole(record, "home"),
				),
				name: getPartyDisplayName(record),
				partyTypesLabel: record.partyTypes.join(", "),
				deliveryAddressLabel: formatPartyAddress(
					getPartyAddressByRole(record, "delivery"),
				),
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
		initialState: {
			columnOrder: PartyManagementDefaultColumnOrder,
			columnVisibility: PartyManagementDefaultColumnVisibility,
			sorting: PartyManagementDefaultSorting,
		},
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
		setStatusFilterState("Active");
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
		billingAddressLabel: formatPartyAddress(
			getPartyAddressByRole(record, "billing"),
		),
		homeAddressLabel: formatPartyAddress(getPartyAddressByRole(record, "home")),
		name: getPartyDisplayName(record),
		partyTypesLabel: record.partyTypes.join(", "),
		deliveryAddressLabel: formatPartyAddress(
			getPartyAddressByRole(record, "delivery"),
		),
	};
}

function filterPartyManagementRecords(
	records: PartyInformationRecord[],
	query: PartyManagementListQuery,
) {
	const normalizedQuery = normalizeLowercaseText(query.query);

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
				record.partyCodeNo.toLowerCase().includes(normalizedQuery) ||
				record.partyEntityType.toLowerCase().includes(normalizedQuery) ||
				record.contactPerson.toLowerCase().includes(normalizedQuery) ||
				record.email.toLowerCase().includes(normalizedQuery) ||
				record.contactNo.toLowerCase().includes(normalizedQuery) ||
				record.tin.toLowerCase().includes(normalizedQuery) ||
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
		case "billingAddressLabel":
			return formatPartyAddress(getPartyAddressByRole(record, "billing"));
		case "classification":
			return record.classification;
		case "civilStatus":
			return record.civilStatus ?? "";
		case "contactPerson":
			return record.contactPerson;
		case "contactNo":
			return record.contactNo;
		case "createdAt":
			return record.createdAt;
		case "createdBy":
			return record.createdBy ?? "";
		case "email":
			return record.email;
		case "gender":
			return record.gender ?? "";
		case "homeAddressLabel":
			return formatPartyAddress(getPartyAddressByRole(record, "home"));
		case "landline":
			return record.landline ?? "";
		case "memberRegistrationDate":
			return record.memberRegistrationDate ?? "";
		case "name":
			return getPartyDisplayName(record);
		case "nationality":
			return record.nationality ?? "";
		case "partyTypesLabel":
			return record.partyTypes.join(", ");
		case "partyEntityType":
			return record.partyEntityType;
		case "partyCodeNo":
			return record.partyCodeNo;
		case "deliveryAddressLabel":
			return formatPartyAddress(getPartyAddressByRole(record, "delivery"));
		case "status":
			return record.status;
		case "tin":
			return record.tin;
		case "updatedAt":
			return record.updatedAt;
		case "updatedBy":
			return record.updatedBy ?? "";
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

function formatPartyAddress(address?: PartyInformationRecord["address"] | null) {
	if (!address) {
		return "";
	}

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
		.join(", ") || "";
}

function getPartyAddressByRole(
	record: PartyInformationRecord,
	role: "billing" | "delivery" | "home",
) {
	const addresses = record.addresses.length > 0 ? record.addresses : [record.address];

	return addresses.find((address) => {
		if (role === "billing") return address.isBilling;
		if (role === "home") return address.isHome;
		return address.isDelivery;
	});
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
