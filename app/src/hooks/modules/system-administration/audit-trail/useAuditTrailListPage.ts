"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { AuditTrailTableColumns } from "@/app/src/constants/modules/system-administration/audit-trail/AuditTrailConstants";
import {
	AuditTrailModuleOptions,
	MockAuditTrailRecords,
} from "@/app/src/data/modules/system-administration/audit-trail/AuditTrailData";
import {
	formatAuditTrailCreatedAt,
} from "@/app/src/services/modules/system-administration/audit-trail/AuditTrailFormatters";
import { AuditTrailQueryKeys } from "@/app/src/services/modules/system-administration/audit-trail/AuditTrailQueryKeys";
import type {
	AuditTrailAction,
	AuditTrailDateRange,
	AuditTrailRecord,
	AuditTrailTableColumnKey,
} from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";

export function useAuditTrailListPage() {
	const recordsQuery = useQuery({
		queryKey: AuditTrailQueryKeys.records(),
		queryFn: async () => MockAuditTrailRecords,
		initialData: MockAuditTrailRecords,
	});
	const [query, setQuery] = useState("");
	const [moduleFilter, setModuleFilter] = useState("all");
	const [actionFilter, setActionFilter] = useState<AuditTrailAction | "all">(
		"all",
	);
	const [dateRangeFilter, setDateRangeFilter] =
		useState<AuditTrailDateRange>("30d");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return recordsQuery.data.filter((record) => {
			if (moduleFilter !== "all" && record.moduleKey !== moduleFilter) {
				return false;
			}

			if (actionFilter !== "all" && record.action !== actionFilter) {
				return false;
			}

			if (!isWithinDateRange(record.createdAt, dateRangeFilter)) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				record.action,
				record.actorName,
				record.actorRole,
				record.branchName,
				record.description,
				record.entityId,
				record.entityType,
				record.ipAddress,
				record.module,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [actionFilter, dateRangeFilter, moduleFilter, query, recordsQuery.data]);
	const columns = useMemo<ColumnDef<AuditTrailRecord>[]>(
		() =>
			AuditTrailTableColumns.map((column) =>
				createAuditTrailColumn({
					className: column.className,
					header: column.label,
					key: column.key,
				}),
			),
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

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function handleModuleFilterChange(value: string) {
		setModuleFilter(value);
		table.setPageIndex(0);
	}

	function handleActionFilterChange(value: AuditTrailAction | "all") {
		setActionFilter(value);
		table.setPageIndex(0);
	}

	function handleDateRangeFilterChange(value: AuditTrailDateRange) {
		setDateRangeFilter(value);
		table.setPageIndex(0);
	}

	return {
		actionFilter,
		dateRangeFilter,
		filteredCount: filteredRecords.length,
		handleActionFilterChange,
		handleDateRangeFilterChange,
		handleModuleFilterChange,
		handleQueryChange,
		isLoading: recordsQuery.isLoading,
		lastSyncedAt: recordsQuery.dataUpdatedAt,
		moduleFilter,
		moduleOptions: AuditTrailModuleOptions,
		matchedModuleCount: new Set(
			filteredRecords.map((record) => record.moduleKey),
		).size,
		query,
		recordCount: recordsQuery.data.length,
		table,
		todayCount: recordsQuery.data.filter((record) =>
			record.createdAt.startsWith("2026-05-23"),
		).length,
	};
}

function isWithinDateRange(createdAt: string, dateRange: AuditTrailDateRange) {
	if (dateRange === "all") {
		return true;
	}

	const rangeHours: Record<Exclude<AuditTrailDateRange, "all">, number> = {
		"24h": 24,
		"7d": 24 * 7,
		"30d": 24 * 30,
	};
	const minimumTimestamp =
		Date.now() - rangeHours[dateRange] * 60 * 60 * 1000;

	return new Date(createdAt).getTime() >= minimumTimestamp;
}

function createAuditTrailColumn({
	className,
	header,
	key,
}: {
	className: string;
	header: string;
	key: AuditTrailTableColumnKey;
}): ColumnDef<AuditTrailRecord> {
	if (key === "createdAt") {
		return {
			id: key,
			header,
			accessorFn: (record) => formatAuditTrailCreatedAt(record.createdAt),
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
