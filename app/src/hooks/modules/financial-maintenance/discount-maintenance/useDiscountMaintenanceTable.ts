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
	DiscountMaintenanceDefaultColumnOrder,
	DiscountMaintenanceDefaultColumnVisibility,
	DiscountMaintenanceDefaultSorting,
	DiscountMaintenanceTableColumns,
	DiscountMaintenanceTablePreferencesModuleKey,
	DiscountMaintenanceTablePreferencesStorageKey,
} from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import { createDiscountMaintenanceTableRecord } from "@/app/src/data/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceData";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
	Discount,
	DiscountMaintenanceTableColumnKey,
	DiscountMaintenanceTableRecord,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";

export function useDiscountMaintenanceTable(discounts: Discount[]) {
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
		defaultColumnOrder: DiscountMaintenanceDefaultColumnOrder,
		defaultColumnVisibility: DiscountMaintenanceDefaultColumnVisibility,
		defaultSorting: DiscountMaintenanceDefaultSorting,
		moduleKey: DiscountMaintenanceTablePreferencesModuleKey,
		storageKey: DiscountMaintenanceTablePreferencesStorageKey,
	});
	const tableData = useMemo<DiscountMaintenanceTableRecord[]>(
		() => discounts.map(createDiscountMaintenanceTableRecord),
		[discounts],
	);
	const columns = useMemo<ColumnDef<DiscountMaintenanceTableRecord>[]>(
		() =>
			DiscountMaintenanceTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className, label: column.label },
					};
				}

				return createDiscountMaintenanceColumn(
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
			columnOrder: DiscountMaintenanceDefaultColumnOrder,
			columnVisibility: DiscountMaintenanceDefaultColumnVisibility,
			sorting: DiscountMaintenanceDefaultSorting,
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

function createDiscountMaintenanceColumn(
	key: DiscountMaintenanceTableColumnKey,
	header: string,
	className: string,
): ColumnDef<DiscountMaintenanceTableRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className, label: header },
	};
}


