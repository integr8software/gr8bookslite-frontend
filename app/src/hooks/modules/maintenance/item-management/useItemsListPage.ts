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
	ItemTableColumnKey,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { useItemManagementStore } from "./useItemManagement";

export function useItemsListPage() {
	const { deleteItem, isLoading, isMutating, items } = useItemManagementStore();
	const [query, setQuery] = useState("");
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

		if (!normalizedQuery) {
			return items;
		}

		return items.filter((item) =>
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
				.includes(normalizedQuery),
		);
	}, [items, query]);
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

	function handleConfirmDelete() {
		if (!pendingDeleteItem) {
			return;
		}

		deleteItem(pendingDeleteItem.id);
		setPendingDeleteItem(null);
	}

	return {
		handleConfirmDelete,
		handleQueryChange,
		isLoading,
		isMutating,
		pendingDeleteItem,
		query,
		setPendingDeleteItem,
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
