"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ItemBundlesTableColumns } from "@/app/src/constants/modules/maintenance/item-bundles/ItemBundlesConstants";
import {
	createItemBundleListRecords,
} from "@/app/src/data/modules/maintenance/item-bundles/ItemBundlesData";
import { MockItems } from "@/app/src/data/modules/maintenance/items/ItemManagementData";
import { useItemBundles } from "@/app/src/hooks/modules/maintenance/item-bundles/useItemBundles";
import type {
	ItemBundleListRecord,
	ItemBundleTableColumnKey,
} from "@/app/src/types/modules/maintenance/item-bundles/ItemBundlesTypes";

export function useItemBundlesListPage() {
	const { bundles, isLoading, isMutating, lastSyncedAt, updateBundle } =
		useItemBundles();
	const [pendingStatusRow, setPendingStatusRow] =
		useState<ItemBundleListRecord | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("Active");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "bundleItem", desc: false },
	]);
	const records = useMemo(
		() => createItemBundleListRecords({ bundles, items: MockItems }),
		[bundles],
	);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return records.filter(
			(record) =>
				(statusFilter === "All" || record.status === statusFilter) &&
				(!normalizedQuery ||
					[
						record.code,
						record.bundleItem,
						record.components
							.map((component) => `${component.item} x${component.quantity}`)
							.join(" "),
						record.status,
					]
						.join(" ")
						.toLowerCase()
						.includes(normalizedQuery)),
		);
	}, [query, records, statusFilter]);
	const columns = useMemo<ColumnDef<ItemBundleListRecord>[]>(
		() =>
			ItemBundlesTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createItemBundleColumn(
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
		state: { pagination, sorting },
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	const activeCount = records.filter((row) => row.status === "Active").length;
	const nextPendingStatus =
		pendingStatusRow?.status === "Active" ? "Inactive" : "Active";

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function handleStatusFilterChange(value: string) {
		setStatusFilter(value);
		table.setPageIndex(0);
	}

	function resetFilters() {
		setQuery("");
		setStatusFilter("Active");
		table.setPageIndex(0);
	}

	function confirmStatusChange() {
		if (!pendingStatusRow) {
			return;
		}

		updateBundle({
			...pendingStatusRow,
			status: nextPendingStatus,
		});
		setPendingStatusRow(null);
	}

	return {
		activeCount,
		confirmStatusChange,
		isLoading,
		isMutating,
		lastSyncedAt,
		nextPendingStatus,
		pendingStatusRow,
		query,
		records,
		resetFilters,
		setPendingStatusRow,
		statusFilter,
		table,
		handleQueryChange,
		handleStatusFilterChange,
	};
}

function createItemBundleColumn(
	key: ItemBundleTableColumnKey,
	header: string,
	className: string,
): ColumnDef<ItemBundleListRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
