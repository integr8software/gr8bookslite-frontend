"use client";

import { useMemo, useState } from "react";
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
	formatAuditTrailModuleTrail,
} from "@/app/src/services/modules/system-administration/audit-trail/AuditTrailFormatters";
import type {
	AuditTrailAction,
	AuditTrailRecord,
	AuditTrailSeverity,
	AuditTrailTableColumnKey,
} from "@/app/src/types/modules/system-administration/audit-trail/AuditTrailTypes";

export function useAuditTrailListPage() {
	const [query, setQuery] = useState("");
	const [moduleFilter, setModuleFilter] = useState("all");
	const [actionFilter, setActionFilter] = useState<AuditTrailAction | "all">(
		"all",
	);
	const [severityFilter, setSeverityFilter] = useState<
		AuditTrailSeverity | "all"
	>("all");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return MockAuditTrailRecords.filter((record) => {
			if (moduleFilter !== "all" && record.moduleKey !== moduleFilter) {
				return false;
			}

			if (actionFilter !== "all" && record.action !== actionFilter) {
				return false;
			}

			if (severityFilter !== "all" && record.severity !== severityFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				record.action,
				record.actorName,
				record.actorRole,
				record.description,
				record.ipAddress,
				record.moduleLabel,
				record.recordId,
				record.section,
				record.severity,
				formatAuditTrailModuleTrail(record),
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [actionFilter, moduleFilter, query, severityFilter]);
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

	function handleSeverityFilterChange(value: AuditTrailSeverity | "all") {
		setSeverityFilter(value);
		table.setPageIndex(0);
	}

	return {
		actionFilter,
		criticalCount: MockAuditTrailRecords.filter(
			(record) => record.severity === "Critical",
		).length,
		handleActionFilterChange,
		handleModuleFilterChange,
		handleQueryChange,
		handleSeverityFilterChange,
		moduleFilter,
		moduleOptions: AuditTrailModuleOptions,
		query,
		recordCount: MockAuditTrailRecords.length,
		severityFilter,
		table,
		todayCount: MockAuditTrailRecords.filter((record) =>
			record.createdAt.startsWith("2026-05-23"),
		).length,
	};
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
