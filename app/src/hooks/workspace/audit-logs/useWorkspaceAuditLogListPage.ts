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
import { useQuery } from "@tanstack/react-query";
import { WorkspaceAuditLogTableColumns } from "@/app/src/constants/workspace/audit-logs/WorkspaceAuditLogConstants";
import {
	formatWorkspaceAuditLogCreatedAt,
	getWorkspaceAuditLogBranchOptions,
	getWorkspaceAuditLogModuleOptions,
	queryWorkspaceAuditLogRecords,
} from "@/app/src/data/workspace/audit-logs/WorkspaceAuditLogData";
import { GetWorkspaceAuditLogs } from "@/app/src/services/workspace/audit-logs/WorkspaceAuditLogApi";
import { WorkspaceAuditLogQueryKeys } from "@/app/src/services/workspace/audit-logs/WorkspaceAuditLogQueryKeys";
import type {
	WorkspaceAuditLogAction,
	WorkspaceAuditLogDateRange,
	WorkspaceAuditLogFilters,
	WorkspaceAuditLogRecord,
	WorkspaceAuditLogSeverity,
	WorkspaceAuditLogTableColumnKey,
} from "@/app/src/types/workspace/audit-logs/WorkspaceAuditLogTypes";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

const InitialFilters: WorkspaceAuditLogFilters = {
	action: "all",
	branchId: "all",
	dateRange: "30d",
	module: "all",
	query: "",
	severity: "all",
};
const EmptyWorkspaceAuditLogRecords: WorkspaceAuditLogRecord[] = [];

export function useWorkspaceAuditLogListPage({
	initialRecords = EmptyWorkspaceAuditLogRecords,
}: {
	initialRecords?: WorkspaceAuditLogRecord[];
} = {}) {
	const [filters, setFilters] =
		useState<WorkspaceAuditLogFilters>(InitialFilters);
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);
	const recordsQuery = useQuery({
		queryKey: WorkspaceAuditLogQueryKeys.records(),
		queryFn: GetWorkspaceAuditLogs,
		initialData: initialRecords,
	});
	const records = recordsQuery.data ?? EmptyWorkspaceAuditLogRecords;
	const queryResult = useMemo(
		() => queryWorkspaceAuditLogRecords(filters, records),
		[filters, records],
	);
	const columns = useMemo<ColumnDef<WorkspaceAuditLogRecord>[]>(
		() =>
			WorkspaceAuditLogTableColumns.map((column) =>
				createWorkspaceAuditLogColumn(
					column.key,
					column.label,
					column.className,
				),
			),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		columns,
		data: queryResult.records,
		state: {
			pagination,
			sorting,
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
	});
	const criticalCount = queryResult.records.filter(
		(record) => record.severity === "Critical",
	).length;
	const branchCount = new Set(
		queryResult.records.map((record) => record.branchId),
	).size;

	function updateFilters(nextFilters: Partial<WorkspaceAuditLogFilters>) {
		setFilters((current) => ({ ...current, ...nextFilters }));
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function resetFilters() {
		setFilters(InitialFilters);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		actionFilter: filters.action,
		branchFilter: filters.branchId,
		branchOptions: getWorkspaceAuditLogBranchOptions(records),
		branchCount,
		criticalCount,
		dateRangeFilter: filters.dateRange,
		filteredCount: queryResult.totalMatched,
		isError: recordsQuery.isError,
		isLoading: recordsQuery.isLoading,
		moduleFilter: filters.module,
		moduleOptions: getWorkspaceAuditLogModuleOptions(records),
		query: filters.query,
		recordCount: records.length,
		resetFilters,
		severityFilter: filters.severity,
		table,
		setActionFilter: (action: WorkspaceAuditLogAction | "all") =>
			updateFilters({ action }),
		setBranchFilter: (branchId: string) => updateFilters({ branchId }),
		setDateRangeFilter: (dateRange: WorkspaceAuditLogDateRange) =>
			updateFilters({ dateRange }),
		setModuleFilter: (module: string) => updateFilters({ module }),
		setQuery: (query: string) => updateFilters({ query }),
		setSeverityFilter: (severity: WorkspaceAuditLogSeverity | "all") =>
			updateFilters({ severity }),
	};
}

function createWorkspaceAuditLogColumn(
	key: WorkspaceAuditLogTableColumnKey,
	label: string,
	className: string,
): ColumnDef<WorkspaceAuditLogRecord> {
	if (key === "createdAt") {
		return {
			id: key,
			accessorFn: (record) =>
				formatWorkspaceAuditLogCreatedAt(record.createdAt),
			header: label,
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		header: label,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
