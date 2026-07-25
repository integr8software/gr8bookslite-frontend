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
	DiscountManagementDefaultColumnOrder,
	DiscountManagementDefaultColumnVisibility,
	DiscountManagementDefaultSorting,
	DiscountManagementTableColumns,
	DiscountManagementTablePreferencesModuleKey,
	DiscountManagementTablePreferencesStorageKey,
} from "@/app/src/constants/modules/financial-maintenance/discount-management/DiscountManagementConstants";
import { createDiscountManagementTableRecord } from "@/app/src/data/modules/financial-maintenance/discount-management/DiscountManagementData";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
	Discount,
	DiscountManagementTableColumnKey,
	DiscountManagementTableRecord,
} from "@/app/src/types/modules/financial-maintenance/discount-management/DiscountManagementTypes";

export function useDiscountManagementTable(discounts: Discount[]) {
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
		defaultColumnOrder: DiscountManagementDefaultColumnOrder,
		defaultColumnVisibility: DiscountManagementDefaultColumnVisibility,
		defaultSorting: DiscountManagementDefaultSorting,
		moduleKey: DiscountManagementTablePreferencesModuleKey,
		storageKey: DiscountManagementTablePreferencesStorageKey,
	});
	const tableData = useMemo<DiscountManagementTableRecord[]>(
		() => discounts.map(createDiscountManagementTableRecord),
		[discounts],
	);
	const columns = useMemo<ColumnDef<DiscountManagementTableRecord>[]>(
		() =>
			DiscountManagementTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className, label: column.label },
					};
				}

				return createDiscountManagementColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	return useReactTable({
		data: tableData,
		columns,
		initialState: {
			columnOrder: DiscountManagementDefaultColumnOrder,
			columnVisibility: DiscountManagementDefaultColumnVisibility,
			sorting: DiscountManagementDefaultSorting,
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

function createDiscountManagementColumn(
	key: DiscountManagementTableColumnKey,
	header: string,
	className: string,
): ColumnDef<DiscountManagementTableRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className, label: header },
	};
}


