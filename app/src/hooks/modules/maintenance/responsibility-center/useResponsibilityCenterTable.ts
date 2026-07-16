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
	ResponsibilityCenterDefaultColumnOrder,
	ResponsibilityCenterDefaultColumnVisibility,
	ResponsibilityCenterDefaultSorting,
	ResponsibilityCenterTableColumns,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterTableColumnKey,
	ResponsibilityCenterTablePreferencesState,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";

export function useResponsibilityCenterTable(
	centers: ResponsibilityCenter[],
	preferences: ResponsibilityCenterTablePreferencesState,
) {
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
	} = preferences;

	const columns = useMemo<ColumnDef<ResponsibilityCenter>[]>(
		() =>
			ResponsibilityCenterTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className, label: column.label },
					};
				}

				return createResponsibilityCenterColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	return useReactTable({
		data: centers,
		columns,
		initialState: {
			columnOrder: ResponsibilityCenterDefaultColumnOrder,
			columnVisibility: ResponsibilityCenterDefaultColumnVisibility,
			sorting: ResponsibilityCenterDefaultSorting,
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

function createResponsibilityCenterColumn(
	key: ResponsibilityCenterTableColumnKey,
	header: string,
	className: string,
): ColumnDef<ResponsibilityCenter> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className, label: header },
	};
}
