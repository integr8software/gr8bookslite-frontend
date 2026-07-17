"use client";

import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type ColumnDef,
	type PaginationState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	UnitOfMeasurementDefaultColumnOrder,
	UnitOfMeasurementDefaultColumnVisibility,
	UnitOfMeasurementDefaultSorting,
	UnitOfMeasurementTableColumns,
	UnitOfMeasurementTablePreferencesModuleKey,
	UnitOfMeasurementTablePreferencesStorageKey,
} from "@/app/src/constants/modules/maintenance/unit-of-measurement/UnitOfMeasurementConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import {
	createUnitOfMeasurement,
	fetchUnitsOfMeasurement,
	importUnitsOfMeasurement,
	updateUnitOfMeasurement,
} from "@/app/src/services/modules/maintenance/unit-of-measurement/UnitOfMeasurementApi";
import { ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import { UnitOfMeasurementQueryKeys } from "@/app/src/services/modules/maintenance/unit-of-measurement/UnitOfMeasurementQueryKeys";
import type {
	UnitOfMeasurementDrawerState,
	UnitOfMeasurementFormValues,
	UnitOfMeasurementListPageState,
	UnitOfMeasurementPermissions,
	UnitOfMeasurementQuantityModeFilter,
	UnitOfMeasurementRecord,
	UnitOfMeasurementStatistics,
	UnitOfMeasurementTableColumnKey,
} from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";

const EmptyUnitOfMeasurementPermissions: UnitOfMeasurementPermissions = {
	canView: false,
	canCreate: false,
	canUpdate: false,
	canExport: false,
	canImport: false,
};

const ReservedRoleUnitOfMeasurementPermissions: UnitOfMeasurementPermissions = {
	canView: true,
	canCreate: true,
	canUpdate: true,
	canExport: true,
	canImport: true,
};

const EmptyUnitOfMeasurementStatistics: UnitOfMeasurementStatistics = {
	totalUnits: 0,
	activeUnits: 0,
	inactiveUnits: 0,
	decimalUnits: 0,
};

const EmptyUnitOfMeasurementRecords: UnitOfMeasurementRecord[] = [];

export function useUnitOfMeasurementListPage(): UnitOfMeasurementListPageState {
	const queryClient = useQueryClient();
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const recordsQuery = useQuery({
		queryKey: UnitOfMeasurementQueryKeys.list(),
		queryFn: fetchUnitsOfMeasurement,
	});
	const [drawer, setDrawer] = useState<UnitOfMeasurementDrawerState>(null);
	const [pendingStatusRecord, setPendingStatusRecord] =
		useState<UnitOfMeasurementRecord | null>(null);
	const [query, setQuery] = useState("");
	const [quantityModeFilter, setQuantityModeFilter] =
		useState<UnitOfMeasurementQuantityModeFilter>("All");
	const [statusFilter, setStatusFilter] = useState("Active");
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
		defaultColumnOrder: UnitOfMeasurementDefaultColumnOrder,
		defaultColumnVisibility: UnitOfMeasurementDefaultColumnVisibility,
		defaultSorting: UnitOfMeasurementDefaultSorting,
		moduleKey: UnitOfMeasurementTablePreferencesModuleKey,
		storageKey: UnitOfMeasurementTablePreferencesStorageKey,
	});
	const records = recordsQuery.data?.records ?? EmptyUnitOfMeasurementRecords;
	const effectiveRole = ResolveAuthProfileEffectiveRole(authProfileQuery.data);
	const hasReservedRoleAccess =
		effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
	const permissions = hasReservedRoleAccess
		? ReservedRoleUnitOfMeasurementPermissions
		: (recordsQuery.data?.permissions ?? EmptyUnitOfMeasurementPermissions);
	const statistics =
		recordsQuery.data?.statistics ?? EmptyUnitOfMeasurementStatistics;
	const createMutation = useMutation({
		mutationFn: createUnitOfMeasurement,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: UnitOfMeasurementQueryKeys.all(),
			});
			toast.success("Unit of measurement created successfully.");
		},
	});
	const updateMutation = useMutation({
		mutationFn: updateUnitOfMeasurement,
		onSuccess: (_, updatedRecord) => {
			const previousRecord = recordsQuery.data?.records.find(
				(record) => record.id === updatedRecord.id,
			);
			const didStatusChange =
				previousRecord && previousRecord.status !== updatedRecord.status;

			void queryClient.invalidateQueries({
				queryKey: UnitOfMeasurementQueryKeys.all(),
			});
			toast.success(
				didStatusChange && updatedRecord.status === "Active"
					? "Unit of measurement activated successfully."
					: didStatusChange && updatedRecord.status === "Inactive"
						? "Unit of measurement deactivated successfully."
						: "Unit of measurement updated successfully.",
			);
		},
	});
	const importMutation = useMutation({
		mutationFn: importUnitsOfMeasurement,
		onSuccess: (importedRecords) => {
			void queryClient.invalidateQueries({
				queryKey: UnitOfMeasurementQueryKeys.all(),
			});
			toast.success(
				`${importedRecords.length} unit ${importedRecords.length === 1 ? "record" : "records"} imported successfully.`,
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not import units of measurement. Please try again.",
			);
		},
	});

	const filteredRecords = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return records.filter(
			(record) =>
				(quantityModeFilter === "All" ||
					record.quantityMode === quantityModeFilter) &&
				(statusFilter === "All" || record.status === statusFilter) &&
				(!normalizedQuery ||
					[record.name, record.symbol, record.quantityMode, record.status]
						.join(" ")
						.toLowerCase()
						.includes(normalizedQuery)),
		);
	}, [query, quantityModeFilter, records, statusFilter]);

	const tableColumns = useMemo<ColumnDef<UnitOfMeasurementRecord>[]>(
		() =>
			UnitOfMeasurementTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className, label: column.label },
					};
				}

				return createColumn(column.key, column.label, column.className);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredRecords,
		columns: tableColumns,
		initialState: {
			columnOrder: UnitOfMeasurementDefaultColumnOrder,
			columnVisibility: UnitOfMeasurementDefaultColumnVisibility,
			sorting: UnitOfMeasurementDefaultSorting,
		},
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
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	async function saveRecord(values: UnitOfMeasurementFormValues) {
		if (drawer?.mode === "edit" && drawer.record) {
			await updateMutation.mutateAsync({
				...drawer.record,
				...values,
			});
			setDrawer(null);
			return;
		}

		if (drawer?.mode === "add") {
			await createMutation.mutateAsync(values);
			setDrawer(null);
		}
	}

	function toggleStatus(record: UnitOfMeasurementRecord) {
		void updateMutation
			.mutateAsync({
				...record,
				status: record.status === "Active" ? "Inactive" : "Active",
			})
			.catch((error) => {
				toast.error(
					error instanceof Error
						? error.message
						: "Could not update unit of measurement. Please try again.",
				);
			});
	}

	function confirmStatusChange() {
		if (!pendingStatusRecord) {
			return;
		}

		toggleStatus(pendingStatusRecord);
		setPendingStatusRecord(null);
	}

	return {
		activeCount: statistics.activeUnits,
		decimalCount: statistics.decimalUnits,
		drawer,
		filteredRecords,
		isLoading: recordsQuery.isLoading,
		isMutating:
			createMutation.isPending ||
			updateMutation.isPending ||
			importMutation.isPending,
		isRefreshing: recordsQuery.isFetching && !recordsQuery.isLoading,
		lastSyncedAt: recordsQuery.dataUpdatedAt,
		pendingStatusRecord,
		permissions,
		quantityModeFilter,
		query,
		records,
		refreshRecords: () => {
			void queryClient.invalidateQueries({
				queryKey: UnitOfMeasurementQueryKeys.all(),
			});
		},
		importRecords: (nextRecords) =>
			importMutation.mutateAsync(nextRecords),
		statusFilter,
		table,
		closeDrawer: () => setDrawer(null),
		confirmStatusChange,
		openAddDrawer: () => setDrawer({ mode: "add" }),
		openEditDrawer: (record) => setDrawer({ mode: "edit", record }),
		openViewDrawer: (record) => setDrawer({ mode: "view", record }),
		saveRecord,
		setQuantityModeFilter: (value) => {
			setQuantityModeFilter(value);
			table.setPageIndex(0);
		},
		setQuery: (value) => {
			setQuery(value);
			table.setPageIndex(0);
		},
		setPendingStatusRecord,
		setStatusFilter: (value) => {
			setStatusFilter(value);
			table.setPageIndex(0);
		},
	};
}

function createColumn(
	key: UnitOfMeasurementTableColumnKey,
	header: string,
	className: string,
): ColumnDef<UnitOfMeasurementRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className, label: header },
	};
}
