"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import {
	MasterAddOnTableColumns,
	type MasterAddOnStatusFilterValue,
} from "@/app/src/constants/master/add-ons/MasterAddOnConstants";
import { MasterAddOnMockRecords } from "@/app/src/data/master/add-ons/MasterAddOnMockData";
import type {
	MasterAddOnRecord,
	MasterAddOnTableColumnKey,
} from "@/app/src/types/master/add-ons/MasterAddOnTypes";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

export function useMasterAddOnListPage() {
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] =
		useState<MasterAddOnStatusFilterValue>("ALL");
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);

	// Mock data — replace with a real query when the backend is ready.
	const records = useMemo(() => MasterAddOnMockRecords, []);
	const isLoading = false;

	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return records.filter(
			(record) =>
				(statusFilter === "ALL" || record.status === statusFilter) &&
				(!normalizedQuery ||
					[
						record.name,
						record.code,
						record.description,
						record.status,
						`${record.pricing.monthlyPrice}`,
						`${record.pricing.yearlyPrice}`,
					]
						.join(" ")
						.toLowerCase()
						.includes(normalizedQuery)),
		);
	}, [query, records, statusFilter]);

	const columns = useMemo<ColumnDef<MasterAddOnRecord>[]>(
		() =>
			MasterAddOnTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createColumn(column.key, column.label, column.className);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		columns,
		data: filteredRecords,
		state: {
			pagination,
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
	});

	const summary = useMemo(() => {
		const activeAddOns = records.filter(
			(record) => record.status === "Active",
		).length;
		const inactiveAddOns = records.filter(
			(record) => record.status === "Inactive",
		).length;
		const linkedModules = new Set(
			records.flatMap((record) => record.featureIds),
		).size;

		return {
			activeAddOns,
			inactiveAddOns,
			linkedModules,
			totalAddOns: records.length,
		};
	}, [records]);

	function toggleRecordStatus(recordId: string) {
		const record = records.find((candidate) => candidate.id === recordId);

		if (!record) {
			return;
		}

		toast(
			"Status update is not connected yet. Open Edit for add-on changes.",
		);
	}

	function resetFilters() {
		setQuery("");
		setStatusFilter("ALL");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		filteredRecords,
		hasActiveFilters:
			query.trim().length > 0 || statusFilter !== "ALL",
		isLoading,
		isRefreshing: false,
		lastSyncedAt: Date.now(),
		query,
		records,
		resetFilters,
		setQuery,
		setStatusFilter,
		statusFilter,
		summary,
		table,
		toggleRecordStatus,
	};
}

function createColumn(
	key: MasterAddOnTableColumnKey,
	label: string,
	className: string,
): ColumnDef<MasterAddOnRecord> {
	if (key === "pricing") {
		return {
			id: key,
			accessorFn: (record) =>
				`PHP ${record.pricing.monthlyPrice.toFixed(2)} / month`,
			header: label,
			enableSorting: false,
			meta: { className },
		};
	}

	if (key === "modules") {
		return {
			id: key,
			accessorFn: (record) => `${record.featureIds.length} module(s)`,
			header: label,
			enableSorting: false,
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		header: label,
		enableSorting: false,
		meta: { className },
	};
}
