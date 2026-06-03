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
import {
	MasterAuditLogTableColumns,
	MasterAuditLogQueryResultLimit,
} from "@/app/src/constants/master/audit-logs/MasterAuditLogConstants";
import {
	MasterAuditLogCompanies,
	MasterAuditLogRecords,
	formatMasterAuditLogCreatedAt,
	getUniqueMasterAuditModules,
	queryMasterAuditLogRecords,
} from "@/app/src/data/master/audit-logs/MasterAuditLogData";
import type {
	MasterAuditLogAction,
	MasterAuditLogDateRange,
	MasterAuditLogFilters,
	MasterAuditLogRecord,
	MasterAuditLogResult,
	MasterAuditLogTableColumnKey,
} from "@/app/src/types/master/audit-logs/MasterAuditLogTypes";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

const InitialFilters: MasterAuditLogFilters = {
	action: "all",
	companyId: "all",
	dateRange: "30d",
	module: "all",
	query: "",
	result: "all",
};

export function useMasterAuditLogListPage() {
	const [filters, setFilters] =
		useState<MasterAuditLogFilters>(InitialFilters);
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);
	const queryResult = useMemo(
		() => queryMasterAuditLogRecords(filters),
		[filters],
	);
	const columns = useMemo<ColumnDef<MasterAuditLogRecord>[]>(
		() =>
			MasterAuditLogTableColumns.map((column) =>
				createMasterAuditLogColumn(column.key, column.label, column.className),
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
	const errorCount = queryResult.records.filter(
		(record) => record.result === "Error",
	).length;
	const successCount = queryResult.records.filter(
		(record) => record.result === "Success",
	).length;
	const uniqueCompanies = new Set(
		queryResult.records.map((record) => record.companyId),
	).size;

	function updateFilters(nextFilters: Partial<MasterAuditLogFilters>) {
		setFilters((current) => ({ ...current, ...nextFilters }));
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function resetFilters() {
		setFilters(InitialFilters);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		actionFilter: filters.action,
		companyFilter: filters.companyId,
		companyOptions: MasterAuditLogCompanies,
		dateRangeFilter: filters.dateRange,
		filteredCount: queryResult.totalMatched,
		isResultCapped:
			queryResult.totalMatched > MasterAuditLogQueryResultLimit,
		moduleFilter: filters.module,
		moduleOptions: getUniqueMasterAuditModules(),
		query: filters.query,
		recordCount: MasterAuditLogRecords.length,
		resetFilters,
		resultFilter: filters.result,
		errorCount,
		successCount,
		table,
		tableRecordCount: queryResult.records.length,
		uniqueCompanies,
		setActionFilter: (action: MasterAuditLogAction | "all") =>
			updateFilters({ action }),
		setCompanyFilter: (companyId: string) => updateFilters({ companyId }),
		setDateRangeFilter: (dateRange: MasterAuditLogDateRange) =>
			updateFilters({ dateRange }),
		setModuleFilter: (module: string) => updateFilters({ module }),
		setQuery: (query: string) => updateFilters({ query }),
		setResultFilter: (result: MasterAuditLogResult | "all") =>
			updateFilters({ result }),
	};
}

function createMasterAuditLogColumn(
	key: MasterAuditLogTableColumnKey,
	label: string,
	className: string,
): ColumnDef<MasterAuditLogRecord> {
	if (key === "createdAt") {
		return {
			id: key,
			accessorFn: (record) =>
				formatMasterAuditLogCreatedAt(record.createdAt),
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
