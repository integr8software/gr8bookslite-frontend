"use client";

import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type PaginationState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ItemCategoryDefaultColumnOrder,
	ItemCategoryDefaultColumnVisibility,
	ItemCategoryDefaultSorting,
	ItemCategoryTableColumns,
	ItemCategoryTablePreferencesModuleKey,
	ItemCategoryTablePreferencesStorageKey,
} from "@/app/src/constants/modules/maintenance/item-category/ItemCategoryConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
	ItemCategoryTableColumnKey,
	ItemCategoryTableRowData,
} from "@/app/src/types/modules/maintenance/item-category/ItemCategoryTypes";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";

export function useItemCategoryTable(rows: ItemCategoryTableRowData[]) {
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
		defaultColumnOrder: ItemCategoryDefaultColumnOrder,
		defaultColumnVisibility: ItemCategoryDefaultColumnVisibility,
		defaultSorting: ItemCategoryDefaultSorting,
		moduleKey: ItemCategoryTablePreferencesModuleKey,
		storageKey: ItemCategoryTablePreferencesStorageKey,
	});
	const columns = useMemo<ColumnDef<ItemCategoryTableRowData>[]>(
		() =>
			ItemCategoryTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className, label: column.label },
					};
				}

				return createItemCategoryColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	return useReactTable({
		data: rows,
		columns,
		initialState: {
			columnOrder: ItemCategoryDefaultColumnOrder,
			columnVisibility: ItemCategoryDefaultColumnVisibility,
			sorting: ItemCategoryDefaultSorting,
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
}

function createItemCategoryColumn(
	key: ItemCategoryTableColumnKey,
	header: string,
	className: string,
): ColumnDef<ItemCategoryTableRowData> {
	if (key === "name") {
		return {
			id: key,
			accessorFn: (row) => row.record.name,
			header,
			sortingFn: (rowA, rowB) =>
				compareItemCategoryHierarchyRows(rowA.original, rowB.original),
			meta: { className, label: header },
		};
	}

	if (key === "status") {
		return {
			id: key,
			accessorFn: (row) => row.record.status,
			header,
			sortingFn: "alphanumeric",
			meta: { className, label: header },
		};
	}

	if (
		key === "createdBy" ||
		key === "createdAt" ||
		key === "updatedBy" ||
		key === "updatedAt"
	) {
		return {
			id: key,
			accessorFn: (row) => row.record[key] ?? "",
			header,
			sortingFn: "alphanumeric",
			meta: { className, label: header },
		};
	}

	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className, label: header },
	};
}

function compareItemCategoryHierarchyRows(
	rowA: ItemCategoryTableRowData,
	rowB: ItemCategoryTableRowData,
) {
	const pathA = getComparablePathSegments(rowA);
	const pathB = getComparablePathSegments(rowB);
	const segmentCount = Math.min(pathA.length, pathB.length);

	for (let index = 0; index < segmentCount; index += 1) {
		const comparison = pathA[index].localeCompare(pathB[index]);

		if (comparison !== 0) {
			return comparison;
		}
	}

	if (pathA.length !== pathB.length) {
		return 0;
	}

	return rowA.record.name.localeCompare(rowB.record.name);
}

function getComparablePathSegments(row: ItemCategoryTableRowData) {
	return row.pathName
		.split("/")
		.filter(Boolean)
		.map((segment) => normalizeLowercaseText(segment));
}
