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
	TermManagementDefaultColumnOrder,
	TermManagementDefaultColumnVisibility,
	TermManagementDefaultSorting,
	TermManagementTableColumns,
	TermManagementTablePreferencesModuleKey,
	TermManagementTablePreferencesStorageKey,
} from "@/app/src/constants/modules/financial-maintenance/term-management/TermManagementConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
	TermManagement,
	TermManagementTableColumnKey,
} from "@/app/src/types/modules/financial-maintenance/term-management/TermManagementTypes";

export function useTermManagementTable(terms: TermManagement[]) {
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
		defaultColumnOrder: TermManagementDefaultColumnOrder,
		defaultColumnVisibility: TermManagementDefaultColumnVisibility,
		defaultSorting: TermManagementDefaultSorting,
		moduleKey: TermManagementTablePreferencesModuleKey,
		storageKey: TermManagementTablePreferencesStorageKey,
	});
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
		initialState: {
			columnOrder: TermManagementDefaultColumnOrder,
			columnVisibility: TermManagementDefaultColumnVisibility,
			sorting: TermManagementDefaultSorting,
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

