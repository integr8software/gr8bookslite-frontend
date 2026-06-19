"use client";

import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type ColumnOrderState,
	type PaginationState,
	type SortingState,
	type VisibilityState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { TermManagementTableColumns } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type {
	TermManagement,
	TermManagementTableColumnKey,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export function useTermManagementTable(terms: TermManagement[]) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
		TermManagementTableColumns.map((column) =>
			"key" in column ? column.key : "actions",
		),
	);
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>({
			description: false,
		});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const columns = useMemo<ColumnDef<TermManagement>[]>(
		() =>
			TermManagementTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className, label: column.label },
					};
				}

				return createTermManagementColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	return useReactTable({
		data: terms,
		columns,
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

function createTermManagementColumn(
	key: TermManagementTableColumnKey,
	header: string,
	className: string,
): ColumnDef<TermManagement> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className, label: header },
	};
}
