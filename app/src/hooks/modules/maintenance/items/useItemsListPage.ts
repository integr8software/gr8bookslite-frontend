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
import { ItemsTableColumns } from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import type {
	ItemRecord,
	ItemStatus,
	ItemTableColumnKey,
} from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import { useItemManagementStore } from "@/app/src/hooks/modules/maintenance/items/useItemManagement";

const AllItemCategoriesFilter = "All";
const AllItemStatusesFilter = "All";
const DefaultItemStatusFilter = "Active";

export function useItemsListPage() {
	const { isLoading, isMutating, items, lastSyncedAt, updateItem } =
		useItemManagementStore();
	const [categoryFilter, setCategoryFilterState] = useState(
		AllItemCategoriesFilter,
	);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilterState] = useState<
		ItemStatus | typeof AllItemStatusesFilter
	>(DefaultItemStatusFilter);
	const [pendingStatusItem, setPendingStatusItem] =
		useState<ItemRecord | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const filteredItems = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return items.filter((item) =>
			(categoryFilter === AllItemCategoriesFilter ||
				item.category === categoryFilter) &&
			(statusFilter === AllItemStatusesFilter ||
				item.status === statusFilter) &&
			(!normalizedQuery ||
				[
					item.code,
					item.skuCode,
					item.name,
					item.category,
					item.model,
					item.brand,
					item.barcode,
					item.status,
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery)),
		);
	}, [
		categoryFilter,
		items,
		query,
		statusFilter,
	]);
	const categoryFilterOptions = useMemo(
		() =>
			Array.from(
				new Set(
					items
						.map((item) => item.category)
						.filter((category) => category.trim().length > 0),
				),
			).sort((first, second) => first.localeCompare(second)),
		[items],
	);
	const columns = useMemo<ColumnDef<ItemRecord>[]>(
		() =>
			ItemsTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createItemColumn(column.key, column.label, column.className);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredItems,
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

	function resetFilters() {
		setCategoryFilterState(AllItemCategoriesFilter);
		setQuery("");
		setStatusFilterState(DefaultItemStatusFilter);
		table.setPageIndex(0);
	}

	function setCategoryFilter(value: string) {
		setCategoryFilterState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: string) {
		setStatusFilterState(value as ItemStatus | typeof AllItemStatusesFilter);
		table.setPageIndex(0);
	}

	function handleConfirmStatusChange() {
		if (!pendingStatusItem) {
			return;
		}

		updateItem({
			...pendingStatusItem,
			status: pendingStatusItem.status === "Active" ? "Inactive" : "Active",
		});
		setPendingStatusItem(null);
	}

	return {
		categoryFilter,
		categoryFilterOptions,
		handleConfirmStatusChange,
		handleQueryChange,
		items,
		isLoading,
		isMutating,
		lastSyncedAt,
		pendingStatusItem,
		query,
		resetFilters,
		setCategoryFilter,
		setPendingStatusItem,
		setStatusFilter,
		statusFilter,
		table,
	};
}

function createItemColumn(
	key: ItemTableColumnKey,
	header: string,
	className: string,
): ColumnDef<ItemRecord> {
	if (key === "sellingPrice" || key === "costPrice") {
		return {
			id: key,
			header,
			accessorFn: (item) =>
				key === "sellingPrice" ? item.sellingPrice : item.costPrice,
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
