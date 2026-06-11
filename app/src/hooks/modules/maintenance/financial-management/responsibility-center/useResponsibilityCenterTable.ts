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
import { ResponsibilityCenterTableColumns } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterTableColumnKey,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

export function useResponsibilityCenterTable(
	centers: ResponsibilityCenter[],
) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const columns = useMemo<ColumnDef<ResponsibilityCenter>[]>(
		() =>
			ResponsibilityCenterTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
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
		meta: { className },
	};
}
