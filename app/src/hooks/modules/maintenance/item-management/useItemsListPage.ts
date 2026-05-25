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
import { ItemsTableColumns } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type {
	ItemRecord,
	ItemStatus,
	ItemTableColumnKey,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { useItemManagementStore } from "@/app/src/hooks/modules/maintenance/item-management/useItemManagement";

const AllItemCategoriesFilter = "All";
const AllItemStatusesFilter = "All";

export function useItemsListPage() {
	const { deleteItem, isLoading, isMutating, items } = useItemManagementStore();
	const [categoryFilter, setCategoryFilterState] = useState(
		AllItemCategoriesFilter,
	);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilterState] = useState<
		ItemStatus | typeof AllItemStatusesFilter
	>(AllItemStatusesFilter);
	const [pendingDeleteItem, setPendingDeleteItem] =
		useState<ItemRecord | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const filteredItems = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

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
					item.subcategory,
					item.type,
					item.subtype,
					item.brand,
					item.barcode,
					item.supplier,
					...(item.suppliers ?? []).map((supplier) => supplier.supplier),
					item.status,
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery)),
		);
	}, [categoryFilter, items, query, statusFilter]);
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
		setStatusFilterState(AllItemStatusesFilter);
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

	function handleConfirmDelete() {
		if (!pendingDeleteItem) {
			return;
		}

		deleteItem(pendingDeleteItem.id);
		setPendingDeleteItem(null);
	}

	return {
		categoryFilter,
		categoryFilterOptions,
		handleConfirmDelete,
		handleQueryChange,
		items,
		isLoading,
		isMutating,
		pendingDeleteItem,
		query,
		resetFilters,
		setCategoryFilter,
		setPendingDeleteItem,
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
	if (key === "sellingPrice") {
		return {
			id: key,
			header,
			accessorFn: (item) => item.sellingPrice,
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
